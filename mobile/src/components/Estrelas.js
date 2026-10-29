import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { cores } from '../theme';

/**
 * Estrelas de avaliacao profissionais em SVG.
 *
 * Props:
 *  - nota: numero de 0 a 5 (aceita decimais, ex 4.3)
 *  - tamanho: tamanho de cada estrela (padrao 20)
 *  - editavel: se true, permite tocar para escolher a nota
 *  - onChange: callback(novaNota) quando editavel
 *  - mostrarNumero: exibe o numero ao lado
 */
export default function Estrelas({
  nota = 0, tamanho = 20, editavel = false, onChange, mostrarNumero = false,
}) {
  const estrelas = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      {estrelas.map((posicao) => {
        let preenchimento = 0;
        if (nota >= posicao) preenchimento = 1;
        else if (nota > posicao - 1) preenchimento = nota - (posicao - 1);

        const estrela = (
          <EstrelaSvg preenchimento={preenchimento} tamanho={tamanho} id={`star-${posicao}`} />
        );

        if (editavel) {
          return (
            <TouchableOpacity
              key={posicao}
              onPress={() => onChange && onChange(posicao)}
              activeOpacity={0.7}
              style={styles.estrelaBotao}
            >
              {estrela}
            </TouchableOpacity>
          );
        }
        return <View key={posicao} style={styles.estrelaBotao}>{estrela}</View>;
      })}
      {mostrarNumero && (
        <Text style={[styles.numero, { fontSize: tamanho * 0.7 }]}>
          {Number(nota).toFixed(1)}
        </Text>
      )}
    </View>
  );
}

function EstrelaSvg({ preenchimento, tamanho, id }) {
  const pct = Math.round(preenchimento * 100);
  const caminho =
    'M12 2L14.9 8.6L22 9.3L16.7 14.1L18.2 21L12 17.5L5.8 21L7.3 14.1L2 9.3L9.1 8.6L12 2Z';

  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor={cores.estrela} />
          <Stop offset={`${pct}%`} stopColor={cores.estrela} />
          <Stop offset={`${pct}%`} stopColor={cores.borda} />
          <Stop offset="100%" stopColor={cores.borda} />
        </LinearGradient>
      </Defs>
      <Path
        d={caminho} fill={`url(#${id})`}
        stroke={cores.dourado} strokeWidth="1" strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  estrelaBotao: { marginRight: 2 },
  numero: { marginLeft: 6, color: cores.textoSecundario, fontWeight: '700' },
});
