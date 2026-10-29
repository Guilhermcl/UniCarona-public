import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { enviarMensagemGemini } from '../utils/geminiClient';
import { cores, espacamento, raio, sombras } from '../theme';

export default function ChatScreen() {
  const [mensagens, setMensagens] = useState([
    {
      autor: 'bot',
      texto: 'Ola! Sou o assistente do UniCarona. Posso ajudar com duvidas sobre o app, dicas de seguranca e transito. Como posso ajudar?',
    },
  ]);
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const scrollRef = useRef(null);

  async function enviar() {
    const pergunta = texto.trim();
    if (!pergunta || carregando) return;

    const novasMensagens = [...mensagens, { autor: 'user', texto: pergunta }];
    setMensagens(novasMensagens);
    setTexto('');
    setCarregando(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const resposta = await enviarMensagemGemini(novasMensagens);
      setMensagens((prev) => [...prev, { autor: 'bot', texto: resposta }]);
    } catch (e) {
      setMensagens((prev) => [
        ...prev,
        { autor: 'bot', texto: 'Desculpe, tive um problema. Tente de novo.' },
      ]);
    } finally {
      setCarregando(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.lista}
        contentContainerStyle={{ padding: espacamento.medio }}
      >
        {mensagens.map((msg, i) => (
          <View
            key={i}
            style={[styles.balao, msg.autor === 'user' ? styles.balaoUser : styles.balaoBot]}
          >
            <Text style={msg.autor === 'user' ? styles.textoUser : styles.textoBot}>
              {msg.texto}
            </Text>
          </View>
        ))}
        {carregando && (
          <View style={[styles.balao, styles.balaoBot]}>
            <ActivityIndicator color={cores.primaria} />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={texto}
          onChangeText={setTexto}
          placeholder="Digite sua duvida..."
          placeholderTextColor={cores.textoClaro}
          multiline
          onSubmitEditing={enviar}
        />
        <TouchableOpacity
          style={[styles.botaoEnviar, (!texto.trim() || carregando) && styles.botaoDesabilitado]}
          onPress={enviar}
          disabled={!texto.trim() || carregando}
          activeOpacity={0.8}
        >
          <IconeEnviar />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function IconeEnviar() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M22 2L11 13" stroke={cores.branco} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={cores.branco} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  lista: { flex: 1 },
  balao: {
    maxWidth: '80%', padding: espacamento.medio, borderRadius: raio.grande,
    marginVertical: 6, ...sombras.card,
  },
  balaoBot: {
    backgroundColor: cores.branco, alignSelf: 'flex-start',
    borderBottomLeftRadius: 4, borderLeftWidth: 3, borderLeftColor: cores.primaria,
  },
  balaoUser: {
    backgroundColor: cores.primaria, alignSelf: 'flex-end', borderBottomRightRadius: 4,
  },
  textoBot: { fontSize: 15, color: cores.texto, lineHeight: 21 },
  textoUser: { fontSize: 15, color: cores.branco, lineHeight: 21 },
  inputArea: {
    flexDirection: 'row', alignItems: 'flex-end', padding: espacamento.pequeno,
    backgroundColor: cores.branco, borderTopWidth: 1, borderTopColor: cores.borda,
  },
  input: {
    flex: 1, backgroundColor: cores.fundo, borderRadius: raio.grande,
    paddingHorizontal: espacamento.medio, paddingVertical: 10, fontSize: 15,
    color: cores.texto, maxHeight: 100, marginRight: espacamento.pequeno,
  },
  botaoEnviar: {
    backgroundColor: cores.primaria, width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  botaoDesabilitado: { opacity: 0.4 },
});
