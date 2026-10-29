import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

// Context que guarda o usuario logado e funcoes de login/logout,
// acessivel em qualquer tela via useAuth().
const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Ao abrir o app, tenta recuperar a sessao salva.
  useEffect(() => {
    async function carregarSessao() {
      const usuarioSalvo = await AsyncStorage.getItem('@unicarona:usuario');
      if (usuarioSalvo) {
        setUsuario(JSON.parse(usuarioSalvo));
      }
      setCarregando(false);
    }
    carregarSessao();
  }, []);

  async function salvarSessao(novoUsuario, token) {
    if (token) await AsyncStorage.setItem('@unicarona:token', token);
    await AsyncStorage.setItem('@unicarona:usuario', JSON.stringify(novoUsuario));
    setUsuario(novoUsuario);
  }

  async function login(email, senha) {
    const resposta = await api.post('/auth/login', { email, senha });
    await salvarSessao(resposta.data.usuario, resposta.data.token);
  }

  async function cadastrar(dados) {
    const resposta = await api.post('/auth/cadastro', dados);
    await salvarSessao(resposta.data.usuario, resposta.data.token);
  }

  async function logout() {
    await AsyncStorage.removeItem('@unicarona:token');
    await AsyncStorage.removeItem('@unicarona:usuario');
    setUsuario(null);
  }

  // Atualiza os dados do usuario (ex: depois de virar motorista).
  const atualizarUsuario = useCallback(async (novoUsuario) => {
    await AsyncStorage.setItem('@unicarona:usuario', JSON.stringify(novoUsuario));
    setUsuario(novoUsuario);
  }, []);

  // Busca os dados mais recentes no servidor. Se o token expirou, desloga.
  const recarregarUsuario = useCallback(async () => {
    try {
      const resposta = await api.get('/auth/me');
      await atualizarUsuario(resposta.data);
      return resposta.data;
    } catch (err) {
      if (err.response?.status === 401) {
        await AsyncStorage.multiRemove(['@unicarona:token', '@unicarona:usuario']);
        setUsuario(null);
      }
      return null;
    }
  }, [atualizarUsuario]);

  return (
    <AuthContext.Provider
      value={{
        usuario, carregando, login, cadastrar, logout,
        atualizarUsuario, recarregarUsuario, autenticado: !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
