const admin = require('firebase-admin')
const { rollbar } = require('./utils')

//TODO: refactor all referenced functions with get and post functions

const firebaseAdminApp = admin.initializeApp({
    credential: admin.credential.cert(
        JSON.parse(
            Buffer.from(process.env.GOOGLE_CONFIG_BASE64, 'base64').toString(
                'ascii'
            )
        )
    ),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
})

const database = admin.database()

async function loadResources() {
    return database
        .ref('services')
        .once('value')
        .then((snapshot) => {
            return snapshot.val()
        })
}

async function loadServers() {
    return database
        .ref('servers')
        .once('value')
        .then((snapshot) => {
            return snapshot.val()
        })
}

async function get(ref) {
    return database
        .ref(ref)
        .once('value')
        .then((snapshot) => {
            return snapshot.val()
        })
}

const dbServer = database.ref('servers')

function writeServer(fileData) {
    const write = dbServer.push()
    write.set(fileData)
}

function post(location, fileData) {
    const write = location.push()
    write.set(fileData)
}

function overwrite(location, fileData) {
    database.ref(location).set(fileData, (error) => {
        if (error) {
            rollbar.log(`Write to Firebase failed with error: ${error}`)
        } else {
            rollbar.log('Write to Firebase success')
        }
    })
}

async function getResourcesMessageId(server) {
    const getServers = await loadServers()
    const serverArray = []
    /* eslint-disable */
    for (const property in getServers) {
        serverArray.push(getServers[property])
    }
    let msgId
    serverArray.forEach((item) => {
        if (item.id === server) {
            msgId = item.resourcesMessageId
        }
    })
    return msgId
}

function writeResources(fileData) {
    database.ref('services').set(fileData, (error) => {
        if (error) {
            rollbar.log(`Write to Firebase failed with error: ${error}`)
        } else {
            rollbar.log('Write to Firebase success')
        }
    })
}

module.exports = {
    loadResources,
    writeResources,
    writeServer,
    getResourcesMessageId,
    get,
    post,
    overwrite,
    database,
}
