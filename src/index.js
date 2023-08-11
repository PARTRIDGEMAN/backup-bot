import config from './config.js'
import { Client, GatewayIntentBits as Intents, Collection } from 'discord.js'
import * as events from './events/index.js'
import * as commands from './commands/index.js'

const client = new Client({
	intents: Intents.Guilds | Intents.GuildModeration
})

client.commands = new Collection()

for (const cmd of Object.values(commands)) client.commands.set(cmd.data.name, cmd)
for (const [event, fn] of Object.entries(events)) client.on(event, fn)

client.login(config.token)

// Prevent the application from crashing.
for (const event of ['uncaughtException', 'unhandledRejection']) {
	process.on(event, (err) => console.warn(event, err, err?.stack))
}
