const { writeServer, get } = require("../../firebase");
const { deleteMessage } = require("../../utils");
const database = require("../../../database.json");

async function handleSetupCommand(message) {
  deleteMessage(message);

  if (!message.member.hasPermission("ADMINISTRATOR")) {
    const botMessage = await message.channel.send(
      "Only an administrator can run this command."
    );
    deleteMessage(botMessage);
    return;
  }

  if (!(await get("points"))) {
    writeServer(database);
    const botMessage = await messsage.channel.send("Setup is complete");
    deleteMessage(botMessage);
  } else {
    const botMessage = await message.channel.send(
      "Setup has already been run."
    );
    deleteMessage(botMessage);
  }
}

module.exports = handleSetupCommand;
