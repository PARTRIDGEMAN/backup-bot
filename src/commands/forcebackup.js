import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import db from '../database.js'
import backup from 'discord-backup'
import config from '../config.js'

export const forcebackupCmd = {
	data: new SlashCommandBuilder()
		.setName('forcebackup')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription('No description'),
	/**
	 *
	 * @param {import('discord.js').CommandInteraction} ctx
	 */
	async run(ctx) {
		if (!config.owners.includes(ctx.user.id)) {
			return ctx.reply({ ephemeral: true, content: 'Only bot owner(s) can use this command.' })
		}

		await ctx.deferReply({ ephemeral: true })

		const data = await backup.create(ctx.guild)
		const excludedChannelsIds = (await db.get(`${ctx.guildId}_exclude`).catch(() => null)) || []

		data.channels.categories = data.channels.categories.filter(
			(it) => !excludedChannelsIds.some((id) => ctx.guild.channels.cache.get(id)?.name === it.name)
		)
		data.channels.others = data.channels.others.filter(
			(it) => !excludedChannelsIds.some((id) => ctx.guild.channels.cache.get(id)?.name === it.name)
		)

		for (const cat of data.channels.categories) {
			cat.children = cat.children.filter(
				(it) => !excludedChannelsIds.some((id) => ctx.guild.channels.cache.get(id)?.name === it.name)
			)
		}

		await db.push(ctx.guild.id, data)

		await ctx.editReply('Backup saved successfully!')
	}
}
