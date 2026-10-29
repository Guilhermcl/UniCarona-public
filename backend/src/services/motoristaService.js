import {
  validarCNH,
  validarPlaca,
  normalizarPlaca,
  lerData,
  calcularIdade,
  cnhVencida,
  CATEGORIAS_CARRO,
  somenteDigitos,
  mascararCPF,
  mascararCNH,
  formatarPlaca,
} from '../utils/validacoes.js';

export const VERSAO_TERMOS = '1.0';
export const IDADE_MINIMA_MOTORISTA = 18;

// Valida os dados de habilitacao. Devolve { erro } ou { dados }.
export function validarDadosMotorista({ dataNascimento, cnhNumero, cnhCategoria, cnhValidade }) {
  const nascimento = lerData(dataNascimento);
  if (!nascimento) return { erro: 'Data de nascimento invalida.' };
  if (calcularIdade(nascimento) < IDADE_MINIMA_MOTORISTA) {
    return { erro: 'E preciso ter 18 anos ou mais para oferecer caronas.' };
  }

  if (!validarCNH(cnhNumero)) return { erro: 'Numero da CNH invalido.' };

  const categoria = String(cnhCategoria || '').toUpperCase().trim();
  if (!CATEGORIAS_CARRO.includes(categoria)) {
    return { erro: 'Categoria da CNH nao permite dirigir carro (precisa ser B ou superior).' };
  }

  const validade = lerData(cnhValidade);
  if (!validade) return { erro: 'Validade da CNH invalida.' };
  if (cnhVencida(validade)) return { erro: 'Sua CNH esta vencida. Renove para oferecer caronas.' };

  return {
    dados: {
      dataNascimento,
      cnhNumero: somenteDigitos(cnhNumero),
      cnhCategoria: categoria,
      cnhValidade,
    },
  };
}

// Valida os dados do veiculo. Devolve { erro } ou { dados }.
export function validarVeiculo(veiculo) {
  if (!veiculo) return { erro: 'Informe os dados do veiculo.' };
  const { placa, modelo, cor, ano, capacidade } = veiculo;

  if (!validarPlaca(placa)) {
    return { erro: 'Placa invalida. Use o formato ABC1D23 (Mercosul) ou ABC-1234.' };
  }
  if (!modelo || String(modelo).trim().length < 2) return { erro: 'Informe o modelo do veiculo.' };
  if (!cor || String(cor).trim().length < 3) return { erro: 'Informe a cor do veiculo.' };

  const anoAtual = new Date().getFullYear();
  const anoNum = Number(ano);
  if (!Number.isInteger(anoNum) || anoNum < 1980 || anoNum > anoAtual + 1) {
    return { erro: 'Ano do veiculo invalido.' };
  }

  const capNum = Number(capacidade || 5);
  if (!Number.isInteger(capNum) || capNum < 2 || capNum > 9) {
    return { erro: 'Lugares do veiculo invalidos (de 2 a 9, contando o motorista).' };
  }

  return {
    dados: {
      placa: normalizarPlaca(placa),
      modelo: String(modelo).trim(),
      cor: String(cor).trim(),
      ano: anoNum,
      capacidade: capNum,
    },
  };
}

// LGPD: dados que podem sair da API sobre o usuario (documentos mascarados).
export function usuarioPublico(u) {
  if (!u) return null;
  return {
    id: u.id,
    nome: u.nome,
    email: u.email,
    telefone: u.telefone,
    e_motorista: u.e_motorista,
    avaliacao_media: u.avaliacao_media,
    total_avaliacoes: u.total_avaliacoes,
    cpf_mascarado: mascararCPF(u.cpf),
    tem_cpf: !!u.cpf,
    cnh_mascarada: mascararCNH(u.cnh_numero),
    cnh_categoria: u.cnh_categoria || null,
    cnh_validade: u.cnh_validade || null,
  };
}

export function veiculoPublico(v) {
  if (!v) return null;
  return {
    id: v.id,
    placa: formatarPlaca(v.placa),
    modelo: v.modelo,
    cor: v.cor,
    ano: v.ano,
    capacidade: v.capacidade,
  };
}

// Traduz violacoes de UNIQUE do Postgres em mensagens amigaveis.
export function mensagemDuplicidade(err) {
  if (err.code !== '23505') return null;
  const c = err.constraint || '';
  if (c.includes('cpf')) return 'CPF ja cadastrado em outra conta.';
  if (c.includes('cnh')) return 'CNH ja cadastrada em outra conta.';
  if (c.includes('placa')) return 'Voce ja cadastrou um veiculo com essa placa.';
  if (c.includes('email')) return 'E-mail ja cadastrado.';
  return 'Registro duplicado.';
}
