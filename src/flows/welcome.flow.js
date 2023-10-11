const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const mainFlow = require("./main.flow");

const welcomeFlow = addKeyword(EVENTS.ACTION)
  .addAction(
    async (ctx, ctxFn) => {
      const chatwoot = ctxFn.extensions.chatwoot;
      const currentState = ctxFn.state.getMyState();

      const WELCOME_MESSAGE = 'Bienvenido!'

      chatwoot.createMessage({
        msg: WELCOME_MESSAGE,
        mode: 'outgoing',
        conversationId: currentState.conversation_id
      })

      await ctxFn.flowDynamic(WELCOME_MESSAGE)
    }
  )
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

      const MESSAGE = 'Este es el asistente virtual de AVC, ¿Cómo puedo ayudarte el día de hoy?'
      await chatwoot.createMessage({
          msg: MESSAGE,
          mode: 'outgoing',
          conversationId: currentState.conversation_id
      })

      await ctxFn.flowDynamic(MESSAGE);

      await ctxFn.gotoFlow(mainFlow)
    }
  )

module.exports = welcomeFlow;