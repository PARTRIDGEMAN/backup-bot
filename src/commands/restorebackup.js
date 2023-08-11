import {
	SlashCommandBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
	PermissionFlagsBits,
	StringSelectMenuBuilder
} from 'discord.js'
import db from '../database.js'
import backup from 'discord-backup'
import ms from 'ms'
import config from '../config.js'

export const restorebackupCmd = {
	data: new SlashCommandBuilder()
		.setName('restorebackup')
		.setDescription('No description')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	/**
	 *
	 * @param {import('discord.js').CommandInteraction} ctx
	 */
	async run(ctx) {
		if (!config.owners.includes(ctx.user.id)) {
			return ctx.reply({ ephemeral: true, content: 'Only bot owner(s) can use this command.' })
		}

		await ctx.deferReply({ ephemeral: true })

		const backups = (await db.get(ctx.guildId).catch(() => null)) || []

		if (!backups) {
			return ctx.editReply('No backup(s) data found.')
		}

		const msg = await ctx.editReply({
			content: 'Please choose your backup to restore',
			components: [
				new ActionRowBuilder().addComponents(
					new StringSelectMenuBuilder().setCustomId('backup_list').addOptions(
						...backups
							.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
							.slice(0, 25)
							.map((it, i) => ({
								label: new Date(it.createdTimestamp).toUTCString() + (i === 0 ? ' (Newest)' : ''),
								value: it.id
							}))
					)
				)
			]
		})

		const selected = await msg
			.awaitMessageComponent({
				time: ms('5 minutes'),
				filter: (i) =>
					i.isStringSelectMenu() &&
					i.customId === 'backup_list' &&
					i.user.id === ctx.user.id &&
					i.channelId === ctx.channelId
			})
			.catch(() => null)

		if (!selected) {
			return await msg.edit('Operation Canceled.').catch(() => null)
		}

		const data = backups.find((it) => it.id === selected.values[0])

		await selected.update({
			content: 'Are you sure you want to restore to the newest backup?',
			components: [
				new ActionRowBuilder().addComponents(
					new ButtonBuilder().setLabel('Confirm').setCustomId('confirmed').setStyle(ButtonStyle.Danger)
				)
			]
		})

		const confirmed = await msg
			.awaitMessageComponent({
				time: ms('10 seconds'),
				filter: (i) =>
					i.isButton() && i.customId === 'confirmed' && i.user.id === ctx.user.id && i.channelId === ctx.channelId
			})
			.catch(() => null)

		if (confirmed) {
			await backup.load(data, ctx.guild)
		} else {
			await msg.edit('Operation Canceled.').catch(() => null)
		}
	}
}
