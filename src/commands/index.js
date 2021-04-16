const { commandRegex, getMember, getRole } = require('./utils')
const commands = require('./commands')

function handleNewMessage(message) {
    const { command } = message.content.match(commandRegex)?.groups ?? {}

    if (!command) return

    const commandFn = commands[command]

    if (!commandFn) return

    const member = getMember(message.guild, message.author.id)

    if (!member) return

    const memberRole = getRole(message.guild, { name: 'MXC Team' })

    if (!member.roles.cache.has(memberRole.id)) {
        return message.channel.send(
            `
Sorry, only MXC Team members can issue commands. Please contact HR if this is a mistake.
      `.trim()
        )
    }
    return commandFn(message)
}

function setup(client) {
    client.on('message', handleNewMessage)
}

module.exports = { handleNewMessage, setup }
