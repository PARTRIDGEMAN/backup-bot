import db from '../database.js'
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import config from '../config.js'

export const backupExcludeCmd = {
	data: new SlashCommandBuilder()
		.setName('backup_exclude')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription('No description')
		.addChannelOption((i) => i.setName('channel').setDescription('The channel you want to exclude').setRequired(true)),
	/**
	 *
	 * @param {import('discord.js').ChatInputCommandInteraction} ctx
	 */
	async run(ctx) {
		if (!config.owners.includes(ctx.user.id)) {
			return ctx.reply({ ephemeral: true, content: 'Only bot owner(s) can use this command.' })
		}

		await ctx.deferReply({ ephemeral: true })

		const channel = ctx.options.getChannel('channel')

		const excluded = (await db.get(`${ctx.guildId}_exclude`).catch(() => null)) || []

		let isRemoved = false

		if (excluded.includes(channel.id)) {
			isRemoved = true
			await db.pull(`${ctx.guildId}_exclude`, channel.id)
		} else {
			await db.push(`${ctx.guildId}_exclude`, channel.id)
		}

		await ctx.editReply(`${channel} successfully ${isRemoved ? 'included' : 'excluded'}.`)
	}
}
