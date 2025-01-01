import axios from 'axios';

const api = axios.create({
  baseURL: 'https://whatsapp.clube.ai',
  headers: {
    'Content-Type': 'application/json',
    'apikey': '96AD8196869A-4E92-BD1F-ECB7EE223A0F'
  }
});

const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toISOString().split('T')[0]; // Formato yyyy-MM-dd
};

const prepareMessagesForAnalysis = (messages) => {
  const conversations = messages
    .filter(msg => msg.messageType === 'conversation')
    .map(msg => ({
      name_user: msg.pushName || 'Anônimo',
      text: msg.message?.conversation || '',
      timestamp: msg.messageTimestamp,
      date: formatDate(msg.messageTimestamp)
    }));

  const userStats = {};
  conversations.forEach(msg => {
    if (!userStats[msg.name_user]) {
      userStats[msg.name_user] = {
        messageCount: 0,
        wordCount: 0
      };
    }
    userStats[msg.name_user].messageCount++;
    userStats[msg.name_user].wordCount += (msg.text.match(/\S+/g) || []).length;
  });

  return {
    messageCount: conversations.length,
    dateRange: conversations.length > 0 
      ? `${conversations[0].date} - ${conversations[conversations.length - 1].date}`
      : '',
    userStats,
    rawConversations: conversations.map(msg => ({
      ...msg,
      timestamp: msg.timestamp * 1000 // Converte para milissegundos
    }))
  };
};

export const fetchAndProcessMessages = async ({ phone, startDate, endDate }) => {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = `55${cleanPhone}@s.whatsapp.net`;

    const response = await api.post('/chat/findMessages/numero02', {
      where: {
        key: {
          remoteJid: formattedPhone
        }
      }
    });

    if (!response.data?.messages?.records) {
      throw new Error('Nenhuma mensagem encontrada para este número');
    }

    let messages = response.data.messages.records;

    if (startDate || endDate) {
      messages = messages.filter(msg => {
        const msgDate = new Date(msg.messageTimestamp * 1000);
        if (startDate && msgDate < new Date(startDate)) return false;
        if (endDate && msgDate > new Date(endDate)) return false;
        return true;
      });
    }

    const preparedData = prepareMessagesForAnalysis(messages);

    // Envia para o webhook do n8n
    const n8nResponse = await axios.post('https://seu-n8n.com/webhook/analiseconversa', {
      data: preparedData.rawConversations,
      summary: preparedData.messageCount,
      dateRange: preparedData.dateRange
    });

    return n8nResponse.data;

  } catch (error) {
    console.error('Erro na API:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Erro ao buscar mensagens'
    );
  }
};
