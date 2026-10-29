import React, { useState } from 'react';
import { ScrollView, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import api from '../api/client';
import Botao from '../components/Botao';
import {
  CamposVeiculo, motoristaVazio, conferirVeiculo, veiculoParaApi,
} from '../components/CamposMotorista';
import { cores, espacamento } from '../theme';

export default function NovoVeiculoScreen({ navigation }) {
  const [dados, setDados] = useState(motoristaVazio);
  const [carregando, setCarregando] = useState(false);
  const alterar = (campo, valor) => setDados((d) => ({ ...d, [campo]: valor }));

  async function salvar() {
    const erro = conferirVeiculo(dados);
    if (erro) {
      Alert.alert('Atencao', erro);
      return;
    }
    setCarregando(true);
    try {
      await api.post('/veiculos', veiculoParaApi(dados));
      Alert.alert('Pronto!', 'Veiculo cadastrado.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.erro || 'Nao foi possivel cadastrar o veiculo.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: espacamento.medio }} keyboardShouldPersistTaps="handled">
        <CamposVeiculo valores={dados} onChange={alterar} />
        <Botao titulo="Salvar veiculo" onPress={salvar} carregando={carregando} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
});
