import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

/**
 * Hook que pede permissão de localização e devolve a posição atual.
 * Uso: const { localizacao, erro, carregando } = useLocalizacao();
 */
export function useLocalizacao() {
  const [localizacao, setLocalizacao] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function obterLocalizacao() {
      try {
        // Solicita permissão ao usuário
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (ativo) {
            setErro('Permissão de localização negada.');
            setCarregando(false);
          }
          return;
        }

        // Pega coordenadas atuais
        const posicao = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (ativo) {
          setLocalizacao({
            lat: posicao.coords.latitude,
            lng: posicao.coords.longitude,
          });
          setCarregando(false);
        }
      } catch (e) {
        if (ativo) {
          setErro('Erro ao obter localização: ' + e.message);
          setCarregando(false);
        }
      }
    }

    obterLocalizacao();

    return () => {
      ativo = false;
    };
  }, []);

  return { localizacao, erro, carregando };
}
