const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const { goodbye } = require('./goodbye.flow');
const mainFlow = require('./main.flow');

const newRequest = addKeyword(EVENTS.ACTION)
  .addAction(
    async (ctx, ctxFn) => {
      const chatwoot = ctxFn.extensions.chatwoot;
      const currentState = ctxFn.state.getMyState();
      
      const QUESTION_MESSAGE = `¿Hay algo más en lo que te pueda ayudar?` 
      
      chatwoot.createMessage({
        msg: QUESTION_MESSAGE,
        mode: 'outgoing',
        conversationId: currentState.conversation_id
      })

      await ctxFn.flowDynamic(QUESTION_MESSAGE)
    }
  )
  .addAction(
    {
      capture: true
    },
    async (ctx, ctxFn) => {
      const chatwoot = ctxFn.extensions.chatwoot;
      const currentState = ctxFn.state.getMyState();
      const text = ctx.body.toLowerCase();

      if (text === 'si') {
        await ctxFn.gotoFlow(mainFlow)
      }

      if (text === 'no') {
        await ctxFn.gotoFlow(goodbye);
      }

      if (text !== 'si' && text !== 'no') {
        const FALLBACK_MESSAGE = 'No te he entendido, me puedes repetir con un si o no';

        chatwoot.createMessage({
          msg: FALLBACK_MESSAGE,
          mode: 'outgoing',
          conversationId: currentState.conversation_id
        })

        ctxFn.fallBack(FALLBACK_MESSAGE)
      }

    }
  )


module.exports = newRequest;