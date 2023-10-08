const { addKeyword } = require("@bot-whatsapp/bot");

const { informationKeywords } = require("../utils/subscription.keywords");
const { isCode } = require('../utils/codeValidator');
const { tryAgain, goodbye } = require('../flows/goodbye.flow');
const GoogleSheetService = require('../services/gcpSheets');

const googleSheet = new GoogleSheetService(process.env.PRIVATE_KEY_ID);

const informationFlow = addKeyword(informationKeywords)
  .addAction(
    async (ctx, ctxFn) => {
      const chatwoot = ctxFn.extensions.chatwoot;
      const currentState = ctxFn.state.getMyState();
      const INITIAL_INFO_MESSAGE = 'Puedes ayudarme con tú número solicitud'

      chatwoot.createMessage({
        msg: INITIAL_INFO_MESSAGE,
        mode: 'outgoing',
        conversationId: currentState.conversation_id
      })

      ctxFn.flowDynamic(INITIAL_INFO_MESSAGE)
    }
  )
  .addAction(
    {
      capture: true
    },
    async (ctx, ctxFn) => {
      const chatwoot = ctxFn.extensions.chatwoot;
      const currentState = ctxFn.state.getMyState();
      const text = ctx.body;
      const fallBackCode = currentState?.fallBackCode ?? 0;

      const FALLBACK_MESSAGE = 'Esto no parece un código de solicitud 🧐'

      chatwoot.createMessage({
        msg: text,
        mode: 'incoming',
        conversationId: currentState.conversation_id
      })

      if (!isCode(text)) {

        if (fallBackCode > 2) {
          return ctxFn.gotoFlow(tryAgain)
        }

        ctxFn.state.update({
          fallBackCode: fallBackCode + 1
        });

        chatwoot.createMessage({
          msg: FALLBACK_MESSAGE,
          mode: 'outgoing',
          conversationId: currentState.conversation_id
        })

        ctxFn.fallBack(FALLBACK_MESSAGE)
      }



      if (isCode(text)) {
        const data = await googleSheet.getRequest(text)
        if (data !== undefined) {

          const DATA_MESSAGE = `Tus datos son los siguientes: \n codigo: ${data.code} \n usuario: ${data.user} \n Faltan ${data.timeLeft} día(s)`
          
          chatwoot.createMessage({
            msg: DATA_MESSAGE,
            mode: 'outgoing',
            conversationId: currentState.conversation_id
          })

          await ctxFn.flowDynamic(DATA_MESSAGE);
          
          await ctxFn.gotoFlow(goodbye);
        } else {

          const NO_CODE_MESSAGE = 'Parece que este codigo no existe 😵‍💫'
  
          chatwoot.createMessage({
            msg: NO_CODE_MESSAGE,
            mode: 'outgoing',
            conversationId: currentState.conversation_id
          })
  
          await ctxFn.flowDynamic(NO_CODE_MESSAGE);
          await ctxFn.gotoFlow(tryAgain)
        }

      }
    },
  )

module.exports = informationFlow;