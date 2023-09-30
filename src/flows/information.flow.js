const { addKeyword } = require("@bot-whatsapp/bot");

const { informationKeywords } = require("../utils/subscription.keywords");
const { tryAgain, goodbye } = require('../flows/goodbye.flow');
const { isCode } = require('../utils/codeValidator');
const GoogleSheetService = require('../services/gcpSheets');

const googleSheet = new GoogleSheetService(process.env.PRIVATE_KEY_ID);

const informationFlow = addKeyword(informationKeywords)
  .addAnswer(
    'Puedes ayudarme con tú número solicitud o correo electronico',
    {
      capture: true
    },
    async (ctx, { state, fallBack, flowDynamic, gotoFlow }) => {
      const text = ctx.body;
      const currentState = state.getMyState();
      const fallBackCode = currentState?.fallBackCode ?? 0;

      if (!isCode(text)) {

        if (fallBackCode > 2) {
          return gotoFlow(tryAgain)
        }

        state.update({
          fallBackCode: fallBackCode + 1
        });

        fallBack('Esto no parece un código de solicitud 🧐')
      }



      if (isCode(text)) {
        const data = await googleSheet.getRequest(text)
        if (data !== undefined) {
          flowDynamic([
            'Tus datos son los siguientes:',
            `codigo: ${data.code}`,
            `usuario: ${data.user}`,
            `Faltan ${data.timeLeft} día(s)`,
          ])
          gotoFlow(goodbye);
        }
        flowDynamic('Parece que este codigo no existe 😵‍💫');
        gotoFlow(tryAgain)
      }
    }
  )

module.exports = informationFlow;