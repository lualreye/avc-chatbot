const { addKeyword } = require("@bot-whatsapp/bot");

const { informationKeywords } = require("../utils/subscription.keywords");

const informationFlow = addKeyword(informationKeywords)
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

      if (!emailValidator(text) && !text.split(' ').length > 1) {
        fallBack(
          [
            'Esto no parece un correo electrónico ni un correo electrónico 🙁',
            'Por favor ingresa un correo ó tu nombre y apellido'
          ]
        )
      }

      state.update = {
        user: text
      };
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
    async (ctx, { state }) => {
      const data = state.getMyState();

      console.log(data)
    }
  )
  .addAnswer(
    [
      'Hemo procedido a crear la solictud para dar de baja a la suscripción'
    ]
  )

module.exports = informationFlow;