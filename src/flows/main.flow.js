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
        console.log('ejecutado el primer action')
    })
    .addAction(chatwootMiddleware)
    .addAction(
        async (ctx, ctxFn) => {
            console.log('ejecutado el tercer action')
            const chatwoot = ctxFn.extensions.chatwoot;
            const currentState = ctxFn.state.getMyState();
            const body = ctx.body;

            await chatwoot.create.Message({
                msg: body,
                mode: 'incoming',
                conversationId: currentState.conversation_id
            })
            const MESSAGE = 'Hola bienvenido al asistente virtual de AVC, ¿Cómo puedo ayudarte el día de hoy?'
            await sendMessageChatWoot(MESSAGE, 'incoming')
            await flowDynamic(MESSAGE)
        }
    )
    .addAction(
        async (ctx, { flowDynamic }) => {
            const MESSAGE_OPTIONS = [
                '¿Cuéntanos por qué nos escribes?',
                '1. Información',
                '2. Cancelar suscripción'
            ]
            await sendMessageChatWoot(MESSAGE_OPTIONS, 'incoming')
            await flowDynamic(MESSAGE_OPTIONS)
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