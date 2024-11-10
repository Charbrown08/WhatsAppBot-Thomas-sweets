import whatsappService from './whatsappService.js'

class MessageHandler {
  constructor() {
    this.reservationState = {}
  }

  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === 'text') {
      const incomingMessage = message.text.body.toLowerCase().trim()
      const mediaFile = ['audio', 'video', 'image', 'document']

      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(message.from, message.id, senderInfo)
        await this.sendWelcomeMenu(message.from)
      } else if (mediaFile.includes(incomingMessage)) {
        await this.sendMedia(message.from, incomingMessage)
      } else if (this.reservationState[message.from]) {
        await this.handlerReservationFlow(message.from, incomingMessage)
      } else {
        const response = `Echo: ${message.text.body}`
        await whatsappService.sendMessage(message.from, response, message.id)
      }
      await whatsappService.markAsRead(message.id)
    } else if (message?.type === 'interactive') {
      const option = message?.interactive?.button_reply?.title
        .toLowerCase()
        .trim()
      await this.handleMenuOption(message.from, option)
      await whatsappService.markAsRead(message.id)
    }
  }

  isGreeting(message) {
    const greetings = [
      'hola',
      'hello',
      'hi',
      'buenas tardes',
      'buenas',
      'buenas noches',
      'buenos dias',
    ]
    return greetings.includes(message)
  }

  getSenderName(senderInfo) {
    return senderInfo.profile?.name || senderInfo.wa_id
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = this.getSenderName(senderInfo)
    const firstName = name.split(' ')[0]
    const welcomeMessage = `🎉🍰 ¡Hola ${firstName}! Bienvenido a Thomas&Sweets 🎂✨, tu rincón de dulzura en línea. 😋💖 ¿Qué delicia puedo preparar para ti hoy? 🍫🍪`
    await whatsappService.sendMessage(to, welcomeMessage, messageId)
  }

  async sendWelcomeMenu(to) {
    const menuMessage = 'Elige una Opción'
    const buttons = [
      {
        type: 'reply',
        reply: { id: 'option_1', title: 'Agendar' },
      },
      {
        type: 'reply',
        reply: { id: 'option_2', title: 'Ver' },
      },
      {
        type: 'reply',
        reply: { id: 'option_3', title: 'Consultar' },
      },

      /***
       * ! This button is not working yet
       * ! It is not sending the message to the server
       * ! we can only sent 3 buttons consecutives
       */
      // {
      //   type: 'reply',
      //   reply: { id: 'option_4', title: 'Ubicar' },
      // },
    ]

    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons)
  }

  async handleMenuOption(to, option) {
    let response

    switch (option) {
      case 'agendar':
        this.reservationState[to] = { step: 'nombre' }
        response =
          'Por Favor, ¿Nos puedes decir el nombre de quien recibirá esta dulce sorpresa? 😊'
        break
      case 'ver':
        response = 'Ver sweets'
        break
      case 'consultar':
        response = 'Consultar sweets'
        break
      case 'ubicar':
        response = 'Ubicar sweets'
        break
      default:
        response =
          'Disculpanos, No entendimos tu eleccion, por favor elige una de las opciones del menu'
    }

    await whatsappService.sendMessage(to, response)
  }

  async sendMedia(to, mediaType) {
    let mediaUrl, caption, type

    switch (mediaType) {
      case 'audio':
        mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-audio.aac'
        caption = 'Aquí tienes un archivo de audio'
        type = 'audio'
        break
      case 'video':
        mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-video.mp4'
        caption = 'Aquí tienes un video'
        type = 'video'
        break
      case 'image':
        mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-imagen.png'
        caption = 'Aquí tienes una imagen'
        type = 'image'
        break
      case 'document':
        mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-file.pdf'
        caption = 'Aquí tienes un archivo PDF'
        type = 'document'
        break
      default:
        return
    }

    await whatsappService.sendMediaMessage(to, type, mediaUrl, caption)
  }

  completeReservation(to) {
    const reservation = this.reservationState[to]
    delete this.reservationState[to]

    const clientData = [
      reservation.nombre,
      reservation.thCelular,
      reservation.thFecha,
      reservation.thDireccion,
      reservation.thTamano,
      reservation.thCantidad,
      reservation.thSabor,
      reservation.thMotivo,
      reservation.thHora,
      reservation.thPago,
      new Date().toISOString(),
    ]

    console.log('client data:', clientData)

    return `🎉 ¡Tu pedido está confirmado, para ${reservation.nombre}! 🎉
    
    Gracias por confiar en Thomas&Sweets para endulzar este momento tan especial. 🥰 Aquí tienes el resumen de tu pedido:
    
    📦 **Resumen del Pedido**
    - 🎂 **Sabor**: ${reservation.thSabor}
    - 🎉 **Motivo**: ${reservation.thMotivo}
    - 📏 **Tamaño**: ${reservation.thTamano}
    - 🔢 **Cantidad**: ${reservation.thCantidad}
    - 📅 **Fecha de entrega**: ${reservation.thFecha}
    - ⏰ **Hora de entrega**: ${reservation.thHora}
    - 💳 **Método de pago**: ${reservation.thPago}
    
    Nos aseguraremos de que todo esté perfecto para tu entrega en **${reservation.thDireccion}**.
    
    💖 ¡Prepárate para disfrutar de una experiencia deliciosa que recordarán por siempre!
    
    - Con cariño, el equipo de Thomas&Sweets 🍰✨
    `
  }

  async handlerReservationFlow(to, message) {
    const state = this.reservationState[to]
    let response

    switch (state.step) {
      case 'nombre':
        state.nombre = message
        state.step = 'thCelular'
        response = '😊 ¿Cuál es el número de quien recibirá el pedido? 📞'
        break

      case 'thCelular':
        state.thCelular = message
        state.step = 'thFecha'
        response = '¿Qué fecha prefieres para la entrega? 🗓️ (DD/MM/AAAA)'
        break

      case 'thFecha':
        state.thFecha = message
        state.step = 'thDireccion'
        response = '¿Dónde entregaremos esta sorpresa? 🏡'
        break

      case 'thDireccion':
        state.thDireccion = message
        state.step = 'thTamano'
        response = '¿Qué tamaño prefieres? 🍰 (MINI, 3/4 o MEDIA)'
        break

      case 'thTamano':
        state.thTamano = message
        state.step = 'thCantidad'
        response = '¡Perfecto! ¿Cuántas unidades necesitas?'
        break

      case 'thCantidad':
        state.thCantidad = message
        state.step = 'thSabor'
        response =
          'Elige tu sabor favorito 😋 (chocolate, vainilla, yogurt, zanahoria):'
        break

      case 'thSabor':
        state.thSabor = message
        state.step = 'thMotivo'
        response =
          '¿Cuál es el motivo de esta sorpresa? (CUMPLEAÑO, BABYSHOWER, AMOR, OTRA)🎈'
        break

      case 'thMotivo':
        state.thMotivo = message
        state.step = 'thHora'
        response = '¿A qué hora te gustaría recibirlo? ⏰ (Formato militar)'
        break

      case 'thHora':
        state.thHora = message
        state.step = 'thPago'
        response =
          '¿Con que metodo de pago deseas cancelar, efectivo o transferencia? 💸 (50% para confirmar)'
        break

      case 'thPago':
        state.thPago = message
        response = this.completeReservation(to)
        break
    }

    await whatsappService.sendMessage(to, response)
  }
}

export default new MessageHandler()
