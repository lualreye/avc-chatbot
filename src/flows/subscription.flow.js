const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const subscriptionFlow = addKeyword(EVENTS.ACTION)
  .addAction(async (_, { state, flowDynamic }) => {
    const currentState = state.getMyState();
    return flowDynamic('Hola soy el encargado de darle de baja a tu suscripcion', currentState)
  })

module.exports = subscriptionFlow;