import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import api from '../api/client';
import Botao from '../components/Botao';
import MapaCarona from '../components/MapaCarona';
import Estrelas from '../components/Estrelas';
import { useLocalizacao } from '../utils/useLocalizacao';
import { cores, espacamento, raio, sombras } from '../theme';

export default function DetalheCaronaScreen({ route, navigation }) {
  const { id } = route.params;
  const [carona, setCarona] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [solicitando, setSolicitando] = useState(false);
  const { localizacao } = useLocalizacao();

  useEffect(() => {
    async function carregar() {
      try {
        const resposta = await api.get(`/caronas/${id}`);
        setCarona(resposta.data);
      } catch (err) {
        Alert.alert('Erro', 'Nao foi possivel carregar a carona.');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [id]);

  async function solicitarVaga() {
    setSolicitando(true);
    try {
      await api.post('/solicitacoes', { caronaId: id });
      Alert.alert('Pronto!', 'Solicitacao enviada ao motorista.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const msg = err.response?.data?.erro || 'Erro ao solicitar vaga.';
      Alert.alert('Atencao', msg);
    } finally {
      setSolicitando(false);
    }
  }

  if (carregando) {
    return <ActivityIndicator size="large" color={cores.primaria} style={{ marginTop: 60 }} />;
  }

  if (!carona) return null;

  const data = new Date(carona.data_hora);

  // Monta os pontos para o mapa (se as coordenadas existirem)
  const temCoordenadas =
    carona.origem_lat && carona.origem_lng && carona.destino_lat && carona.destino_lng;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: espacamento.medio }}>
      {/* MAPA - aparece no topo se houver coordenadas */}
      {temCoordenadas && (
        <View style={[styles.mapaContainer, sombras.card]}>
          <MapaCarona
            origem={{
              lat: Number(carona.origem_lat),
              lng: Number(carona.origem_lng),
              nome: carona.origem,
            }}
            destino={{
              lat: Number(carona.destino_lat),
              lng: Number(carona.destino_lng),
              nome: carona.destino,
            }}
            usuario={localizacao}
            altura={260}
            mostrarRota
          />
        </View>
      )}

      <View style={[styles.bloco, sombras.card]}>
        <Text style={styles.label}>ORIGEM</Text>
        <Text style={styles.valorGrande}>{carona.origem}</Text>
        <View style={styles.divisor} />
        <Text style={styles.label}>DESTINO</Text>
        <Text style={styles.valorGrande}>{carona.destino}</Text>
      </View>

      <View style={[styles.bloco, sombras.card]}>
        <Linha titulo="Data" valor={data.toLocaleDateString('pt-BR')} />
        <Linha
          titulo="Horario"
          valor={data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        />
        <Linha titulo="Vagas disponiveis" valor={String(carona.vagas_disponiveis)} />
        <Linha
          titulo="Valor (rateio)"
          valor={Number(carona.valor) > 0 ? `R$ ${Number(carona.valor).toFixed(2)}` : 'Gratis'}
        />
      </View>

      <View style={[styles.bloco, sombras.card]}>
        <Text style={styles.label}>MOTORISTA</Text>
        <Text style={styles.valorGrande}>{carona.motorista_nome}</Text>
        <View style={{ marginTop: 6 }}>
          <Estrelas nota={Number(carona.motorista_avaliacao || 0)} tamanho={18} mostrarNumero />
        </View>
      </View>

      {carona.veiculo_placa ? (
        <View style={[styles.bloco, sombras.card, { borderLeftColor: cores.secundaria }]}>
          <Text style={styles.label}>VEICULO</Text>
          <View style={styles.veiculoLinha}>
            <View style={styles.placa}>
              <Text style={styles.placaFaixa}>BRASIL</Text>
              <Text style={styles.placaTexto}>{carona.veiculo_placa}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.valorGrande}>{carona.veiculo_modelo}</Text>
              <Text style={styles.veiculo}>
                {carona.veiculo_cor}{carona.veiculo_ano ? ` · ${carona.veiculo_ano}` : ''}
              </Text>
            </View>
          </View>
          <Text style={styles.seguranca}>
            Por seguranca, confira a placa, o modelo e a cor antes de entrar no carro.
          </Text>
        </View>
      ) : null}

      {carona.observacoes ? (
        <View style={[styles.bloco, sombras.card]}>
          <Text style={styles.label}>OBSERVACOES</Text>
          <Text style={styles.obs}>{carona.observacoes}</Text>
        </View>
      ) : null}

      <Botao titulo="Solicitar vaga" onPress={solicitarVaga} carregando={solicitando} />
    </ScrollView>
  );
}

function Linha({ titulo, valor }) {
  return (
    <View style={styles.linha}>
      <Text style={styles.linhaTitulo}>{titulo}</Text>
      <Text style={styles.linhaValor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  mapaContainer: {
    backgroundColor: cores.branco,
    borderRadius: raio.grande,
    overflow: 'hidden',
    marginBottom: espacamento.medio,
  },
  bloco: {
    backgroundColor: cores.branco, borderRadius: raio.grande,
    padding: espacamento.medio, marginBottom: espacamento.medio,
    borderLeftWidth: 4, borderLeftColor: cores.primaria,
  },
  label: {
    fontSize: 11, color: cores.primariaEscura,
    fontWeight: '700', letterSpacing: 1, marginTop: 4,
  },
  valorGrande: { fontSize: 17, fontWeight: '700', color: cores.texto, marginTop: 4 },
  divisor: { height: 1, backgroundColor: cores.borda, marginVertical: 10 },
  avaliacao: { fontSize: 15, color: cores.estrela, marginTop: 6, fontWeight: '700' },
  veiculo: { fontSize: 14, color: cores.textoSecundario, marginTop: 4 },
  obs: { fontSize: 15, color: cores.texto, marginTop: 6 },
  veiculoLinha: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 },
  placa: {
    borderWidth: 2, borderColor: cores.texto, borderRadius: 6, backgroundColor: cores.branco,
    overflow: 'hidden', alignItems: 'center', minWidth: 110,
  },
  placaFaixa: {
    backgroundColor: '#1D4ED8', color: cores.branco, fontSize: 9, fontWeight: '800',
    letterSpacing: 2, width: '100%', textAlign: 'center', paddingVertical: 2,
  },
  placaTexto: { fontSize: 20, fontWeight: '800', letterSpacing: 2, color: cores.texto, paddingVertical: 4 },
  seguranca: {
    fontSize: 12, color: cores.textoSecundario, marginTop: 10, backgroundColor: cores.secundariaClara,
    padding: 8, borderRadius: 8,
  },
  linha: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: cores.borda,
  },
  linhaTitulo: { fontSize: 14, color: cores.textoSecundario, fontWeight: '500' },
  linhaValor: { fontSize: 15, fontWeight: '700', color: cores.texto },
});
