import React, { useState, useEffect } from 'react';
import {
  Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import Botao from '../components/Botao';
import {
  CamposCNH, CamposVeiculo, motoristaVazio, conferirMotorista,
  dadosMotoristaParaApi, veiculoParaApi,
} from '../components/CamposMotorista';
import { mascaraCPF, validarCPF, digitos, dataBR } from '../utils/formatos';
import { cores, espacamento } from '../theme';

// Passageiro vira motorista, ou motorista atualiza a CNH (renovacao).
export default function TornarMotoristaScreen({ navigation }) {
  const { usuario, atualizarUsuario } = useAuth();
  const jaEMotorista = !!usuario?.e_motorista;
  const [cpf, setCpf] = useState('');
  const [dados, setDados] = useState(motoristaVazio);
  const [temVeiculo, setTemVeiculo] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: jaEMotorista ? 'Atualizar CNH' : 'Quero ser motorista' });
    if (usuario?.cnh_categoria) {
      setDados((d) => ({
        ...d,
        cnhCategoria: usuario.cnh_categoria,
        cnhValidade: dataBR(usuario.cnh_validade),
      }));
    }
    api.get('/veiculos').then((r) => setTemVeiculo(r.data.length > 0)).catch(() => {});
  }, []);

  const alterar = (campo, valor) => setDados((d) => ({ ...d, [campo]: valor }));

  async function salvar() {
    if (!usuario?.tem_cpf && !validarCPF(cpf)) {
      Alert.alert('Atencao', 'Informe um CPF valido.');
      return;
    }
    const erro = conferirMotorista(dados, { exigirVeiculo: !temVeiculo });
    if (erro) {
      Alert.alert('Atencao', erro);
      return;
    }

    setCarregando(true);
    try {
      const r = await api.patch('/auth/motorista', {
        cpf: digitos(cpf),
        ...dadosMotoristaParaApi(dados),
        ...(temVeiculo ? {} : { veiculo: veiculoParaApi(dados) }),
      });
      await atualizarUsuario(r.data.usuario);
      Alert.alert('Pronto!', 'Seus dados de motorista foram salvos.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.erro || 'Nao foi possivel salvar.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: espacamento.medio }} keyboardShouldPersistTaps="handled">
        <Text style={styles.dica}>
          Seus documentos ficam protegidos e aparecem mascarados no app. Para os passageiros,
          mostramos apenas seu nome, avaliacao e os dados do carro.
        </Text>

        {!usuario?.tem_cpf && (
          <Input
            rotulo="CPF"
            value={cpf}
            onChangeText={(t) => setCpf(mascaraCPF(t))}
            placeholder="000.000.000-00"
            keyboardType="number-pad"
          />
        )}

        <CamposCNH valores={dados} onChange={alterar} />
        {!temVeiculo && <CamposVeiculo valores={dados} onChange={alterar} />}

        <Botao titulo="Salvar" onPress={salvar} carregando={carregando} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  dica: {
    fontSize: 13, color: cores.textoSecundario, backgroundColor: cores.primariaClara,
    padding: 10, borderRadius: 8, marginBottom: espacamento.pequeno, lineHeight: 18,
  },
});
