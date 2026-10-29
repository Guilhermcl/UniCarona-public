import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Estrelas from './Estrelas';
import { cores, raio, espacamento, sombras } from '../theme';

export default function CardCarona({ carona, onPress }) {
  const data = new Date(carona.data_hora);
  const dataFormatada = data.toLocaleDateString('pt-BR');
  const horaFormatada = data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      style={[styles.card, sombras.card]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.rota}>
        <View style={styles.pontos}>
          <View style={styles.bolinhaOrigem} />
          <View style={styles.linha} />
          <View style={styles.bolinhaDestino} />
        </View>
        <View style={styles.enderecos}>
          <Text style={styles.endereco} numberOfLines={1}>
            {carona.origem}
          </Text>
          <Text style={styles.endereco} numberOfLines={1}>
            {carona.destino}
          </Text>
        </View>
      </View>

      <View style={styles.rodape}>
        <Text style={styles.info}>
          {dataFormatada} · {horaFormatada}
        </Text>
        <Text style={styles.valor}>
          {Number(carona.valor) > 0 ? `R$ ${Number(carona.valor).toFixed(2)}` : 'Grátis'}
        </Text>
      </View>

      {carona.veiculo_placa ? (
        <Text style={styles.veiculo} numberOfLines={1}>
          {carona.veiculo_modelo} · {carona.veiculo_cor} · {carona.veiculo_placa}
        </Text>
      ) : null}

      <View style={styles.motoristaLinha}>
        <View style={styles.motoristaInfo}>
          <Text style={styles.motorista}>{carona.motorista_nome}</Text>
          <Estrelas nota={Number(carona.motorista_avaliacao || 0)} tamanho={13} mostrarNumero />
        </View>
        <View style={styles.vagasBadge}>
          <Text style={styles.vagasBadgeTexto}>{carona.vagas_disponiveis} vaga(s)</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cores.branco,
    borderRadius: raio.grande,
    padding: espacamento.medio,
    marginVertical: espacamento.pequeno,
    borderLeftWidth: 4,
    borderLeftColor: cores.primaria,
  },
  rota: { flexDirection: 'row', alignItems: 'center' },
  pontos: { alignItems: 'center', marginRight: espacamento.medio },
  bolinhaOrigem: {
    width: 11, height: 11, borderRadius: 6, backgroundColor: cores.primaria,
  },
  bolinhaDestino: {
    width: 11, height: 11, borderRadius: 6, backgroundColor: cores.secundaria,
  },
  linha: { width: 2, height: 28, backgroundColor: cores.bordaForte, marginVertical: 2 },
  enderecos: { flex: 1, justifyContent: 'space-between', height: 56 },
  endereco: { fontSize: 15, color: cores.texto, fontWeight: '600' },
  rodape: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: espacamento.medio,
  },
  info: { fontSize: 14, color: cores.textoSecundario, fontWeight: '500' },
  valor: { fontSize: 16, fontWeight: '800', color: cores.primaria },
  veiculo: { fontSize: 12, color: cores.textoSecundario, marginTop: 6 },
  motoristaLinha: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: espacamento.pequeno, paddingTop: espacamento.pequeno,
    borderTopWidth: 1, borderTopColor: cores.borda,
  },
  motoristaInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  motorista: { fontSize: 13, color: cores.textoSecundario },
  vagasBadge: {
    backgroundColor: cores.primariaClara,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  vagasBadgeTexto: { fontSize: 12, color: cores.primariaEscura, fontWeight: '700' },
});
