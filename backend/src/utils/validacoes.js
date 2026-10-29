// Validacoes de documentos e regras legais usadas no cadastro e nas caronas.

export const somenteDigitos = (valor) => String(valor || '').replace(/\D/g, '');

// CPF: 11 digitos + 2 digitos verificadores (regra da Receita Federal).
export function validarCPF(valor) {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calcularDigito = (base, pesoInicial) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (pesoInicial - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = calcularDigito(cpf.slice(0, 9), 10);
  const d2 = calcularDigito(cpf.slice(0, 10), 11);
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
}

// CNH (numero de registro): 11 digitos + 2 digitos verificadores (regra do Denatran).
export function validarCNH(valor) {
  const cnh = somenteDigitos(valor);
  if (cnh.length !== 11 || /^(\d)\1{10}$/.test(cnh)) return false;

  let soma = 0;
  for (let i = 0, peso = 9; i < 9; i++, peso--) soma += Number(cnh[i]) * peso;
  let dv1 = soma % 11;
  let desconto = 0;
  if (dv1 >= 10) {
    dv1 = 0;
    desconto = 2;
  }

  soma = 0;
  for (let i = 0, peso = 1; i < 9; i++, peso++) soma += Number(cnh[i]) * peso;
  const resto = soma % 11;
  const dv2 = resto >= 10 ? 0 : resto - desconto;

  return `${dv1}${dv2}` === cnh.slice(9);
}

// Categorias que permitem dirigir automovel (art. 143 do CTB).
export const CATEGORIAS_CARRO = ['B', 'AB', 'C', 'AC', 'D', 'AD', 'E', 'AE'];

export function normalizarPlaca(valor) {
  return String(valor || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Placa antiga (ABC1234) ou Mercosul (ABC1D23).
export function validarPlaca(valor) {
  const placa = normalizarPlaca(valor);
  return /^[A-Z]{3}\d{4}$/.test(placa) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(placa);
}

export function formatarPlaca(valor) {
  const placa = normalizarPlaca(valor);
  return /^[A-Z]{3}\d{4}$/.test(placa) ? `${placa.slice(0, 3)}-${placa.slice(3)}` : placa;
}

// Recebe "AAAA-MM-DD" e devolve um Date valido, ou null.
export function lerData(valor) {
  const m = String(valor || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const data = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (data.getFullYear() !== Number(m[1]) || data.getMonth() !== Number(m[2]) - 1) return null;
  return data;
}

export function calcularIdade(dataNascimento, hoje = new Date()) {
  let idade = hoje.getFullYear() - dataNascimento.getFullYear();
  const mes = hoje.getMonth() - dataNascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) idade--;
  return idade;
}

export function cnhVencida(validade, hoje = new Date()) {
  const fimDoDia = new Date(validade);
  fimDoDia.setHours(23, 59, 59, 999);
  return fimDoDia < hoje;
}

// LGPD: nunca exibir documento completo. Ex: ***.456.789-**
export function mascararCPF(valor) {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11) return null;
  return `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`;
}

export function mascararCNH(valor) {
  const cnh = somenteDigitos(valor);
  if (cnh.length !== 11) return null;
  return `*******${cnh.slice(7)}`;
}

// Distancia em linha reta entre duas coordenadas (formula de Haversine), em km.
export function distanciaKm(lat1, lng1, lat2, lng2) {
  const rad = (g) => (g * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Carona solidaria: o rateio so pode cobrir o custo da viagem, sem lucro.
// Custo estimado = distancia por estrada (linha reta x 1,3) x custo por km.
// O custo e dividido entre motorista e passageiros (vagas + 1).
export function calcularTetoRateio({ origemLat, origemLng, destinoLat, destinoLng, vagas }) {
  const custoKm = Number(process.env.RATEIO_CUSTO_KM || 0.7);
  const minimo = Number(process.env.RATEIO_MINIMO || 5);
  const semRota = Number(process.env.RATEIO_TETO_SEM_ROTA || 50);

  const temRota = [origemLat, origemLng, destinoLat, destinoLng].every(
    (v) => v !== null && v !== undefined && v !== '' && !Number.isNaN(Number(v))
  );
  if (!temRota) return { teto: semRota, distanciaKm: null };

  const km = distanciaKm(
    Number(origemLat), Number(origemLng), Number(destinoLat), Number(destinoLng)
  ) * 1.3;
  const porPessoa = (km * custoKm) / (Number(vagas) + 1);
  const teto = Math.max(minimo, Math.ceil(porPessoa * 2) / 2);
  return { teto, distanciaKm: Math.round(km) };
}
