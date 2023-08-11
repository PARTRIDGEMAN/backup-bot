/**
 *
 * @param {import('discord.js').Interaction} ctx
 */
export const interactionCreate = async (ctx) => {
	if (!ctx.isCommand() || !ctx.inGuild()) return

	const command = ctx.client.commands.get(ctx.commandName)

	if (!command) return

	try {
		await command.run(ctx)
	} catch (err) {
		console.error(err)
		const say = (content) =>
			ctx.replied || ctx.deferred ? ctx.editReply(content) : ctx.reply({ content, ephemeral: true })
		await say('An error has occurred').catch(() => null)
	}
}
