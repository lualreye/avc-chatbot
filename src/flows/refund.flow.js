const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const newRequest = require('./newRequest.flow');

const GoogleSheetService = require('../services/gcpSheets');

const googleSheet = new GoogleSheetService(process.env.PRIVATE_KEY_ID);

const refundFlow = addKeyword(EVENTS.ACTION)
  .addAction(
    async (ctx, ctxFn) => {
      const chatwoot = ctxFn.extensions.chatwoot;
      const currentState = ctxFn.state.getMyState();

      console.log(ctx);

      const REASON_MESSAGE = 'Entendemos la situación, por eso hemos registrado tu reclamo y se contactarán contigo para comunicar la solución. Gracias'

      const currentDate = new Date()
      const submitCurrentDate = new Date(currentDate);

      submitCurrentDate.setDate(currentDate.getDate() + 12);

      const code = `N-${currentDate.getTime().toString()}`;

      chatwoot.createMessage({
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

      await googleSheet.refundRequest(request)

      await ctxFn.gotoFlow(newRequest);
    }
)

module.exports = refundFlow;