require('dotenv').config();
const { addKeyword } = require("@bot-whatsapp/bot");

const { subscriptionKeywords } = require("../utils/subscription.keywords");
const { tryAgain, goodbye } = require('../flows/goodbye.flow');
const { isEmail } = require('../utils/emailValidator')
const { formatDate } = require('../utils/formatDate.js')
const GoogleSheetService = require('../services/gcpSheets');

const googleSheet = new GoogleSheetService(process.env.PRIVATE_KEY_ID);

const subscriptionFlow = addKeyword(subscriptionKeywords)
  .addAction(
    async (ctx, ctxFn) => {
      const chatwoot = ctxFn.extensions.chatwoot;
      const currentState = ctxFn.state.getMyState();

      const CANCELLATION_MESSAGE = 'Para proceder con la baja de suscripción, necesitamos: \n El Correo Electrónico que usaste en mercado Pago \n ó puede darnos tu nombre y apellido'

      chatwoot.createMessage({
        msg: CANCELLATION_MESSAGE,
        mode: 'outgoing',
        conversationId: currentState.conversation_id
      })

      ctxFn.flowDynamic(CANCELLATION_MESSAGE)
    }
  )
  .addAction(
    {
      capture: true
    },
    async (ctx, ctxFn) => {
      const text = ctx.body;
      const chatwoot = ctxFn.extensions.chatwoot;
      const currentState = ctxFn.state.getMyState();
      const fallBackUser = currentState?.fallBackUser ?? 0;

      chatwoot.createMessage({
        msg: text,
        mode: 'incoming',
        conversationId: currentState.conversation_id
      })

      if (!isEmail(text) && !text.split(' ').length > 1) {

        if (fallBackUser > 2) {
          return ctxFn.gotoFlow(tryAgain)
        }

        ctxFn.state.update({
          fallBackUser: fallBackUser + 1
        });

        const FALLBACK_MESSAGE = 'Esto no parece un correo electrónico ni un correo electrónico 🙁, \n Tampoco parecen ser un nombre o apellido, \n Por favor ingresa un correo ó tu nombre y apellido'

        chatwoot.createMessage({
          msg: FALLBACK_MESSAGE,
          mode: 'outgoing',
          conversationId: currentState.conversation_id
        })

        ctxFn.fallBack(FALLBACK_MESSAGE)
      }

      ctxFn.state.update({
        user: text
      });

      const REASON_MESSAGE = 'Nos indicas el motivo por el que cancelas la suscripción 😢'

      chatwoot.createMessage({
        msg: REASON_MESSAGE,
        mode: 'outgoing',
        conversationId: currentState.conversation_id
      })

      ctxFn.flowDynamic(REASON_MESSAGE)
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

      chatwoot.createMessage({
        msg: text,
        mode: 'incoming',
        conversationId: currentState.conversation_id
      })


      if (text.length < 4) {

        const FALLBACK_MESSAGE = 'Esto no parece un motivo'

        chatwoot.createMessage({
          msg: FALLBACK_MESSAGE,
          mode: 'outgoing',
          conversationId: currentState.conversation_id
        })

        ctxFn.fallBack(FALLBACK_MESSAGE)
      }

      ctxFn.state.update({
        reason: text
      })
    }
  )
  .addAction(
    async (ctx, ctxFn) => {
      console.log('se dispara el guardado')
      const chatwoot = ctxFn.extensions.chatwoot;
      const currentState = ctxFn.state.getMyState();
      const currentDate = new Date()
      const submitCurrentDate = new Date(currentDate);

      submitCurrentDate.setDate(currentDate.getDate() + 30);

      const code = `N-${currentDate.getTime().toString()}`;

      const request = {
        user: currentState.user,
        reason: currentState.reason,
        code: code,
        requestDate: formatDate(currentDate),
        unsubscribeDate: formatDate(submitCurrentDate),
      }

      console.log('request in sheets')

      await googleSheet.saveRequest(request);

      const LAST_MESSAGE = '```Tu solicitud ha sido guardada existosamente, _por favor, guarda tú número de solicitud_```'

      ctxFn.flowDynamic(LAST_MESSAGE);

      chatwoot.createMessage({
        msg: LAST_MESSAGE,
        mode: 'outgoing',
        conversationId: currentState.conversation_id
      })

      const CODE_MESSAGE = `tú número de registro es: *${request.code}*` 
      
      chatwoot.createMessage({
        msg: CODE_MESSAGE,
        mode: 'outgoing',
        conversationId: currentState.conversation_id
      })

      ctxFn.flowDynamic(CODE_MESSAGE)

      ctxFn.state.update({
        code: request.code
      });

      ctxFn.gotoFlow(goodbye, ctxFn);
    }
  )

module.exports = subscriptionFlow;