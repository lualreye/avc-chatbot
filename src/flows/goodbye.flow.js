const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const goodbye = addKeyword(EVENTS.ACTION)
  .addAction(
    async (ctx, ctxFn) => {
      console.log('despido')
      const chatwoot = ctxFn.extensions.chatwoot;
      const currentState = ctxFn.state.getMyState();

      const BYE_MESSAGE = 'Si te puedo ayudar en algo más no dudes de escribirme'

      chatwoot.createMessage({
        msg: BYE_MESSAGE,
        mode: 'outgoing',
        conversationId: currentState.conversation_id
      })

      ctxFn.flowDynamic(BYE_MESSAGE)

      ctxFn.endFlow()
    }
  )


const tryAgain = addKeyword(EVENTS.ACTION)
  .addAction(
    async (ctx, ctxFn) => {
      const chatwoot = ctxFn.extensions.chatwoot;
      const currentState = ctxFn.state.getMyState();

      const TRY_AGAIN_MESSAGE = 'Recuerda que estoy aquí para ayudarte con información y cancelación de suscripción'

      chatwoot.createMessage({
        msg: TRY_AGAIN_MESSAGE,
        mode: 'outgoing',
        conversationId: currentState.conversation_id
      })

      ctxFn.flowDynamic(TRY_AGAIN_MESSAGE)

      ctxFn.endFlow()
    }
)

module.exports = { goodbye, tryAgain }