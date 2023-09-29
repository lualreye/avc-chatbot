require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { createBot, createProvider, createFlow } = require('@bot-whatsapp/bot')
const { init } = require('bot-ws-plugin-openai');

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')


// mainflow
const mainFlow = require('./src/flows/main.flow');
const subscriptionFlow = require('./src/flows/subscription.flow')
const informationFlow = require('./src/flows/information.flow')

const employeesAddonConfig = {
    model: 'gpt-3.5-turbo-16k',
    temperature: 0,
    apiKey: process.env.OPENAI_API_KEY
};
const employeesAddon = init(employeesAddonConfig);

employeesAddon.employees([
    {
        name: 'EMPLEADO_PARA_CANCELAR_SUSCRIPCION',
        description: fs.readFileSync(path.join(__dirname, './src/prompts/02_ASISTANT.txt'), 'utf8'),
        flow: subscriptionFlow
    },
    {
        name: 'EMPLEADO_INFORMATIVO',
        description: fs.readFileSync(path.join(__dirname, './src/prompts/01_INFORMATION_ASISTANT.txt'), 'utf8'),
        flow: informationFlow
    },
])

const main = async () => {
    const adapterDB = new MockAdapter()

    const adapterFlow = createFlow([mainFlow, subscriptionFlow, informationFlow])
    const adapterProvider = createProvider(BaileysProvider)

    const configBot = {
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    }

    const configExtra = {
        extensions: {
            employeesAddon
        }
    }

    await createBot(configBot, configExtra)
    QRPortalWeb()
}

main()
