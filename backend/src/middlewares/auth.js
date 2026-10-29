import { verificarToken } from '../utils/token.js';

// Protege rotas: exige um token JWT válido no header Authorization.
// Uso: router.get('/rota', autenticar, controller)
export const autenticar = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  // Formato esperado: "Bearer <token>"
  const partes = authHeader.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ erro: 'Formato de token inválido.' });
  }

  try {
    const decoded = verificarToken(partes[1]);
    req.usuarioId = decoded.id; // disponibiliza o ID nas próximas funções
    req.usuarioEmail = decoded.email;
    return next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
};
