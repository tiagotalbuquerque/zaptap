import axios from 'axios';
import { format } from 'date-fns';
import { Configuration, OpenAIApi } from 'openai';

const evolutionApi = axios.create({
  baseURL: process.env.EVOLUTION_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'apikey': process.env.EVOLUTION_API_KEY
  }
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function fetchMessages() {
  try {
    const response = await evolutionApi.get('/messages/fetch');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar mensagens da Evolution API:', error);
    throw error;
  }
}

export async function saveMessages(supabase, messages) {
  try {
    const processedMessages = await Promise.all(messages.map(async (msg) => {
      if (msg.type === 'audio') {
        const transcription = await transcribeAudio(msg.audioUrl);
        return {
          message_id: msg.id,
          sender: msg.sender,
          recipient: msg.recipient,
          content: `[Audio Transcription]: ${transcription}`,
          timestamp: msg.timestamp,
          type: 'transcription'
        };
      }
      return {
        message_id: msg.id,
        sender: msg.sender,
        recipient: msg.recipient,
        content: msg.content,
        timestamp: msg.timestamp,
        type: msg.type
      };
    }));

    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert(processedMessages);

    if (error) throw error;
    console.log('Mensagens salvas com sucesso:', data);
  } catch (error) {
    console.error('Erro ao salvar mensagens no Supabase:', error);
    throw error;
  }
}

async function transcribeAudio(audioUrl) {
  try {
    const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });
    const audioBuffer = Buffer.from(audioResponse.data, 'binary');

    const response = await openai.createTranscription(
      audioBuffer,
      "whisper-1"
    );

    return response.data.text;
  } catch (error) {
    console.error('Erro ao transcrever áudio:', error);
    return '[Transcription failed]';
  }
}

export async function getConversationHistory(supabase, participants, page = 1, limit = 50) {
  const offset = (page - 1) * limit;

  try {
    const { data, error, count } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact' })
      .or(`sender.in.(${participants.join(',')}),recipient.in.(${participants.join(',')})`)
      .order('timestamp', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const formattedMessages = data.map(formatMessage);

    return {
      messages: formattedMessages.join('\n'),
      totalCount: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit)
    };
  } catch (error) {
    console.error('Erro ao buscar histórico de conversa:', error);
    throw error;
  }
}

function formatMessage(message) {
  const timestamp = format(new Date(message.timestamp), 'dd/MM/yy HH:mm');
  const content = message.type === 'transcription' ? message.content : `"${message.content}"`;
  return `[${timestamp}] ${message.sender}: ${content}`;
}
