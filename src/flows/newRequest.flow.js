const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const mainFlow = require('./main.flow');
const { goodbye } = require('./goodbye.flow');

const newRequest = addKeyword(EVENTS.ACTION)
  .addAction(
    async (ctx, ctxFn) => {
      const chatwoot = ctxFn.extensions.chatwoot;
      const currentState = ctxFn.state.getMyState();
      
      const QUESTION_MESSAGE = `¿Hay algo más en lo que te pueda ayudar?` 
      
      await chatwoot.createMessage({
        msg: QUESTION_MESSAGE,
        mode: 'outgoing',
        conversationId: currentState.conversation_id
      })

      await ctxFn.flowDynamic(QUESTION_MESSAGE)
      console.log('terminamos primer mensaje')
    }
  )
  .addAction(
    {
      capture: true
    },
    async (ctx, ctxFn) => {
      console.log('comenzamos segundo mensaje')
      const chatwoot = ctxFn.extensions.chatwoot;
      const currentState = ctxFn.state.getMyState();
      const text = ctx.body.toLowerCase();

      console.log('request?', text)
      
      if (text === 'si') {
        await ctxFn.gotoFlow(mainFlow)
      }

      if (text === 'no') {
        console.log('goodbye')
        await ctxFn.gotoFlow(goodbye);
      }

      if (text !== 'si' && text !== 'no') {
        const FALLBACK_MESSAGE = 'No te he entendido, me puedes repetir con un si o no';

        await chatwoot.createMessage({
          msg: FALLBACK_MESSAGE,
          mode: 'outgoing',
          conversationId: currentState.conversation_id
        })

        ctxFn.fallBack(FALLBACK_MESSAGE)
      }
    },
  )


module.exports = newRequest;