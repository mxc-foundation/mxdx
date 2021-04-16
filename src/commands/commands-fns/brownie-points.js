const { get, overwrite } = require('../../firebase')
const { MessageMentions } = require('discord.js')
const { deleteMessage, getCommandArgs, rollbar } = require('../../utils')

async function handleBrowniePointsCommand(message) {
    deleteMessage(message)

    const args = getCommandArgs(message.content)

    const mentionedMembers = Array.from(
        message.mentions.members.values()
    ).filter((user) => user.user.id !== message.member.id)

    let mentionedMemberIds = []
    for (let i = 0; i < mentionedMembers.length; i++) {
        mentionedMemberIds.push(mentionedMembers[i].id)
    }

    const browniePointArgs = args
        .replace(MessageMentions.USERS_PATTERN, '')
        .trim()
        .toLowerCase()

    const author = message.author

    // look for subcommand
    const [command, ...rest] = browniePointArgs.split(' ')

    if (command === 'score') {
        const checkUser = mentionedMemberIds[0]
        if (checkUser === undefined) {
            const authorScore = await get('points/' + author.id)
            const botMessage = message.channel.send(
                authorScore
                    ? `You have ${authorScore} brownie points!`
                    : "Sadly you don't have any brownie points."
            )
            deleteMessage(await botMessage, 10000)
            return
        } else {
            const checkScore = await get('points/' + checkUser)
            if (checkScore) {
                const botMessage = message.channel.send(
                    `<@${checkUser}> has ${checkScore} brownie points!`
                )
                deleteMessage(await botMessage, 10000)

                return
            }
        }
        return message.channel.send(
            "Something didn't work. Quick, find a developer!"
        )
    }
    if (mentionedMembers.length < 1) {
        return message.channel.send(
            `I appreciate you thanking the void, but you should probably be thanking a colleague.`
        )
    }

    const points = parseInt(browniePointArgs)

    if (isNaN(points)) {
        return message.channel.send(
            'Your first argument should be the number of brownie points you want to give your colleague, please try again.'
        )
    }

    if (points > 10) {
        const botMessage = message.channel.send(
            'You can only give away 10 brownie points at a time.'
        )
        deleteMessage(await botMessage)
        return
    }

    if (points < 0) {
        const botMessage = message.channel.send("It's not nice to steal.")
        deleteMessage(await botMessage)
        return
    }

    const getPoints = await get('points')
    const getThanked = await get('points/' + mentionedMemberIds[0])

    if (!getThanked) {
        try {
            overwrite('points/' + mentionedMemberIds[0], points)
        } catch (e) {
            rollbar.log(e)
        }
    }

    const thankedPoints = getPoints[`${mentionedMemberIds[0]}`]

    if (thankedPoints === undefined) {
        rollbar.log('Error: points entry in database without points present.')
    } else {
        const summedPoints = thankedPoints + points
        overwrite('points/' + mentionedMemberIds[0], summedPoints)
    }

    message.channel.send(
        `${author} is thanking ${mentionedMemberIds.map(
            (id) => `<@${id}>, `
        )}by sending ${points} brownie points!`
    )
}

module.exports = handleBrowniePointsCommand
