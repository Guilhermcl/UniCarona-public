import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { cores, raio, espacamento, sombras } from '../theme';

export default function Botao({
  titulo,
  onPress,
  variante = 'primario',
  carregando = false,
  desabilitado = false,
}) {
  const ehContorno = variante === 'contorno';

  return (
    <TouchableOpacity
      style={[
        styles.botao,
        !ehContorno && sombras.botao,
        ehContorno && styles.contorno,
        (desabilitado || carregando) && styles.desabilitado,
      ]}
      onPress={onPress}
      disabled={desabilitado || carregando}
      activeOpacity={0.85}
    >
      {carregando ? (
        <ActivityIndicator color={ehContorno ? cores.primaria : cores.branco} />
      ) : (
        <Text style={[styles.texto, ehContorno && styles.textoContorno]}>{titulo}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: cores.primaria,
    paddingVertical: 15,
    borderRadius: raio.medio,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: espacamento.pequeno,
  },
  contorno: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: cores.primaria,
  },
  desabilitado: {
    opacity: 0.5,
  },
  texto: {
    color: cores.branco,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textoContorno: {
    color: cores.primaria,
  },
});
