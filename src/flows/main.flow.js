const { EVENTS, addKeyword } = require('@bot-whatsapp/bot');

const subscriptionFlow = require('./subscription.flow')
const informationFlow = require('./information.flow')
const chatwootMiddleware = require('../middleware/chatwoot.middleware')

const mainFlow = addKeyword('hola')
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
            const currentState = ctxFn.state.getMyState();
            const chatwoot = ctxFn.extensions.chatwoot;
            const body = ctx.body;
            const plugin = ctxFn.extensions.employeesAddon;
            const idealEmployee = await plugin.determine(body);

            await chatwoot.createMessage({
                msg: body,
                mode: 'incoming',
                conversationId: currentState.conversation_id
            })

            if (!idealEmployee?.employee) {
                const MESSAGE = 'Lo siento no he podido entenderte \n ¿Qué deseas hacer? \n 1. Información \n 2. Cancelar suscripción'

                await chatwoot.createMessage({
                    msg: MESSAGE,
                    mode: 'outgoing',
                    conversationId: currentState.conversation_id
                })

                return ctxFn.flowDynamic(MESSAGE)
            }

            ctxFn.state.update({ idealEmployee })

            plugin.gotoFlow(idealEmployee.employee, ctxFn)
        },
    )


module.exports = mainFlow