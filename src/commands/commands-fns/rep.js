const { get, overwrite } = require("../../firebase");
const { MessageMentions } = require("discord.js");
const { deleteMessage, getCommandArgs, rollbar } = require("../../utils");

async function handleRepCommand(message) {
  deleteMessage(message);

  const args = getCommandArgs(message.content);
  const mentionedMembers = Array.from(message.mentions.members.values()).filter(
    (user) => user.user.id !== message.member.id
  );

  let mentionedMemberIds = [];
  for (let i = 0; i < mentionedMembers.length; i++) {
    mentionedMemberIds.push(mentionedMembers[i].id);
  }

  const today = new Date().toISOString().slice(0, 10);

  const browniePointArgs = args
    .replace(MessageMentions.USERS_PATTERN, "")
    .trim()
    .toLowerCase();
  const points = parseInt(browniePointArgs);

  console.log(today);

  const userGivingId = message.author.id;
  const userSpentRep = await get(`pointsSpent/${userGivingId}/${today}`);

  console.log(userSpentRep);

  if (userSpentRep >= 10) {
    message.channel.send(
      "You've been generous today! Sadly that means you hit the REP limit. Come back tomorrow and you'll have 10 more to give away."
    );
    return;
  } else if (userSpentRep === null) {
    overwrite(`pointsSpent/${userGivingId}/${today}`, points);
  } else {
    overwrite(`pointsSpent/${userGivingId}/${today}`, points + userSpentRep);
  }

  const author = message.author;

  // look for subcommand
  const [command, ...rest] = browniePointArgs.split(" ");

  if (command === "score") {
    const checkUser = mentionedMemberIds[0];
    if (checkUser === undefined) {
      const authorScore = await get("points/" + author.id);
      const botMessage = message.channel.send(
        authorScore
          ? `You have ${authorScore} REP!`
          : "Sadly you don't have any REP."
      );
      deleteMessage(await botMessage, 10000);
      return;
    } else {
      const checkScore = await get("points/" + checkUser);
      if (checkScore) {
        const botMessage = message.channel.send(
          `<@${checkUser}> has ${checkScore} REP!`
        );
        deleteMessage(await botMessage, 10000);

        return;
      }
    }
    return message.channel.send(
      "Something didn't work. Quick, find a developer!"
    );
  }
  if (mentionedMembers.length < 1) {
    return message.channel.send(
      `I appreciate you sending REP the void, but you should probably be sending it to a real person.`
    );
  }

  if (isNaN(points)) {
    return message.channel.send(
      "Your first argument should be the number of REP you want to give your colleague, please try again."
    );
  }

  if (points > 10) {
    const botMessage = message.channel.send(
      "You can only give away 10 REP per day."
    );
    deleteMessage(await botMessage);
    return;
  }

  if (points < 0) {
    const botMessage = message.channel.send("It's not nice to steal.");
    deleteMessage(await botMessage);
    return;
  }

  const getPoints = await get("points");
  const getThanked = await get("points/" + mentionedMemberIds[0]);

  if (!getThanked) {
    try {
      overwrite("points/" + mentionedMemberIds[0], points);
    } catch (e) {
      rollbar.log(e);
    }
  }

  const thankedPoints = getPoints[`${mentionedMemberIds[0]}`];

  if (thankedPoints === undefined) {
    rollbar.log("Error: points entry in database without points present.");
  } else {
    const summedPoints = thankedPoints + points;
    overwrite("points/" + mentionedMemberIds[0], summedPoints);
  }

  message.channel.send(
    `${author} has sent ${mentionedMemberIds.map(
      (id) => `<@${id}> `
    )} ${points} REP!`
  );
}

module.exports = handleRepCommand;
