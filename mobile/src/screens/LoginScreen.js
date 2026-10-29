import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import Botao from '../components/Botao';
import Logo from '../components/Logo';
import { cores, espacamento } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    setCarregando(true);
    try {
      await login(email.trim(), senha);
    } catch (err) {
      const msg = err.response?.data?.erro || 'Falha ao entrar. Verifique a conexão.';
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
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.logoContainer}>
          <Logo tamanho={130} />
        </View>
        <Text style={styles.subtitulo}>Caronas entre universitários</Text>

        <View style={styles.formulario}>
          <Input
            rotulo="E-MAIL INSTITUCIONAL"
            placeholder="seunome@universidade.edu.br"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            rotulo="SENHA"
            placeholder="Sua senha"
            value={senha}
            onChangeText={setSenha}
            senha
          />

          <Botao titulo="Entrar" onPress={handleLogin} carregando={carregando} />
          <Botao
            titulo="Criar conta"
            variante="contorno"
            onPress={() => navigation.navigate('Cadastro')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: espacamento.grande },
  logoContainer: { alignItems: 'center', marginBottom: espacamento.medio },
  subtitulo: {
    fontSize: 15, color: cores.textoSecundario, textAlign: 'center',
    marginBottom: espacamento.grande, fontWeight: '500',
  },
  formulario: { marginTop: espacamento.pequeno },
});
