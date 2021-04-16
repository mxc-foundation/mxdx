const axios = require('axios')
const { deleteMessage } = require('../../utils')

async function handleDadJokeCommand(message) {
    deleteMessage(message)
    const dadJoke = axios
        .get('https://icanhazdadjoke.com/', {
            headers: { Accept: 'application/json' },
        })
        .then((res) => res.data.joke)

    const botMessage = await message.channel.send(`${await dadJoke}`)
    deleteMessage(botMessage, 20000)
}

module.exports = handleDadJokeCommand
