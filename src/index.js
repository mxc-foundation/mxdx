const commands = require('./commands')
const rollbar = require('./rollbar')

function setup(client) {
    commands.setup(client)
}

module.exports = {
    commands,
    setup,
    rollbar,
}
