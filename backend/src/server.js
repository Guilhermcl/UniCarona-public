import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import caronaRoutes from './routes/caronaRoutes.js';
import solicitacaoRoutes from './routes/solicitacaoRoutes.js';
import veiculoRoutes from './routes/veiculoRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();

app.use(cors()); // permite que o app mobile acesse a API
app.use(express.json({ limit: '1mb' })); // interpreta corpo das requisicoes em JSON

// Rota de teste
app.get('/', (req, res) => {
  res.json({ mensagem: 'API UniCarona rodando! 🚗' });
});

// Registro das rotas
app.use('/auth', authRoutes);
app.use('/caronas', caronaRoutes);
app.use('/solicitacoes', solicitacaoRoutes);
app.use('/veiculos', veiculoRoutes);
app.use('/chat', chatRoutes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️  GEMINI_API_KEY nao definida no .env: o assistente nao vai responder.');
  }
});
