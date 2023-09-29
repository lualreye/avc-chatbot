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
        async (ctx, ctxFn) => {
            try {
                const { state } = ctxFn;
                const entryMessage = ctx.body;
                const plugin = ctxFn.extensions.employeesAddon;
                console.log(plugin)
                const idealEmployee = await plugin.determine(entryMessage);

                state.update({idealEmployee})

            } catch (error) {
                console.log('error', error)
            }
        },
        [informationFlow, subscriptionFlow]
    )


module.exports = mainFlow