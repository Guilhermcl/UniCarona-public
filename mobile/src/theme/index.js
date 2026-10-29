// Paleta universitária americana (estilo NYU/Yale/Northwestern)
// Tons de roxo profundo + azul-marinho com acentos dourados.
export const cores = {
  // Cor principal: roxo NYU
  primaria: '#57068C',
  primariaEscura: '#3A0466',
  primariaClara: '#F2E8FA',

  // Cor secundária: azul-marinho universitário
  secundaria: '#0A2463',
  secundariaClara: '#E8EEFB',

  // Acento dourado (para destaques tipo brasão)
  dourado: '#C9A961',

  // Fundos
  fundo: '#F7F5FA',
  branco: '#FFFFFF',
  cardSombra: 'rgba(87, 6, 140, 0.08)',

  // Textos
  texto: '#1A1033',
  textoSecundario: '#6B6483',
  textoClaro: '#A09BAF',

  // Bordas e divisores
  borda: '#E5DFEF',
  bordaForte: '#CFC5DE',

  // Status (mantidos por convenção universal de UI)
  erro: '#C53030',
  sucesso: '#2F855A',
  aviso: '#D69E2E',
  estrela: '#F6AD37',
};

export const espacamento = {
  pequeno: 8,
  medio: 16,
  grande: 24,
};

export const raio = {
  pequeno: 8,
  medio: 12,
  grande: 16,
};

// Sombras reutilizáveis (visual mais "premium")
export const sombras = {
  card: {
    shadowColor: cores.primariaEscura,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  botao: {
    shadowColor: cores.primaria,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
};
