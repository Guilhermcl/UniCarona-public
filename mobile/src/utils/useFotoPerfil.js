import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

/**
 * Hook para gerenciar a foto de perfil do usuario.
 * A foto fica salva localmente no dispositivo (AsyncStorage), atrelada ao email.
 */
export function useFotoPerfil(emailUsuario) {
  const [foto, setFoto] = useState(null);
  const chave = `@unicarona:foto:${emailUsuario || 'anon'}`;

  useEffect(() => {
    async function carregar() {
      try {
        const salva = await AsyncStorage.getItem(chave);
        if (salva) setFoto(salva);
      } catch (e) {}
    }
    if (emailUsuario) carregar();
  }, [emailUsuario]);

  async function escolherFoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissao necessaria', 'Precisamos de acesso as suas fotos.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!resultado.canceled && resultado.assets && resultado.assets[0]) {
      const asset = resultado.assets[0];
      const uri = `data:image/jpeg;base64,${asset.base64}`;
      setFoto(uri);
      try {
        await AsyncStorage.setItem(chave, uri);
      } catch (e) {}
    }
  }

  async function removerFoto() {
    setFoto(null);
    try {
      await AsyncStorage.removeItem(chave);
    } catch (e) {}
  }

  return { foto, escolherFoto, removerFoto };
}
