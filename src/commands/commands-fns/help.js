const { deleteMessage } = require('../utils')

async function handleHelpCommand(message) {
    deleteMessage(message)

    const botMessage = message.channel.send(`
Hi - I'm MXDX, your MXC Discord Bot dedicated to making your life just a bit easier. Here's how I can help you:

**Public Commands**
\`!thanks\` gives you chance to show appreciation to your colleagues by giving them *brownie points*. Brownie Points are a nonexistant currency of appreciation, that really can't be used for anything. But it's still nice to get them.
The command is like this:
\`!thanks @jeff 100\`
Want to know your score? Type in:
\`!thanks score\`
Interested in someone else's score? Type in: 
\`!thanks score @User\`

**MXC Team/Mod Commands:**
\`!private-chat\` this will open a private chat channel between a selected user and the MXC Team for the sharing of information needed for a support request. 
Command Args:
\`!private-chat [@tagUser]\`
It will look like:
\`!private-chat @jeff\`
    
** Miscellaneous **
\`!dadJoke\`: use at your own risk. 

    `)

    deleteMessage(await botMessage, 60000)
}

module.exports = handleHelpCommand
