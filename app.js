require('dotenv').config()
const fs = require('fs')
const path = require('path')

const { createBot, createProvider, createFlow } = require('@bot-whatsapp/bot')
const { init } = require('bot-ws-plugin-openai');
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const mainFlow = require('./src/flows/main.flow');
const subscriptionFlow = require('./src/flows/subscription.flow')
const informationFlow = require('./src/flows/information.flow')
const HttpServer = require('./src/http/http.class');
const ChatWoot = require('./src/services/chatwoot')

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
    const chatwoot = new ChatWoot(
        process.env.CHATWOOT_KEY,
        process.env.CHATWOOT_URL,
        {
            accounts: 1
        }
    )

    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([mainFlow, subscriptionFlow, informationFlow])
    const adapterProvider = createProvider(BaileysProvider)

    const configBot = {
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    }

    const configExtra = {
        globalState: {
            status: true,
            inbox_id: 1
        },
        extensions: {
            employeesAddon,
            chatwoot
        }
    }

    await createBot(configBot, configExtra);

    const server = new HttpServer(adapterProvider)
    server.start();
}

main()
