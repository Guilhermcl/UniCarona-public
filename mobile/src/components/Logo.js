import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path, Circle, Ellipse, Defs, LinearGradient, RadialGradient, Stop, Text as SvgText, G,
} from 'react-native-svg';

/**
 * Logo do UniCarona: pin de localizacao roxo com carro dentro,
 * texto "UniCarona" e slogan. Recriada em SVG (fundo transparente).
 *
 * Props:
 *  - tamanho: largura de referencia (padrao 260)
 *  - comSlogan: mostra o slogan abaixo (padrao true)
 */
export default function Logo({ tamanho = 260, comSlogan = true }) {
  const altura = tamanho * 0.42;

  return (
    <View style={[styles.container, { width: tamanho, height: altura }]}>
      <Svg width={tamanho} height={altura} viewBox="0 0 320 135">
        <Defs>
          <LinearGradient id="pinGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#B06AF5" />
            <Stop offset="55%" stopColor="#7B2FE0" />
            <Stop offset="100%" stopColor="#3B1E8F" />
          </LinearGradient>
          <LinearGradient id="carroGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#5B2AA5" />
            <Stop offset="100%" stopColor="#2E1466" />
          </LinearGradient>
          <RadialGradient id="farol" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="60%" stopColor="#E9D5FF" />
            <Stop offset="100%" stopColor="#B06AF5" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="textoGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#3A0466" />
            <Stop offset="100%" stopColor="#7B2FE0" />
          </LinearGradient>
          <LinearGradient id="uniGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#9B5DE5" />
            <Stop offset="100%" stopColor="#5B2AA5" />
          </LinearGradient>
        </Defs>

        <G>
          <Path
            d="M52 12 C31 12 14 29 14 50 C14 74 52 108 52 108 C52 108 90 74 90 50 C90 29 73 12 52 12 Z"
            fill="url(#pinGrad)"
          />
          <Ellipse cx="40" cy="34" rx="14" ry="9" fill="#FFFFFF" opacity="0.18" />
          <G>
            <Path
              d="M30 56 L34 44 C35 41 37 40 40 40 L64 40 C67 40 69 41 70 44 L74 56 C75 59 74 62 70 62 L34 62 C30 62 29 59 30 56 Z"
              fill="url(#carroGrad)"
              stroke="#8B5CF6"
              strokeWidth="1.5"
            />
            <Path
              d="M39 44 L42 51 L62 51 L65 44 C64 42.5 62.5 42 61 42 L43 42 C41.5 42 40 42.5 39 44 Z"
              fill="#1F0D45"
              opacity="0.55"
            />
            <Circle cx="40" cy="55" r="6" fill="url(#farol)" />
            <Circle cx="64" cy="55" r="6" fill="url(#farol)" />
            <Circle cx="40" cy="55" r="2.5" fill="#FFFFFF" />
            <Circle cx="64" cy="55" r="2.5" fill="#FFFFFF" />
            <Circle cx="40" cy="63" r="4" fill="#1A0A3A" />
            <Circle cx="64" cy="63" r="4" fill="#1A0A3A" />
          </G>
        </G>

        <SvgText x="104" y="62" fontSize="38" fontWeight="bold" fill="url(#uniGrad)" fontFamily="System">
          Uni
        </SvgText>
        <SvgText x="162" y="62" fontSize="38" fontWeight="bold" fill="url(#textoGrad)" fontFamily="System">
          Carona
        </SvgText>

        {comSlogan && (
          <G>
            <SvgText x="106" y="84" fontSize="11" fill="#9B7FD4" fontFamily="System">
              Sua carona.
            </SvgText>
            <SvgText x="172" y="84" fontSize="11" fill="#5B8DEF" fontWeight="bold" fontFamily="System">
              Seu campus.
            </SvgText>
            <SvgText x="244" y="84" fontSize="11" fill="#9B7FD4" fontFamily="System">
              Sua conexao.
            </SvgText>
          </G>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
