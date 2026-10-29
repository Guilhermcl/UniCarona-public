// Mascaras e validacoes usadas nos formularios do app.

export const digitos = (v) => String(v || '').replace(/\D/g, '');

export function mascaraCPF(v) {
  return digitos(v)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function mascaraData(v) {
  return digitos(v)
    .slice(0, 8)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
}

export function mascaraTelefone(v) {
  const d = digitos(v).slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

export function mascaraPlaca(v) {
  return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
}

export function validarCPF(v) {
  const cpf = digitos(v);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const dig = (base, peso) => {
    let s = 0;
    for (let i = 0; i < base.length; i++) s += Number(base[i]) * (peso - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dig(cpf.slice(0, 9), 10) === Number(cpf[9]) && dig(cpf.slice(0, 10), 11) === Number(cpf[10]);
}

export function validarPlaca(v) {
  const p = mascaraPlaca(v);
  return /^[A-Z]{3}\d{4}$/.test(p) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(p);
}

// "18/11/2026" (ou 18-11-2026, 2026-11-18) -> "2026-11-18". Devolve null se invalida.
export function converterData(texto) {
  const t = String(texto || '').trim();
  let m = t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (!m) {
    const n = t.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
    if (n) m = [n[0], n[3], n[2], n[1]];
  }
  if (!m) return null;
  const [d, mes, a] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const teste = new Date(a, mes - 1, d);
  if (teste.getFullYear() !== a || teste.getMonth() !== mes - 1 || teste.getDate() !== d) return null;
  return `${a}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// "2026-11-18" -> "18/11/2026"
export function dataBR(iso) {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

// "6:00", "06:00", "18h30" -> "HH:MM". Devolve null se invalida.
export function converterHora(texto) {
  const m = String(texto || '').trim().match(/^(\d{1,2})[:hH](\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export const reais = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;
