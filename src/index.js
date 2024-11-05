import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fetchMessages, saveMessages, getConversationHistory } from './whatsapp.js';
import { authenticateApiKey } from './auth.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.json());

// Middleware de autenticação
app.use(authenticateApiKey);

app.post('/sync', async (req, res) => {
  try {
    const messages = await fetchMessages();
    await saveMessages(supabase, messages);
    res.json({ success: true, message: 'Mensagens sincronizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao sincronizar mensagens:', error);
    res.status(500).json({ success: false, message: 'Erro ao sincronizar mensagens' });
  }
});

app.get('/conversations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('sender, recipient')
      .distinct();

    if (error) throw error;

    const conversations = data.map(({ sender, recipient }) => ({
      participants: [sender, recipient].sort().join(', ')
    }));

    res.json(conversations);
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar conversas' });
  }
});

app.get('/conversations/:participants/messages', async (req, res) => {
  try {
    const participants = req.params.participants.split(',').map(p => p.trim());
    const { page = 1, limit = 50 } = req.query;

    const history = await getConversationHistory(supabase, participants, page, limit);
    res.json(history);
  } catch (error) {
    console.error('Erro ao buscar histórico de conversa:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar histórico de conversa' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
