const Discord = require("discord.js");
const { MessageMentions } = require("discord.js");
const {
  privateChannelPrefix,
  listify,
  sendBotMessageReply,
  getCategory,
  getMember,
  getCommandArgs,
} = require("../utils");

async function createChat(message) {
  const mxcSupportRole = message.guild.roles.cache.find(
    ({ name }) => name === "MXC Support"
  );

  const isSupport = message.member.roles.cache.has(mxcSupportRole.id);

  if (!isSupport) {
    message.channel.send(
      "Only support team member can open a support channel."
    );
    return;
  }

  const mentionedMembers = Array.from(message.mentions.members.values()).filter(
    (user) => user.user.id !== message.member.id
  );
  const mentionedMembersNicknames = Array.from(
    message.mentions.members.values()
  ).map((user) => user.displayName);
  mentionedMembers.push(message.author);
  mentionedMembersNicknames.push(
    getMember(message.guild, message.author.id).displayName
  );
  if (mentionedMembers.length < 2) {
    return message.channel.send(
      `You should mention at least one other member.`
    );
  }

  const allPermissions = Object.keys(Discord.Permissions.FLAGS);
  const membersPermissions = mentionedMembers.map((member) => {
    return {
      type: "member",
      id: member.id,
      allow: [
        "ADD_REACTIONS",
        "VIEW_CHANNEL",
        "SEND_MESSAGES",
        "SEND_TTS_MESSAGES",
        "READ_MESSAGE_HISTORY",
        "CHANGE_NICKNAME",
      ],
    };
  });

  let channelSuffix;
  if (mentionedMembersNicknames.length === 2) {
    channelSuffix = mentionedMembersNicknames.join("-");
  } else {
    channelSuffix = `${mentionedMembersNicknames
      .slice(0, 2)
      .join("-")}-and-others`;
  }

  const everyoneRole = message.guild.roles.cache.find(
    ({ name }) => name === "@everyone"
  );

  const mxcTeamRole = message.guild.roles.cache.find(
    ({ name }) => name === "MXC Team"
  );

  const categoryPrivateChat = getCategory(message.guild, {
    name: "support chat",
  });

  const allActivePrivateChannels = message.guild.channels.cache.filter(
    (channel) =>
      channel.type === "text" &&
      channel.parentID === categoryPrivateChat.id &&
      channel.name.includes("-support-") &&
      !channel.deleted
  );

  const existingChat = allActivePrivateChannels.find((channel) => {
    const chatMembers = channel.members
      .filter((member) => !member.user.bot)
      .map((member) => member.id);

    return (
      chatMembers.length === mentionedMembers.length &&
      mentionedMembers.every((member) => chatMembers.indexOf(member.id) !== -1)
    );
  });

  if (existingChat) {
    return message.channel.send(
      `There is already a chat for the same members ${existingChat}`
    );
  }

  const channel = await message.guild.channels.create(
    `${privateChannelPrefix}${channelSuffix}`,
    {
      topic: `Private chat for ${listify(mentionedMembersNicknames, {
        stringify: (member) => member,
      })}`,
      parent: categoryPrivateChat,
      permissionOverwrites: [
        {
          type: "role",
          id: everyoneRole.id,
          deny: allPermissions,
        },
        {
          type: "role",
          id: mxcTeamRole.id,
          deny: allPermissions,
        },
        ...membersPermissions,
      ],
    }
  );
  return Promise.all([
    channel.send(
      `
Hello ${listify(mentionedMembers, { stringify: (member) => member })} ????

I'm the bot that created this channel for you. Enjoy ????

> Please note that the MXC Discord Server Owners and Admins *can* see this chat. So if you want to be *completely* private, then you'll need to take your communication elsewhere.
    `.trim()
    ),
    message.channel.send(
      `I've created ${channel} for you folks to talk privately. Cheers!`
    ),
  ]);
}

async function deleteChat(message) {
  const fetchedChannel = message.channel;
  fetchedChannel.delete();
}

function privateChat(message) {
  const privateChatSubcommand = { close: deleteChat };
  const args = getCommandArgs(message.content).trim();
  const privateChatArg = args
    .replace(MessageMentions.USERS_PATTERN, "")
    .trim()
    .toLowerCase();
  const [command, ...rest] = privateChatArg.split(" ");
  if (command) {
    if (command in privateChatSubcommand) {
      const categoryPrivateChat = getCategory(message.guild, {
        name: "support chat",
      });
      if (message.channel.parent?.id === categoryPrivateChat.id) {
        return privateChatSubcommand[command](message, ...rest);
      } else {
        return message.channel.send(
          `The command ${command} can be used only in private chat`
        );
      }
    } else {
      return message.channel.send(
        "The command is not available. use `!support help` to know more about the available commands"
      );
    }
  } else {
    return createChat(message);
  }
}

privateChat.description =
  "Create a private channel with who you want. This channel is temporary.";
privateChat.help = (message) =>
  sendBotMessageReply(
    message,
    `
Use this command to create a private chat with members of the support team ????. This command can only be initiated by members of the support team. 
The following commands are available:
1. \`!support @User1 @User2\`. This will create a private chat room for you and User1 and User2.
2. \`!support extend 10\`. This will extend the lifetime of the chat of 10 minutes. The command is available only in private chat.
    `.trim()
  );

module.exports = privateChat;
