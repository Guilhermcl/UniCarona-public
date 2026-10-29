import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANTE: troque pelo IP da sua máquina na rede local.
// No Windows, rode "ipconfig" e use o IPv4 (ex: 192.168.0.105).
// NÃO use "localhost" — o celular não enxerga o localhost do PC.
// Para emulador Android, "10.0.2.2" aponta para o localhost do PC.
const BASE_URL = 'http://192.168.15.141:3333';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Antes de cada requisição, injeta o token salvo (se houver).
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@unicarona:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
