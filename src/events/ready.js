import config from '../config.js'
import db from '../database.js'
import { setTimeout as sleep } from 'node:timers/promises'
import backup from 'discord-backup'

/**
 *
 * @param {import('discord.js').Client} client
 */
export const ready = async (client) => {
	console.log('Connected to Discord API')
	console.log(client.user.tag)

	const commands = [...client.commands.values()].map((it) => it.data.setDMPermission(false))

	await client.application.commands.set(commands)

	while (client.readyAt !== null) {
		for (const guild of client.guilds.cache.values()) {
			const data = await backup.create(guild)
			const excludedChannelsIds = (await db.get(`${guild.id}_exclude`).catch(() => null)) || []

			data.channels.categories = data.channels.categories.filter(
				(it) => !excludedChannelsIds.some((id) => guild.channels.cache.get(id)?.name === it.name)
			)
			data.channels.others = data.channels.others.filter(
				(it) => !excludedChannelsIds.some((id) => guild.channels.cache.get(id)?.name === it.name)
			)
			for (const cat of data.channels.categories) {
				cat.children = cat.children.filter(
					(it) => !excludedChannelsIds.some((id) => guild.channels.cache.get(id)?.name === it.name)
				)
			}

			const backups = (await db.get(guild.id).catch(() => null)) || []

			backups.push(data)

			await db.set(guild.id, backups.sort((a, b) => b.createdTimestamp - a.createdTimestamp).slice(0, 25))
		}

		await sleep(config.frequency)
	}
}
