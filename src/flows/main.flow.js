const { EVENTS, addKeyword } = require('@bot-whatsapp/bot');

const claimFlow = require('./claim.flow');
const refundFlow = rqeuire('./refund.flow.js')
const newRequest = require('./newRequest.flow');
const informationFlow = require('./information.flow');
const subscriptionFlow = require('./subscription.flow');
const { goodbye, tryAgain } = require('./goodbye.flow');

const mainFlow = addKeyword([ EVENTS.ACTION ])
    .addAction(
        async (ctx, ctxFn) => {
            const chatwoot = ctxFn.extensions.chatwoot;
            const currentState = ctxFn.state.getMyState();
            const MESSAGE_OPTIONS = 
                '¿Cuéntanos por qué nos escribes, \n deseas cancelar tu suscripción o \n requieres información?'
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
                const MESSAGE = `Lo siento no he podido entenderte
                    \n ¿Qué deseas hacer?
                    \n 1. Información \n 2. Cancelar suscripción
                    \n 3. Cobro inesperado`

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
        [informationFlow, subscriptionFlow, claimFlow, newRequest, goodbye, tryAgain, refundFlow]
    )


module.exports = mainFlow