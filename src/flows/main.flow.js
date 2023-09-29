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
                const idealEmployee = await plugin.determine(entryMessage);

                if (!idealEmployee?.employee) {
                    return ctxFn.flowDynamic([
                        'Lo siento no he podido entenderte',
                        '¿Qué deseas hacer?',
                        '1. Información',
                        '2. Desuscribirse'
                    ],)
                }

                console.log(idealEmployee)

                state.update({ idealEmployee })

                plugin.gotoFlow(idealEmployee.employee, ctxFn)

            } catch (error) {
                console.log('error', error)
            }
        },
        [informationFlow, subscriptionFlow]
    )


module.exports = mainFlow