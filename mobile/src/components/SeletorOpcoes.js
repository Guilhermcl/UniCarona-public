import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { cores, espacamento } from '../theme';

// Botoes em "pilula" para escolher uma opcao (ex: categoria da CNH, veiculo).
// opcoes: [{ valor, rotulo, detalhe? }]
export default function SeletorOpcoes({ rotulo, opcoes, valor, onChange }) {
  return (
    <View style={styles.container}>
      {rotulo ? <Text style={styles.rotulo}>{rotulo}</Text> : null}
      <View style={styles.linha}>
        {opcoes.map((op) => {
          const ativo = op.valor === valor;
          return (
            <TouchableOpacity
              key={String(op.valor)}
              style={[styles.opcao, ativo && styles.opcaoAtiva]}
              onPress={() => onChange(op.valor)}
              activeOpacity={0.8}
            >
              <Text style={[styles.texto, ativo && styles.textoAtivo]}>{op.rotulo}</Text>
              {op.detalhe ? (
                <Text style={[styles.detalhe, ativo && styles.textoAtivo]}>{op.detalhe}</Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: espacamento.pequeno },
  rotulo: {
    fontSize: 13, color: cores.primariaEscura, marginBottom: 6,
    fontWeight: '600', letterSpacing: 0.3,
  },
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao: {
    borderWidth: 1.5, borderColor: cores.borda, backgroundColor: cores.branco,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  opcaoAtiva: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  texto: { fontSize: 14, fontWeight: '700', color: cores.texto },
  detalhe: { fontSize: 12, color: cores.textoSecundario, marginTop: 2 },
  textoAtivo: { color: cores.branco },
});
