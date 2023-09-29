require('dotenv').config();

const { addKeyword } = require("@bot-whatsapp/bot");

const { subscriptionKeywords } = require("../utils/subscription.keywords");
const { isEmail } = require('../utils/emailValidator')
const GoogleSheetService = require('../services/gcpSheets');

const googleSheet = new GoogleSheetService(process.env.PRIVATE_KEY_ID);

const subscriptionFlow = addKeyword(subscriptionKeywords)
  .addAnswer(
    [
      'Para proceder con la baja de suscripción, necesitamos:',
      'El Correo Electrónico que usaste en mercado Pago',
      'ó puede darnos tu nombre y apellido'
    ],
    {
      capture: true
    },
    async (ctx, { state, fallBack }) => {
      const text = ctx.body;

      if (!isEmail(text) && !text.split(' ').length > 1) {
        fallBack(
          [
            'Esto no parece un correo electrónico ni un correo electrónico 🙁',
            'Por favor ingresa un correo ó tu nombre y apellido'
          ]
        )
      }

      state.update({
        user: text
      });
    }
  )
  .addAnswer(
    'Nos indicas el motivo por el que cancelas la suscripción 😢',
    {
      capture: true
    },
    async (ctx, { state, fallBack }) => {
      const text = ctx.body;

      if (text.length < 4) {
        fallBack('Esto no parece un motivo')
      }

      state.update({
        reason: text
      })
    }
  )
  .addAction(
    async (ctx, { state, flowDynamic }) => {
      try {
        const data = state.getMyState();
  
        const currentDate = new Date()
        const formattedCurrentDate = currentDate.slice(0, 11);

        const submitCurrentDate = new Date(currentDate);
        submitCurrentDate.setDate(currentDate.getDate() + 30);

        const code = `N-${currentDate.getTime().toString()}`;

        const request = {
          user: data.user,
          reason: data.reason,
          code: code,
          requestDate: formattedCurrentDate,
          unsubscribeDate: submitCurrentDate,
        }
  
        await googleSheet.saveRequest(request);
  
        state.update({
          code: request.code
        });
        flowDynamic('```Tu solicitud ha sido guardada existosamente```')
      } catch (error) {
        console.log(error)
      }
    }
  )
  .addAnswer(
    [
      '_Por favor, guarda tu número solicitud_'
    ],
    null,
    async (ctx, { state, flowDynamic, endFlow }) => {
      const myState = state.getMyState();
      flowDynamic(`tú número de registro es: *${myState.code}*`)
      endFlow()
    }
  )

module.exports = subscriptionFlow;