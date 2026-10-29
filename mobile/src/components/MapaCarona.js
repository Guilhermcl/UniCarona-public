import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { cores } from '../theme';

/**
 * Componente de mapa usando Leaflet + OpenStreetMap dentro de um WebView.
 * Vantagem: gratuito, sem chave de API, funciona em qualquer dispositivo.
 *
 * Props:
 *  - origem:  { lat, lng, nome } (opcional)
 *  - destino: { lat, lng, nome } (opcional)
 *  - usuario: { lat, lng } (opcional - localização atual do dispositivo)
 *  - mostrarRota: boolean - se true, traça linha entre origem e destino
 *  - altura: number (padrão 300)
 */
export default function MapaCarona({
  origem,
  destino,
  usuario,
  mostrarRota = true,
  altura = 300,
}) {
  // HTML que será carregado dentro do WebView. Usa Leaflet (CDN gratuita).
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <style>
          body, html, #mapa { margin: 0; padding: 0; height: 100%; width: 100%; }
          .marcador-numero {
            background: ${cores.primaria};
            color: white;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          .marcador-numero.destino {
            background: ${cores.secundaria};
          }
          .marcador-usuario {
            background: ${cores.dourado};
            border-radius: 50%;
            width: 18px;
            height: 18px;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          }
        </style>
      </head>
      <body>
        <div id="mapa"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          // Dados injetados do React Native
          const origem = ${origem ? JSON.stringify(origem) : 'null'};
          const destino = ${destino ? JSON.stringify(destino) : 'null'};
          const usuario = ${usuario ? JSON.stringify(usuario) : 'null'};
          const mostrarRota = ${mostrarRota};

          // Calcula centro do mapa baseado nos pontos disponíveis
          let centro = [-23.5505, -46.6333]; // São Paulo como fallback
          if (origem) centro = [origem.lat, origem.lng];
          else if (usuario) centro = [usuario.lat, usuario.lng];

          // Inicializa o mapa
          const mapa = L.map('mapa').setView(centro, 13);

          // Tile layer do OpenStreetMap (gratuito)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19,
          }).addTo(mapa);

          const todosPontos = [];

          // Marcador da origem (A)
          if (origem) {
            const iconeOrigem = L.divIcon({
              html: '<div class="marcador-numero">A</div>',
              className: '',
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });
            L.marker([origem.lat, origem.lng], { icon: iconeOrigem })
              .addTo(mapa)
              .bindPopup('<b>Origem</b><br/>' + (origem.nome || ''));
            todosPontos.push([origem.lat, origem.lng]);
          }

          // Marcador do destino (B)
          if (destino) {
            const iconeDestino = L.divIcon({
              html: '<div class="marcador-numero destino">B</div>',
              className: '',
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });
            L.marker([destino.lat, destino.lng], { icon: iconeDestino })
              .addTo(mapa)
              .bindPopup('<b>Destino</b><br/>' + (destino.nome || ''));
            todosPontos.push([destino.lat, destino.lng]);
          }

          // Localização atual do usuário (bolinha dourada)
          if (usuario) {
            const iconeUsuario = L.divIcon({
              html: '<div class="marcador-usuario"></div>',
              className: '',
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            });
            L.marker([usuario.lat, usuario.lng], { icon: iconeUsuario })
              .addTo(mapa)
              .bindPopup('<b>Você está aqui</b>');
            todosPontos.push([usuario.lat, usuario.lng]);
          }

          // Traça a rota (linha entre origem e destino)
          if (mostrarRota && origem && destino) {
            L.polyline(
              [[origem.lat, origem.lng], [destino.lat, destino.lng]],
              { color: '${cores.primaria}', weight: 4, opacity: 0.8, dashArray: '10, 8' }
            ).addTo(mapa);
          }

          // Ajusta o zoom para mostrar todos os pontos
          if (todosPontos.length > 1) {
            mapa.fitBounds(todosPontos, { padding: [40, 40] });
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, { height: altura }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color={cores.primaria}
            style={styles.loading}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: cores.borda,
  },
  webview: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
});
