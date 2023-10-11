const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const newRequest = require("./newRequest.flow");
const { tryAgain } = require('../flows/goodbye.flow');

const { isCode } = require('../utils/codeValidator');
const GoogleSheetService = require('../services/gcpSheets');

const googleSheet = new GoogleSheetService(process.env.PRIVATE_KEY_ID);

const informationFlow = addKeyword(EVENTS.ACTION)
  .addAction(
    async (ctx, ctxFn) => {
      const chatwoot = ctxFn.extensions.chatwoot;
      const currentState = ctxFn.state.getMyState();
      const INITIAL_INFO_MESSAGE = 'Puedes ayudarme con tú número solicitud \n Sino cuéntas con un número de solicitud escribe *CANCELAR*'

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

      if (text.toLowerCase() === 'cancelar') {
        const CANCELLATION_MESSAGE = 'Comencemos de nuevo, recuerda que estamos aquí para darte informción o darle de baja tu suscripción'

        chatwoot.createMessage({
          msg: CANCELLATION_MESSAGE,
          mode: 'outgoing',
          conversationId: currentState.conversation_id
        })

        ctxFn.flowDynamic(CANCELLATION_MESSAGE)
        return ctxFn.endFlow();
      }

      if (!isCode(text)) {

        if (fallBackCode > 2) {
          await ctxFn.gotoFlow(tryAgain)
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

          const DATA_MESSAGE = `Tus datos son los siguientes: 
          \n codigo: ${data.code} \n usuario: ${data.user} \n Faltan ${data.timeLeft} día(s) \n
          estado: ${data.status}`

          const INFO_MESSAGE = 'Recuerda que el proceso dura entre 12 y 30 días.'
          
          chatwoot.createMessage({
            msg: DATA_MESSAGE,
            mode: 'outgoing',
            conversationId: currentState.conversation_id
          })

          chatwoot.createMessage({
            msg: INFO_MESSAGE,
            mode: 'outgoing',
            conversationId: currentState.conversation_id
          })

          await ctxFn.flowDynamic(DATA_MESSAGE);
          await ctxFn.flowDynamic(INFO_MESSAGE);
          
          await ctxFn.gotoFlow(newRequest);
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