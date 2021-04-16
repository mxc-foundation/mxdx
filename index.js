require('dotenv').config()
const Discord = require('discord.js')
const { setup, rollbar } = require('./src')

const client = new Discord.Client()

rollbar.log('logging in discord client')

client.login(process.env.DISCORD_BOT_TOKEN)

client.on('ready', (error) => {
    if (error) {
        rollbar.log('Error logging client in')
        throw error
    } else {
        rollbar.log('Client logged in... Setting up client.')
        rollbar.log('Servers:')
        client.guilds.cache.forEach((guild) => {
            rollbar.log(` - ${  guild.name}`)
        })

        setup(client)
    }
})
