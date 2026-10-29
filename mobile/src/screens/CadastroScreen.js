import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Switch,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import Botao from '../components/Botao';
import TermosModal from '../components/TermosModal';
import {
  CamposCNH, CamposVeiculo, motoristaVazio, conferirMotorista,
  dadosMotoristaParaApi, veiculoParaApi,
} from '../components/CamposMotorista';
import { mascaraCPF, mascaraTelefone, validarCPF, digitos } from '../utils/formatos';
import { cores, espacamento } from '../theme';

export default function CadastroScreen({ navigation }) {
  const { cadastrar } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [eMotorista, setEMotorista] = useState(false);
  const [motorista, setMotorista] = useState(motoristaVazio);
  const [aceite, setAceite] = useState(false);
  const [verTermos, setVerTermos] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const alterarMotorista = (campo, valor) => setMotorista((m) => ({ ...m, [campo]: valor }));

  async function handleCadastro() {
    if (!nome.trim() || !email.trim() || !cpf || !senha) {
      Alert.alert('Atencao', 'Preencha nome, e-mail, CPF e senha.');
      return;
    }
    if (!validarCPF(cpf)) {
      Alert.alert('Atencao', 'CPF invalido. Confira os numeros.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Atencao', 'A senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (eMotorista) {
      const erro = conferirMotorista(motorista);
      if (erro) {
        Alert.alert('Atencao', erro);
        return;
      }
    }
    if (!aceite) {
      Alert.alert('Atencao', 'Para continuar, aceite os Termos de Uso e a Politica de Privacidade.');
      return;
    }

    setCarregando(true);
    try {
      await cadastrar({
        nome: nome.trim(),
        email: email.trim(),
        cpf: digitos(cpf),
        telefone: digitos(telefone),
        senha,
        aceiteTermos: true,
        eMotorista,
        ...(eMotorista
          ? { ...dadosMotoristaParaApi(motorista), veiculo: veiculoParaApi(motorista) }
          : {}),
      });
    } catch (err) {
      const msg = err.response?.data?.erro || 'Falha ao cadastrar. Verifique a conexao.';
      Alert.alert('Erro', msg);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Criar conta</Text>

        <Input rotulo="Nome completo" value={nome} onChangeText={setNome} placeholder="Seu nome" />
        <Input
          rotulo="E-mail institucional"
          value={email}
          onChangeText={setEmail}
          placeholder="seunome@universidade.edu.br"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          rotulo="CPF"
          value={cpf}
          onChangeText={(t) => setCpf(mascaraCPF(t))}
          placeholder="000.000.000-00"
          keyboardType="number-pad"
        />
        <Input
          rotulo="Telefone"
          value={telefone}
          onChangeText={(t) => setTelefone(mascaraTelefone(t))}
          placeholder="(11) 90000-0000"
          keyboardType="phone-pad"
        />
        <Input
          rotulo="Senha (min. 6 caracteres)"
          value={senha}
          onChangeText={setSenha}
          placeholder="Crie uma senha"
          senha
        />

        <View style={styles.switchLinha}>
          <Text style={styles.switchTexto}>Quero oferecer caronas (sou motorista)</Text>
          <Switch
            value={eMotorista}
            onValueChange={setEMotorista}
            trackColor={{ true: cores.primaria }}
          />
        </View>

        {eMotorista && (
          <>
            <CamposCNH valores={motorista} onChange={alterarMotorista} />
            <CamposVeiculo valores={motorista} onChange={alterarMotorista} />
          </>
        )}

        <TouchableOpacity style={styles.aceite} onPress={() => setAceite((a) => !a)} activeOpacity={0.8}>
          <View style={[styles.caixa, aceite && styles.caixaMarcada]}>
            {aceite ? <Text style={styles.check}>✓</Text> : null}
          </View>
          <Text style={styles.aceiteTexto}>
            Li e aceito os{' '}
            <Text style={styles.link} onPress={() => setVerTermos(true)}>
              Termos de Uso e a Politica de Privacidade
            </Text>{' '}
            e autorizo o uso dos meus dados conforme a LGPD.
          </Text>
        </TouchableOpacity>

        <Botao titulo="Cadastrar" onPress={handleCadastro} carregando={carregando} />
        <Botao titulo="Ja tenho conta" variante="contorno" onPress={() => navigation.goBack()} />
      </ScrollView>

      <TermosModal visivel={verTermos} onFechar={() => setVerTermos(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: espacamento.grande, paddingTop: 60 },
  titulo: {
    fontSize: 26, fontWeight: '700', color: cores.texto,
    marginBottom: espacamento.medio, textAlign: 'center',
  },
  switchLinha: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginVertical: espacamento.medio,
  },
  switchTexto: { flex: 1, fontSize: 14, color: cores.texto, marginRight: espacamento.pequeno },
  aceite: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: espacamento.medio },
  caixa: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: cores.bordaForte,
    backgroundColor: cores.branco, alignItems: 'center', justifyContent: 'center',
    marginRight: 10, marginTop: 1,
  },
  caixaMarcada: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  check: { color: cores.branco, fontWeight: '800', fontSize: 15 },
  aceiteTexto: { flex: 1, fontSize: 13, color: cores.texto, lineHeight: 19 },
  link: { color: cores.primaria, fontWeight: '700', textDecorationLine: 'underline' },
});
