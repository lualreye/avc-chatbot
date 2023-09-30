require('dotenv').config();
const { addKeyword } = require("@bot-whatsapp/bot");

const { subscriptionKeywords } = require("../utils/subscription.keywords");
const { tryAgain, goodbye } = require('../flows/goodbye.flow');
const { isEmail } = require('../utils/emailValidator')
const { formatDate } = require('../utils/formatDate.js')
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
      const currentState = state.getMyState();
      const fallBackUser = currentState?.fallBackUser ?? 0;

      if (!isEmail(text) && !text.split(' ').length > 1) {

        if (fallBackUser > 2) {
          return gotoFlow(tryAgain)
        }

        state.update({
          fallBackUser: fallBackUser + 1
        });

        fallBack(
          [
            'Esto no parece un correo electrónico ni un correo electrónico 🙁',
            'Tampoco parecen ser un nombre o apellido',
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
      const data = state.getMyState();

      const currentDate = new Date()

      const submitCurrentDate = new Date(currentDate);
      submitCurrentDate.setDate(currentDate.getDate() + 30);

      const code = `N-${currentDate.getTime().toString()}`;

      const request = {
        user: data.user,
        reason: data.reason,
        code: code,
        requestDate: formatDate(currentDate),
        unsubscribeDate: formatDate(submitCurrentDate),
      }

      await googleSheet.saveRequest(request);

      state.update({
        code: request.code
      });
      flowDynamic('```Tu solicitud ha sido guardada existosamente```');
    }
  )
  .addAnswer(
    [
      '_Por favor, guarda tu número solicitud_'
    ],
    null,
    async (ctx, { state, flowDynamic, gotoFlow }) => {
      const myState = state.getMyState();
      flowDynamic(`tú número de registro es: *${myState.code}*`)
      gotoFlow(goodbye);
    }
  )

module.exports = subscriptionFlow;