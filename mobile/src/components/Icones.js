import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

// Ícones profissionais em SVG inline. Recebem cor e tamanho.
// Estilo: outline (contorno), traços limpos — visual moderno e universitário.

export function IconeBuscar({ cor = '#000', tamanho = 24 }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={cor} strokeWidth="2" />
      <Path d="M21 21L16.5 16.5" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function IconeOferecer({ cor = '#000', tamanho = 24 }) {
  // Volante com seta — representa "dirigir / oferecer carona"
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={cor} strokeWidth="2" />
      <Circle cx="12" cy="12" r="2" fill={cor} />
      <Path d="M12 5V10" stroke={cor} strokeWidth="2" strokeLinecap="round" />
      <Path d="M12 14L7.5 19" stroke={cor} strokeWidth="2" strokeLinecap="round" />
      <Path d="M12 14L16.5 19" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function IconePerfil({ cor = '#000', tamanho = 24 }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={cor} strokeWidth="2" />
      <Path
        d="M4 20C4 16 7.5 14 12 14C16.5 14 20 16 20 20"
        stroke={cor}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconeMapa({ cor = '#000', tamanho = 24 }) {
  // Pin de localização
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22C12 22 19 15 19 10C19 6.13 15.87 3 12 3C8.13 3 5 6.13 5 10C5 15 12 22 12 22Z"
        stroke={cor}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="10" r="2.5" stroke={cor} strokeWidth="2" />
    </Svg>
  );
}

export function IconeChat({ cor = '#000', tamanho = 24 }) {
  // Balão de chat com 3 pontinhos
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12C21 16.4 16.97 20 12 20C10.62 20 9.31 19.73 8.14 19.24L3 20L4.27 16.06C3.47 14.86 3 13.47 3 12C3 7.6 7.03 4 12 4C16.97 4 21 7.6 21 12Z"
        stroke={cor}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Circle cx="8.5" cy="12" r="1" fill={cor} />
      <Circle cx="12" cy="12" r="1" fill={cor} />
      <Circle cx="15.5" cy="12" r="1" fill={cor} />
    </Svg>
  );
}
