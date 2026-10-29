// Assistente do UniCarona usando a API do Google Gemini.
// A chave fica so no backend (.env -> GEMINI_API_KEY), nunca dentro do app.
//
// O Google aposenta modelos com frequencia (2.0-flash, 2.5-flash...). Em vez de
// fixar um nome, o servidor pergunta a API quais modelos a chave pode usar e
// escolhe o "flash" mais novo. Se ele for aposentado, descobre outro sozinho.

const BASE = 'https://generativelanguage.googleapis.com/v1beta';

const CONTEXTO_SISTEMA = `Voce e o assistente virtual do UniCarona, um aplicativo de caronas
compartilhadas entre estudantes universitarios. Suas funcoes:

1. Ajudar usuarios com duvidas sobre o app (como oferecer carona, buscar carona,
   solicitar vaga, cadastrar CNH e veiculo, editar perfil).
2. Dar dicas de seguranca no transito e em caronas.
3. Responder perguntas gerais sobre transito, rotas e mobilidade urbana.

Regras:
- Responda em portugues do Brasil.
- Seja breve, amigavel e direto. Respostas de no maximo 4 frases.
- Use linguagem simples, adequada a estudantes.
- Se perguntarem algo fora do tema (transito, app, caronas), redirecione gentilmente.
- Nunca invente funcionalidades que nao existem no app.
- Nunca peca CPF, CNH, senha ou outros dados pessoais no chat.

Funcionalidades reais do UniCarona:
- Cadastro com e-mail institucional, CPF e aceite dos termos (LGPD)
- Motoristas cadastram CNH (numero, categoria B ou superior, validade) e o veiculo (placa, modelo, cor, ano)
- So maiores de 18 anos com CNH valida podem oferecer caronas
- Oferecer carona: origem, destino, data, hora, veiculo, vagas e valor do rateio
- O rateio tem um teto calculado pela distancia: e carona solidaria, sem lucro
- Buscar carona por destino e solicitar vaga
- Detalhes mostram motorista, modelo, cor e placa do carro: confira a placa antes de entrar
- Sistema de avaliacao por estrelas e mapa com a rota
- No Perfil e possivel excluir a conta e todos os dados (LGPD)`;

let modeloEmCache = null;

const chave = () => process.env.GEMINI_API_KEY;

// Extrai a versao do nome (ex: "models/gemini-3.8-flash" -> 3.8) para ordenar.
const versao = (nome) => {
  const m = nome.match(/gemini-(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : 0;
};

async function descobrirModelo() {
  if (process.env.GEMINI_MODEL) return `models/${process.env.GEMINI_MODEL.replace(/^models\//, '')}`;

  const r = await fetch(`${BASE}/models?pageSize=200&key=${chave()}`);
  const dados = await r.json();
  if (dados.error) throw new Error(`Gemini (listar modelos): ${dados.error.message}`);

  const candidatos = (dados.models || [])
    .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map((m) => m.name)
    .filter((n) => /gemini-[\d.]+-flash/.test(n))
    .filter((n) => !/(image|tts|audio|live|thinking|exp)/.test(n));

  if (candidatos.length === 0) throw new Error('Nenhum modelo Gemini flash disponivel para esta chave.');

  // Preferencia: versao mais nova; dentro da mesma versao, estavel antes de preview e flash antes de lite.
  const pontuar = (n) =>
    versao(n) * 100 - (/preview/.test(n) ? 10 : 0) - (/lite/.test(n) ? 5 : 0) - (/\d{3,}$/.test(n) ? 1 : 0);
  candidatos.sort((a, b) => pontuar(b) - pontuar(a));
  return candidatos[0];
}

async function gerar(modelo, contents) {
  const r = await fetch(`${BASE}/${modelo}:generateContent?key=${chave()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: CONTEXTO_SISTEMA }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
    }),
  });
  return r.json();
}

export async function responderChat(historico) {
  if (!chave()) {
    const e = new Error('GEMINI_API_KEY nao configurada no backend/.env');
    e.status = 503;
    throw e;
  }

  // Gemini exige que a conversa comece com o usuario e alterne os papeis.
  const contents = [];
  for (const msg of historico.slice(-20)) {
    const role = msg.autor === 'user' ? 'user' : 'model';
    const texto = String(msg.texto || '').slice(0, 2000);
    if (!texto) continue;
    if (contents.length === 0 && role === 'model') continue;
    const ultimo = contents[contents.length - 1];
    if (ultimo && ultimo.role === role) ultimo.parts[0].text += `\n${texto}`;
    else contents.push({ role, parts: [{ text: texto }] });
  }
  if (contents.length === 0) throw Object.assign(new Error('Mensagem vazia.'), { status: 400 });

  for (let tentativa = 0; tentativa < 2; tentativa++) {
    if (!modeloEmCache) {
      modeloEmCache = await descobrirModelo();
      console.log(`🤖 Gemini usando o modelo: ${modeloEmCache}`);
    }

    const dados = await gerar(modeloEmCache, contents);

    if (dados.error) {
      // Modelo aposentado/indisponivel: limpa o cache e descobre outro.
      if ((dados.error.code === 404 || dados.error.status === 'NOT_FOUND') && tentativa === 0
        && !process.env.GEMINI_MODEL) {
        console.log(`Modelo ${modeloEmCache} indisponivel, procurando outro...`);
        modeloEmCache = null;
        continue;
      }
      const e = new Error(`Gemini: ${dados.error.message}`);
      e.status = dados.error.code === 429 ? 429 : 502;
      throw e;
    }

    const texto = dados.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim();
    return texto || 'Nao consegui gerar uma resposta. Tente reformular a pergunta.';
  }
  throw Object.assign(new Error('Nenhum modelo Gemini respondeu.'), { status: 502 });
}
