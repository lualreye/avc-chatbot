require('dotenv').config();

const GoogleSheetService = require('../services/gcpSheets');

const googleSheetService = new GoogleSheetService(process.env.PRIVATE_KEY_ID);

module.exports = async (ctx, ctxFn) => {
  try {
    const phone_number = ctx.from;
    const chatwoot = ctxFn.extensions.chatwoot;
    const currentState = ctxFn.state.getMyState();
  
    const requests = await googleSheetService.hasRequested(phone_number);

    if (requests[0]) {
      const MESSAGE = '*RECUERDA* que hiciste tu solicitud de baja y el proceso toma entre 12 y 30 días'
      await chatwoot.createMessage({
        msg: MESSAGE,
        mode: 'outgoing',
        conversationId: currentState.conversation_id
      })
      await ctxFn.flowDynamic(MESSAGE)
    }
    
    if (requests[1]) {
      const MESSAGE = '*RECUERDA* que hiciste tu solicitud de reintegro y está en proceso tu solicitud'
      await chatwoot.createMessage({
          msg: MESSAGE,
          mode: 'outgoing',
          conversationId: currentState.conversation_id
        })
      await ctxFn.flowDynamic(MESSAGE)
    }

  } catch (error) {
    console.log(error)
  }
}