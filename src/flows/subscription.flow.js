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

      const CANCELLATION_MESSAGE = 'Para proceder con la baja de suscripción, necesitamos: \n El *Correo Electrónico* que usaste en mercado Pago ó \n Puede darnos tu *nombre y apellido*'
      const BACK_MESSAGE = 'Para regresar al menú principal escribe *CANCELAR*'

      chatwoot.createMessage({
        msg: CANCELLATION_MESSAGE,
        mode: 'outgoing',
        conversationId: currentState.conversation_id
      })

      chatwoot.createMessage({
        msg: BACK_MESSAGE,
        mode: 'outgoing',
        conversationId: currentState.conversation_id
      })

      ctxFn.flowDynamic(CANCELLATION_MESSAGE)
      ctxFn.flowDynamic(BACK_MESSAGE)
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

        await ctxFn.fallBack(FALLBACK_MESSAGE)
      }

      await ctxFn.state.update({
        user: text
      });
    }
  )
  .addAction(
    async (ctx, ctxFn) => {
      const chatwoot = ctxFn.extensions.chatwoot;
      const currentState = ctxFn.state.getMyState();
      const currentDate = new Date()
      const submitCurrentDate = new Date(currentDate);

      submitCurrentDate.setDate(currentDate.getDate() + 30);

      const code = `N-${currentDate.getTime().toString()}`;

      const request = {
        user: currentState.user,
        code: code,
        requestDate: formatDate(currentDate),
        unsubscribeDate: formatDate(submitCurrentDate),
        status: 'pendiente'
      }

      await googleSheet.saveRequest(request);

      const LAST_MESSAGE = '```Tu solicitud ha sido guardada existosamente, por favor, guarda tú número de solicitud```'

      await   ctxFn.flowDynamic(LAST_MESSAGE);

      chatwoot.createMessage({
        msg: LAST_MESSAGE,
        mode: 'outgoing',
        conversationId: currentState.conversation_id
      })

      const CODE_MESSAGE = `${request.code}` 
      
      chatwoot.createMessage({
        msg: CODE_MESSAGE,
        mode: 'outgoing',
        conversationId: currentState.conversation_id
      })

      await ctxFn.flowDynamic(CODE_MESSAGE)

      const REMINDER_MESSAGE = `*Recuerda:*  La solicitud será procesada en un período de 12 a 30 días.` 
      
      chatwoot.createMessage({
        msg: REMINDER_MESSAGE,
        mode: 'outgoing',
        conversationId: currentState.conversation_id
      })

      await ctxFn.flowDynamic(REMINDER_MESSAGE)

      ctxFn.state.update({
        code: request.code
      });

      await ctxFn.gotoFlow(goodbye);
    },
  )

module.exports = subscriptionFlow;