import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useFotoPerfil } from '../utils/useFotoPerfil';
import { dataBR } from '../utils/formatos';
import Botao from '../components/Botao';
import Input from '../components/Input';
import Estrelas from '../components/Estrelas';
import { cores, espacamento, raio, sombras } from '../theme';

export default function PerfilScreen({ navigation }) {
  const { usuario, logout, recarregarUsuario } = useAuth();
  const { foto, escolherFoto, removerFoto } = useFotoPerfil(usuario?.email);
  const [veiculos, setVeiculos] = useState([]);
  const [excluindo, setExcluindo] = useState(false);
  const [senhaExclusao, setSenhaExclusao] = useState('');
  const [processando, setProcessando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      recarregarUsuario();
      api.get('/veiculos').then((r) => setVeiculos(r.data)).catch(() => setVeiculos([]));
    }, [recarregarUsuario])
  );

  const cnhVencida =
    usuario?.cnh_validade && new Date(`${usuario.cnh_validade}T23:59:59`) < new Date();

  function removerVeiculo(v) {
    Alert.alert('Remover veiculo', `Remover ${v.modelo} (${v.placa})?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/veiculos/${v.id}`);
            setVeiculos((lista) => lista.filter((x) => x.id !== v.id));
          } catch (err) {
            Alert.alert('Erro', err.response?.data?.erro || 'Nao foi possivel remover.');
          }
        },
      },
    ]);
  }

  async function confirmarExclusao() {
    setProcessando(true);
    try {
      await api.delete('/auth/conta', { data: { senha: senhaExclusao } });
      setExcluindo(false);
      Alert.alert('Conta excluida', 'Seus dados pessoais foram apagados.');
      await logout();
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.erro || 'Nao foi possivel excluir a conta.');
    } finally {
      setProcessando(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center', padding: espacamento.grande }}>
      <TouchableOpacity onPress={escolherFoto} activeOpacity={0.8} style={styles.avatarWrapper}>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.avatarFoto} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{usuario?.nome?.charAt(0)?.toUpperCase() || '?'}</Text>
          </View>
        )}
        <View style={styles.cameraBadge}>
          <IconeCamera />
        </View>
      </TouchableOpacity>

      <Text style={styles.dicaFoto} onPress={escolherFoto}>
        {foto ? 'Toque para trocar a foto' : 'Toque para adicionar foto'}
      </Text>
      {foto ? <Text style={styles.removerFoto} onPress={removerFoto}>Remover foto</Text> : null}

      <Text style={styles.nome}>{usuario?.nome}</Text>
      <Text style={styles.email}>{usuario?.email}</Text>

      <View style={[styles.card, sombras.card]}>
        <Linha titulo="Tipo de conta" valor={usuario?.e_motorista ? 'Motorista' : 'Passageiro'} />
        <Linha titulo="CPF" valor={usuario?.cpf_mascarado || 'Nao informado'} />
        <View style={styles.linhaAvaliacao}>
          <Text style={styles.linhaTitulo}>Avaliacao</Text>
          <Estrelas nota={Number(usuario?.avaliacao_media || 0)} tamanho={20} mostrarNumero />
        </View>
        <Linha titulo="Total de avaliacoes" valor={String(usuario?.total_avaliacoes || 0)} semBorda />
      </View>

      {usuario?.e_motorista ? (
        <View style={[styles.card, sombras.card]}>
          <Text style={styles.cardTitulo}>Habilitacao</Text>
          <Linha titulo="CNH" valor={usuario.cnh_mascarada || '-'} />
          <Linha titulo="Categoria" valor={usuario.cnh_categoria || '-'} />
          <Linha
            titulo="Validade"
            valor={cnhVencida ? `${dataBR(usuario.cnh_validade)} (vencida)` : dataBR(usuario.cnh_validade)}
            destaque={cnhVencida}
            semBorda
          />
          <Text style={styles.acao} onPress={() => navigation.navigate('TornarMotorista')}>
            Atualizar CNH
          </Text>

          <Text style={[styles.cardTitulo, { marginTop: espacamento.medio }]}>Meus veiculos</Text>
          {veiculos.length === 0 ? (
            <Text style={styles.vazio}>Nenhum veiculo cadastrado.</Text>
          ) : (
            veiculos.map((v) => (
              <View key={v.id} style={styles.veiculo}>
                <View style={styles.placa}>
                  <Text style={styles.placaTexto}>{v.placa}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.veiculoNome}>{v.modelo}</Text>
                  <Text style={styles.veiculoInfo}>{v.cor} · {v.ano} · {v.capacidade} lugares</Text>
                </View>
                <Text style={styles.remover} onPress={() => removerVeiculo(v)}>Remover</Text>
              </View>
            ))
          )}
          <Text style={styles.acao} onPress={() => navigation.navigate('NovoVeiculo')}>
            + Adicionar veiculo
          </Text>
        </View>
      ) : (
        <View style={{ width: '100%' }}>
          <Botao titulo="Quero oferecer caronas" onPress={() => navigation.navigate('TornarMotorista')} />
        </View>
      )}

      <View style={{ width: '100%' }}>
        <Botao titulo="Sair da conta" variante="contorno" onPress={logout} />
      </View>

      <Text style={styles.excluir} onPress={() => { setSenhaExclusao(''); setExcluindo(true); }}>
        Excluir minha conta e meus dados
      </Text>

      <Modal visible={excluindo} transparent animationType="fade" onRequestClose={() => setExcluindo(false)}>
        <View style={styles.fundoModal}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>Excluir conta</Text>
            <Text style={styles.modalTexto}>
              Todos os seus dados pessoais, veiculos e caronas serao apagados. Essa acao nao pode
              ser desfeita (LGPD, art. 18).
            </Text>
            <Input
              rotulo="Confirme sua senha"
              value={senhaExclusao}
              onChangeText={setSenhaExclusao}
              senha
            />
            <Botao titulo="Excluir definitivamente" onPress={confirmarExclusao} carregando={processando} />
            <Botao titulo="Cancelar" variante="contorno" onPress={() => setExcluindo(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Linha({ titulo, valor, semBorda, destaque }) {
  return (
    <View style={[styles.linha, semBorda && { borderBottomWidth: 0 }]}>
      <Text style={styles.linhaTitulo}>{titulo}</Text>
      <Text style={[styles.linhaValor, destaque && { color: cores.erro }]}>{valor}</Text>
    </View>
  );
}

function IconeCamera() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 8C4 7 5 6 6 6H8L9.5 4H14.5L16 6H18C19 6 20 7 20 8V17C20 18 19 19 18 19H6C5 19 4 18 4 17V8Z"
        stroke={cores.branco} strokeWidth="2" strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="3" stroke={cores.branco} strokeWidth="2" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  avatarWrapper: { marginTop: espacamento.pequeno, position: 'relative' },
  avatar: {
    width: 110, height: 110, borderRadius: 55, backgroundColor: cores.primaria,
    alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: cores.dourado,
  },
  avatarFoto: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: cores.dourado },
  avatarTexto: { fontSize: 48, color: cores.branco, fontWeight: '800' },
  cameraBadge: {
    position: 'absolute', bottom: 2, right: 2, backgroundColor: cores.secundaria,
    width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: cores.branco,
  },
  dicaFoto: { fontSize: 13, color: cores.primaria, fontWeight: '600', marginTop: espacamento.pequeno },
  removerFoto: { fontSize: 12, color: cores.erro, marginTop: 4 },
  nome: { fontSize: 22, fontWeight: '700', color: cores.texto, marginTop: espacamento.medio },
  email: { fontSize: 14, color: cores.textoSecundario, marginBottom: espacamento.grande },
  card: {
    backgroundColor: cores.branco, borderRadius: raio.grande, padding: espacamento.medio,
    width: '100%', marginBottom: espacamento.medio, borderLeftWidth: 4, borderLeftColor: cores.secundaria,
  },
  cardTitulo: { fontSize: 15, fontWeight: '800', color: cores.primariaEscura, marginBottom: 4 },
  linha: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: cores.borda,
  },
  linhaAvaliacao: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: cores.borda,
  },
  linhaTitulo: { fontSize: 14, color: cores.textoSecundario, fontWeight: '500' },
  linhaValor: { fontSize: 15, fontWeight: '700', color: cores.texto },
  acao: { color: cores.primaria, fontWeight: '700', fontSize: 14, marginTop: 10 },
  vazio: { fontSize: 13, color: cores.textoSecundario, marginVertical: 6 },
  veiculo: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: cores.borda, gap: 10,
  },
  placa: {
    borderWidth: 2, borderColor: cores.secundaria, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4, backgroundColor: cores.branco,
  },
  placaTexto: { fontWeight: '800', letterSpacing: 1, color: cores.secundaria, fontSize: 13 },
  veiculoNome: { fontSize: 15, fontWeight: '700', color: cores.texto },
  veiculoInfo: { fontSize: 12, color: cores.textoSecundario, marginTop: 2 },
  remover: { color: cores.erro, fontSize: 13, fontWeight: '600' },
  excluir: {
    color: cores.erro, fontSize: 13, marginTop: espacamento.medio, marginBottom: espacamento.grande,
    textDecorationLine: 'underline',
  },
  fundoModal: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: espacamento.grande,
  },
  modal: { backgroundColor: cores.fundo, borderRadius: raio.grande, padding: espacamento.grande },
  modalTitulo: { fontSize: 20, fontWeight: '800', color: cores.erro },
  modalTexto: { fontSize: 14, color: cores.textoSecundario, marginVertical: espacamento.pequeno, lineHeight: 20 },
});
