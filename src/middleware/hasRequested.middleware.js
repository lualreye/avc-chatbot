require('dotenv').config();

const GoogleSheetService = require('../services/gcpSheets');

const googleSheetService = new GoogleSheetService(process.env.PRIVATE_KEY_ID);

module.exports = async (ctx, ctxFn) => {
  try {
    const phone_number = ctx.from;
    const chatwoot = ctxFn.extensions.chatwoot;
    const currentState = ctxFn.state.getMyState();
  
    const requests = await googleSheetService.hasRequested(phone_number);
  
    for (let i = 0; i < requests.length; i++) {
      if ('fecha_de_baja' in requests[i]) {
        const MESSAGE = '*RECUERDA* que hiciste tu solicitud de baja y el proceso toma entre 12 y 30 días'
        chatwoot.createMessage({
          msg: MESSAGE,
          mode: 'outgoing',
          conversationId: currentState.conversation_id
        })
        ctxFn.flowDynamic(MESSAGE)
      } else {
        const MESSAGE = '*RECUERDA* que hiciste tu solicitud de reintegro y está en proceso tu solicitud'
        chatwoot.createMessage({
          msg: MESSAGE,
          mode: 'outgoing',
          conversationId: currentState.conversation_id
        })
        ctxFn.flowDynamic(MESSAGE)
      }
    }
  } catch (error) {
    console.log(error)
  }
}