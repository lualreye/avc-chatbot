const { createBot, createProvider, createFlow } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MongoAdapter = require('@bot-whatsapp/database/mongo')
const MockAdapter = require('@bot-whatsapp/database/mock')

// flows
const mainFlow = require('./src/flows/mainFlow');

/**
 * Declaramos las conexiones de Mongo
 */

// const MONGO_DB_URI = 'mongodb://0.0.0.0:27017'
// const MONGO_DB_NAME = 'db_bot'


const main = async () => {
    // const adapterDB = new MongoAdapter({
    //     dbUri: MONGO_DB_URI,
    //     dbName: MONGO_DB_NAME,
    // })
    const adapterDB = new MockAdapter();

    const adapterFlow = createFlow([mainFlow])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()
