import whatsappService from './whatsappService.js'

class MessageHandler {
  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === 'text') {
      const incomingMessage = message.text.body.toLowerCase().trim()
      const mediaFile = ['audio', 'video', 'image', 'document']

      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(message.from, message.id, senderInfo)
        await this.sendWelcomeMenu(message.from)
      } else if (mediaFile.includes(incomingMessage)) {
        await this.sendMedia(message.from, incomingMessage)
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
        response = 'Agendar sweets'
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
}

export default new MessageHandler()
