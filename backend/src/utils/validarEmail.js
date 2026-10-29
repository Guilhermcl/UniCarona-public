import dotenv from 'dotenv';

dotenv.config();

// Verifica se o e-mail pertence a um domínio institucional aceito.
// Os domínios vêm do .env (DOMINIOS_INSTITUCIONAIS).
export const ehEmailInstitucional = (email) => {
  if (!email || !email.includes('@')) return false;

  const dominios = (process.env.DOMINIOS_INSTITUCIONAIS || 'edu.br')
    .split(',')
    .map((d) => d.trim().toLowerCase());

  const dominioEmail = email.split('@')[1].toLowerCase();

  // Aceita se o domínio do e-mail termina com algum domínio permitido.
  return dominios.some((d) => dominioEmail.endsWith(d));
};
