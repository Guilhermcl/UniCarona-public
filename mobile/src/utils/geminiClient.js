import api from '../api/client';

// O assistente agora roda no backend (rota POST /chat).
// A chave do Gemini fica so no servidor (backend/.env), nunca dentro do app,
// e o servidor escolhe sozinho um modelo disponivel quando o Google aposenta outro.
export async function enviarMensagemGemini(historico) {
  try {
    const r = await api.post('/chat', { historico }, { timeout: 30000 });
    return r.data.resposta;
  } catch (err) {
    if (err.response?.data?.erro) return err.response.data.erro;
    if (err.response?.status === 401) return 'Sua sessao expirou. Saia e entre de novo na conta.';
    return 'Erro de conexao com o assistente. Verifique se o servidor esta rodando.';
  }
}
