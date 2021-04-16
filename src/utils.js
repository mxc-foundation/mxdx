/* eslint-disable */
const Discord = require('discord.js')
const { setIntervalAsync } = require('set-interval-async')
const rollbar = require('./rollbar')

const listify = (
    array,
    { conjunction = 'and ', stringify = JSON.stringify } = {}
) =>
    array.reduce((list, item, index) => {
        if (index === 0) return stringify(item)
        if (index === array.length - 1) {
            if (index === 1) return `${list} ${conjunction}${stringify(item)}`
            else return `${list}, ${conjunction}${stringify(item)}`
        }
        return `${list}, ${stringify(item)}`
    }, '')

const privateChannelPrefix =
    process.env.NODE_ENV === 'production' ? '🤫-private-' : '😎-private-'

const getBotMessages = (messages) =>
    messages.filter(({ author, client }) => author.id === client.user.id)

const commandRegex = /^!(?<command>\S+?)($| )(?<args>(.|\n)*)/

const getCommandArgs = (string) =>
    string.match(commandRegex)?.groups?.args ?? ''
const isCommand = (string) => commandRegex.test(string)

function getRole(guild, { name }) {
    return guild.roles.cache.find(
        (r) => r.name.toLowerCase() === name.toLowerCase()
    )
}

function getMember(guild, memberId) {
    // somehow the guild isn't always accessible
    if (!guild) return null
    return guild.members.cache.find(({ user }) => user.id === memberId)
}

function deleteMessage(message, timeout) {
    message
        .delete({ timeout: timeout || 5000 })
        .then((msg) =>
            console.log(
                `Deleted message from ${msg.author.username} after ${
                    timeout ? timeout / 1000 : 5
                } seconds`
            )
        )
        .catch(console.error)
}

function buildEmbed(resourcesJson) {
    const commandExample = '`!checkout BuildServer MMD-123`'
    const returnCommandExample = '`!return BuildServer`'
    return new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('MXC Resource Dashboard')
        .setAuthor(
            'MXDX',
            '***REMOVED***',
            'https://www.google.com'
        )
        .setDescription("Here's a quick overview of who is using what.")
        .addFields(
            {
                name: 'Commands',
                value: `${commandExample}
            ${returnCommandExample}`,
            },
            { name: '\u200B', value: '\u200B' },
            {
                name: 'Status',
                value: resourcesJson.BuildServer.signal,
                inline: true,
            },
            {
                name: 'Server',
                value: resourcesJson.BuildServer.name,
                inline: true,
            },
            {
                name: 'Description',
                value: resourcesJson.BuildServer.status,
                inline: true,
            }
        )
        .addFields(
            {
                name: '\u200B',
                value: resourcesJson.BuildServer2.signal,
                inline: true,
            },
            {
                name: '\u200B',
                value: resourcesJson.BuildServer2.name,
                inline: true,
            },
            {
                name: '\u200B',
                value: resourcesJson.BuildServer2.status,
                inline: true,
            },
            { name: '\u200B', value: '\u200B' }
        )
        .addFields(
            {
                name: '\u200B',
                value: resourcesJson.TestServer.signal,
                inline: true,
            },
            {
                name: '\u200B',
                value: resourcesJson.TestServer.name,
                inline: true,
            },
            {
                name: '\u200B',
                value: resourcesJson.TestServer.status,
                inline: true,
            },
            { name: '\u200B', value: '\u200B' }
        )
        .addFields(
            {
                name: '\u200B',
                value: resourcesJson.TestChina.signal,
                inline: true,
            },
            {
                name: '\u200B',
                value: resourcesJson.TestChina.name,
                inline: true,
            },
            {
                name: '\u200B',
                value: resourcesJson.TestChina.status,
                inline: true,
            },
            { name: '\u200B', value: '\u200B' }
        )
        .setTimestamp()
        .setFooter(
            'Last updated',
            '***REMOVED***'
        )
}

function updateMessage(message, msgId, resourcesJson) {
    message.channel.messages.fetch({ around: msgId, limit: 1 }).then((msg) => {
        const fetchedMsg = msg.first()
        fetchedMsg.edit(buildEmbed(resourcesJson))
    })
}

async function sendBotMessageReply(msg, reply) {
    const botsChannel = getChannel(msg.guild, { name: 'talk-to-bots' })
    if (botsChannel.id === msg.channel.id) {
        // if they sent this from the bot's channel then we'll just send the reply
        return botsChannel.send(reply)
    } else {
        // otherwise, we'll send the reply in the bots channel and let them know
        // where they can get the reply.
        const botMsg = await botsChannel.send(
            `
_Replying to ${msg.author} <${getMessageLink(msg)}>_
  
${reply}
      `.trim()
        )
        return sendSelfDestructMessage(
            msg.channel,
            `Hey ${msg.author}, I replied to you here: ${getMessageLink(
                botMsg
            )}`,
            { time: 7, units: 'seconds' }
        )
    }
}

function getCategory(guild, { name }) {
    return guild.channels.cache.find(
        (c) =>
            c.type === 'category' && c.name.toLowerCase() === name.toLowerCase()
    )
}
const timeToMs = {
    seconds: (t) => t * 1000,
    minutes: (t) => t * 1000 * 60,
    hours: (t) => t * 1000 * 60 * 60,
    days: (t) => t * 1000 * 60 * 60 * 24,
    weeks: (t) => t * 1000 * 60 * 60 * 24 * 7,
}

// read up on dynamic setIntervalAsync here: https://github.com/ealmansi/set-interval-async#dynamic-and-fixed-setintervalasync
function cleanupGuildOnInterval(client, cb, interval) {
    setIntervalAsync(() => {
        return Promise.all(Array.from(client.guilds.cache.values()).map(cb))
    }, interval)
}

***REMOVED***

module.exports = {
    getCommandArgs,
    getRole,
    getMember,
    deleteMessage,
    getBotMessages,
    isCommand,
    rollbar,
    commandRegex,
    buildEmbed,
    updateMessage,
    privateChannelPrefix,
    listify,
    sendBotMessageReply,
    getCategory,
    timeToMs,
    cleanupGuildOnInterval,
    allowedGuilds,
}
