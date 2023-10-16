const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const newRequest = require('./newRequest.flow');

const GoogleSheetService = require('../services/gcpSheets');

const googleSheet = new GoogleSheetService(process.env.PRIVATE_KEY_ID);

const claimFlow = addKeyword(EVENTS.ACTION)
  .addAction(
    async (ctx, ctxFn) => {
      const chatwoot = ctxFn.extensions.chatwoot;
      const currentState = ctxFn.state.getMyState();

      console.log(ctx);

      const REASON_MESSAGE = 'Este aumento se debe a la implementación de una nueva modalidad de atención al cliente, que incluye una atención más personalizada y consultas ilimitadas a través de un asesor de lunes a viernes de 10 a 18 horas a través de WhatsApp.Gracias'

      const currentDate = new Date()
      const submitCurrentDate = new Date(currentDate);

      submitCurrentDate.setDate(currentDate.getDate() + 12);

      const code = `N-${currentDate.getTime().toString()}`;

      await chatwoot.createMessage({
        msg: REASON_MESSAGE,
        mode: 'outgoing',
        conversationId: currentState.conversation_id
      })

      ctxFn.flowDynamic(REASON_MESSAGE)

      const request = {
        code: code,
        name: ctx.pushName,
        phone_number: ctx.from
      }

      await googleSheet.claimRequest(request)

      await ctxFn.gotoFlow(newRequest);
    }
)

module.exports = claimFlow;