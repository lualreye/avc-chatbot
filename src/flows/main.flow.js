const { EVENTS, addKeyword } = require('@bot-whatsapp/bot');

const subscriptionFlow = require('./subscription.flow')
const informationFlow = require('./information.flow')
const chatwootMiddleware = require('../middleware/chatwoot.middleware')

const mainFlow = addKeyword(EVENTS.WELCOME)
    .addAction((_, { endFlow, globalState }) => {
        const currentGlobalState = globalState.getMyState();
        if (!currentGlobalState.status) {
            return endFlow();
        }
    })
    .addAction(chatwootMiddleware)
    .addAction(
        async (ctx, ctxFn) => {
            const chatwoot = ctxFn.extensions.chatwoot;
            const currentState = ctxFn.state.getMyState();
            const body = ctx.body;

            await chatwoot.createMessage({
                msg: body,
                mode: 'incoming',
                conversationId: currentState.conversation_id
            })

            const MESSAGE = 'Hola bienvenido al asistente virtual de AVC, ¿Cómo puedo ayudarte el día de hoy?'
            await chatwoot.createMessage({
                msg: MESSAGE,
                mode: 'outgoing',
                conversationId: currentState.conversation_id
            })

            await ctxFn.flowDynamic(MESSAGE)
        }
    )
    .addAction(
        async (ctx, ctxFn) => {
            const chatwoot = ctxFn.extensions.chatwoot;
            const currentState = ctxFn.state.getMyState();
            const MESSAGE_OPTIONS = 
                '¿Cuéntanos por qué nos escribes? \n 1. Información \n 2. Cancelar suscripción'
            await chatwoot.createMessage({
                msg: MESSAGE_OPTIONS,
                mode: 'outgoing',
                conversationId: currentState.conversation_id
            })
            await ctxFn.flowDynamic(MESSAGE_OPTIONS)
        }
    )
    .addAction(
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
                        '2. Cancelar suscripción'
                    ],)
                }

                state.update({ idealEmployee })

                plugin.gotoFlow(idealEmployee.employee, ctxFn)

            } catch (error) {
                console.log('error', error)
            }
        },
        [informationFlow, subscriptionFlow]
    )


module.exports = mainFlow