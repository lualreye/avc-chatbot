const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const informationFlow = addKeyword(EVENTS.ACTION)
  .addAction(async (_, { state, flowDynamic }) => {
    const currentState = state.getMyState();
    return flowDynamic('Hola soy el encargado de darte la informacion adecuada de tu registro', currentState)
  })

module.exports = informationFlow;