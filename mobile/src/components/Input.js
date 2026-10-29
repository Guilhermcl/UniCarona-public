import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { cores, raio, espacamento } from '../theme';

/**
 * Input reutilizavel. Se receber a prop "senha", mostra o botao de olho
 * para revelar/ocultar o texto digitado.
 */
export default function Input({ rotulo, senha = false, ...props }) {
  const [oculto, setOculto] = useState(senha);

  return (
    <View style={styles.container}>
      {rotulo ? <Text style={styles.rotulo}>{rotulo}</Text> : null}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholderTextColor={cores.textoClaro}
          secureTextEntry={oculto}
          {...props}
        />
        {senha && (
          <TouchableOpacity
            style={styles.olho}
            onPress={() => setOculto((v) => !v)}
            activeOpacity={0.7}
          >
            {oculto ? <OlhoFechado /> : <OlhoAberto />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function OlhoAberto() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z"
        stroke={cores.textoSecundario} strokeWidth="2" strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="3" stroke={cores.textoSecundario} strokeWidth="2" />
    </Svg>
  );
}

function OlhoFechado() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z"
        stroke={cores.textoClaro} strokeWidth="2" strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="3" stroke={cores.textoClaro} strokeWidth="2" />
      <Line x1="4" y1="4" x2="20" y2="20" stroke={cores.textoSecundario} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: espacamento.pequeno },
  rotulo: {
    fontSize: 13, color: cores.primariaEscura, marginBottom: 6,
    fontWeight: '600', letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: cores.branco, borderWidth: 1.5,
    borderColor: cores.borda, borderRadius: raio.medio,
  },
  input: {
    flex: 1, paddingHorizontal: espacamento.medio, paddingVertical: 13,
    fontSize: 16, color: cores.texto,
  },
  olho: { paddingHorizontal: 14, paddingVertical: 10 },
});
