const { EVENTS, addKeyword } = require('@bot-whatsapp/bot');
const subscriptionFlow = require('./subscription.flow')
const informationFlow = require('./information.flow')

const mainFlow = addKeyword(EVENTS.WELCOME)
    .addAnswer(
        'Hola bienvenido al asistente virtual de AVC, ¿Cómo puedo ayudarte el día de hoy?'
    )
    .addAnswer(
        [
            '¿Cuéntanos por qué nos escribes?',
            '1. Información',
            '2. Desuscribirse'
        ],
        {
            capture: true
        },
        async (ctx, { state, gotoFlow, fallBack, flowDynamic }) => {
            try {
                // const { state } = ctxFn;
                // const entryMessage = ctx.body;
                // const plugin = ctxFn.extensions.employeesAddon;
                // console.log(plugin)
                // const idealEmployee = await plugin.determine(entryMessage);

                const entryMessage = ctx.body;

                console.log(entryMessage)

                if (entryMessage !== 'informacion' && entryMessage !== 'desuscripcion') {
                    return fallBack('Lo siento no he entendido. ¿Cómo puedo ayudarte?')
                }

                if (entryMessage === 'desuscripcion') {
                    return gotoFlow(subscriptionFlow)
                }

                if (entryMessage === 'informacion') {
                    return gotoFlow(informationFlow)
                }
            } catch (error) {
                console.log('error', error)
            }
        },
        [informationFlow, subscriptionFlow]
    )


module.exports = mainFlow