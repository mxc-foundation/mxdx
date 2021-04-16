# MXDX

MXDX is a Discord bot for the MXC Community. Currently, it is able to:

* Help manage resources
* Send Brownie Points
* Make a Dad Joke
* Open a private channel for a private chat (including mods and team)

In the future it may be able to do much more. 

## Setup

### Get your Discord Bot Token
First, you need to have a bot token to run this bot. You can get this here: https://discord.com/developers/applications/

You can review [this article](https://discordpy.readthedocs.io/en/latest/discord.html) to learn how to add the bot to a Discord Server.

### Setup a Firebase Realtime Database
This bot also uses a Firebase Realtime Database to manage REP.

You can learn about setting up a database [here](https://firebase.google.com/docs/database/web/start).


Your database structure should resemble:

```json
{
  "points": {
    "userid": "10"
  }
}
```

### Setup Rollbar
Currently, the app uses Rollbar to log events while it's live. In order to deploy the app, you will need a Rollbar access token.

### Configure your .env

For the bot to run properly, you will need to have the following variables filled into your `.env` file. 

```dotenv

NODE_ENV=
DISCORD_BOT_TOKEN=
GOOGLE_CONFIG_BASE64=
ROLLBAR_ACCESS_TOKEN=
FIREBASE_DATABASE_URL=

```

Follow the following steps to get your `GOOGLE_CONFIG_BASE64`:
1. Download the private key from `Firebase -> Project Settings -> Service Accounts`
1. Run `openssl base64 -in <firebaseConfig.json> -out <firebaseConfigBase64.txt> -A`
1. Use the text in the text file as your `GOOGLE_CONFIG_BASE64` variable


Run 
`node index.js`

## Creating new Bot Commands
Bot command logic belongs in `src -> commands -> commands-fns`. A bot will respond to commands when you add the command to `src -> commands -> commands.js`. 