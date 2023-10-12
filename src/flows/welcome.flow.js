const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const mainFlow = require("./main.flow");

const chatwootMiddleware = require('../middleware/chatwoot.middleware');
const hasRequestedMiddleware = require("../middleware/hasRequested.middleware");

const welcomeFlow = addKeyword(EVENTS.WELCOME)
  .addAction((_, { endFlow, globalState }) => {
    const currentGlobalState = globalState.getMyState();
    if (!currentGlobalState.status) {
        return endFlow();
    }
  })
  .addAction(chatwootMiddleware)
  .addAction(hasRequestedMiddleware)
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

      const MESSAGE = 'Este es el asistente virtual de AVC'
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