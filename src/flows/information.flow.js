const { addKeyword } = require("@bot-whatsapp/bot");

const { informationKeywords } = require("../utils/subscription.keywords");
const { isCode } = require('../utils/codeValidator');
const { isEmail } = require('../utils/emailValidator');
const GoogleSheetService = require('../services/gcpSheets');

const googleSheet = new GoogleSheetService(process.env.PRIVATE_KEY_ID);

const informationFlow = addKeyword(informationKeywords)
  .addAnswer(
    'Puedes ayudarme con tú número solicitud o correo electronico',
    {
      capture: true
    },
    async (ctx, { state, fallBack, flowDynamic, endFlow }) => {
      const text = ctx.body;

      if (!isCode(text) && !isEmail(text)) {
        fallBack(
          [
            'Esto no parece un código de solicitud',
          ]
        )
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
          endFlow()
        }
        flowDynamic('Parece que este codigo no existe :(')
      }
    }
  )

module.exports = informationFlow;