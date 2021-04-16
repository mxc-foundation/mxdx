const { loadResources, writeServer } = require('../../firebase')
const { buildEmbed, deleteMessage } = require('../../utils')
const { getResourcesMessageId } = require('../../firebase')

let msgId

async function handleSetupCommand(message) {
    const resourcesJson = await loadResources()
    const resourcesChannel = message.guild.channels.cache.find(
        (channel) => channel.name.toLowerCase() === 'resources'
    )
    msgId = await getResourcesMessageId(message?.guild.id)
    if (msgId === undefined) {
        const embedMessage = await resourcesChannel.send(
            buildEmbed(resourcesJson)
        )
        msgId = embedMessage.id
        const serverJson = {
            id: message.guild.id,
            resourcesMessageId: msgId,
        }
        writeServer(serverJson)
        deleteMessage(message)
    } else {
        const botMessage = await resourcesChannel.send(
            'This server is already setup.'
        )
        deleteMessage(message)
        deleteMessage(botMessage)
    }
}

module.exports = handleSetupCommand
