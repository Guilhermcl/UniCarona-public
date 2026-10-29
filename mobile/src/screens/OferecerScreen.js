import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import InputAutocomplete from '../components/InputAutocomplete';
import Botao from '../components/Botao';
import SeletorOpcoes from '../components/SeletorOpcoes';
import { mascaraData, converterData, converterHora, reais } from '../utils/formatos';
import { cores, espacamento, raio } from '../theme';

export default function OferecerScreen({ navigation }) {
  const { usuario, recarregarUsuario } = useAuth();
  const [veiculos, setVeiculos] = useState([]);
  const [carregandoVeiculos, setCarregandoVeiculos] = useState(true);
  const [veiculoId, setVeiculoId] = useState(null);

  // Para origem/destino, guardamos texto + coordenadas (recebidas do autocomplete)
  const [origem, setOrigem] = useState({ texto: '', lat: null, lng: null });
  const [destino, setDestino] = useState({ texto: '', lat: null, lng: null });
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [vagas, setVagas] = useState(null);
  const [valor, setValor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [teto, setTeto] = useState(null);
  const [carregando, setCarregando] = useState(false);

  // Ao abrir a aba: confere se o token ainda vale e carrega os veiculos.
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      (async () => {
        setCarregandoVeiculos(true);
        const u = await recarregarUsuario();
        if (u?.e_motorista) {
          try {
            const r = await api.get('/veiculos');
            if (!ativo) return;
            setVeiculos(r.data);
            setVeiculoId((atual) => (r.data.some((v) => v.id === atual) ? atual : r.data[0]?.id ?? null));
          } catch (e) {
            if (ativo) setVeiculos([]);
          }
        }
        if (ativo) setCarregandoVeiculos(false);
      })();
      return () => { ativo = false; };
    }, [recarregarUsuario])
  );

  const veiculo = veiculos.find((v) => v.id === veiculoId);
  const maxVagas = veiculo ? veiculo.capacidade - 1 : 4;

  useEffect(() => {
    if (vagas && vagas > maxVagas) setVagas(maxVagas);
  }, [maxVagas]);

  // Carona solidaria: busca o valor maximo por passageiro para essa rota.
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const r = await api.get('/caronas/teto', {
          params: {
            origemLat: origem.lat, origemLng: origem.lng,
            destinoLat: destino.lat, destinoLng: destino.lng,
            vagas: vagas || 1,
          },
        });
        setTeto(r.data);
      } catch (e) {
        setTeto(null);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [origem.lat, origem.lng, destino.lat, destino.lng, vagas]);

  async function criar() {
    if (!veiculoId) {
      Alert.alert('Atencao', 'Selecione o veiculo da carona.');
      return;
    }
    if (!origem.texto || !destino.texto || !data || !hora || !vagas) {
      Alert.alert('Atencao', 'Preencha origem, destino, data, hora e vagas.');
      return;
    }
    const dataConvertida = converterData(data);
    if (!dataConvertida) {
      Alert.alert('Atencao', 'Data invalida. Use DD/MM/AAAA (ex: 18/11/2026).');
      return;
    }
    const horaConvertida = converterHora(hora);
    if (!horaConvertida) {
      Alert.alert('Atencao', 'Hora invalida. Use HH:MM (ex: 18:30).');
      return;
    }
    const valorNum = valor ? Number(valor.replace(',', '.')) : 0;
    if (Number.isNaN(valorNum) || valorNum < 0) {
      Alert.alert('Atencao', 'Valor do rateio invalido.');
      return;
    }
    if (teto && valorNum > teto.teto) {
      Alert.alert('Carona solidaria', `O valor maximo para essa rota e ${reais(teto.teto)} por passageiro.`);
      return;
    }

    if (!origem.lat || !destino.lat) {
      const continuar = await new Promise((resolve) => {
        Alert.alert(
          'Aviso',
          'Voce nao selecionou uma sugestao de endereco. A carona sera publicada sem rota no mapa. Continuar?',
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Continuar', onPress: () => resolve(true) },
          ]
        );
      });
      if (!continuar) return;
    }

    setCarregando(true);
    try {
      await api.post('/caronas', {
        veiculoId,
        origem: origem.texto,
        destino: destino.texto,
        dataHora: `${dataConvertida}T${horaConvertida}:00`,
        vagas,
        valor: valorNum,
        observacoes,
        origemLat: origem.lat,
        origemLng: origem.lng,
        destinoLat: destino.lat,
        destinoLng: destino.lng,
      });

      Alert.alert('Sucesso', 'Carona publicada!', [
        { text: 'OK', onPress: () => navigation.navigate('Buscar') },
      ]);
      setOrigem({ texto: '', lat: null, lng: null });
      setDestino({ texto: '', lat: null, lng: null });
      setData(''); setHora(''); setVagas(null); setValor(''); setObservacoes('');
    } catch (err) {
      if (err.response?.status === 401) {
        Alert.alert('Sessao expirada', 'Entre novamente na sua conta.');
        await recarregarUsuario();
        return;
      }
      Alert.alert('Erro', err.response?.data?.erro || 'Erro ao criar carona.');
    } finally {
      setCarregando(false);
    }
  }

  if (carregandoVeiculos) {
    return <ActivityIndicator size="large" color={cores.primaria} style={{ marginTop: 60 }} />;
  }

  // Passageiro ou motorista sem CNH/veiculo: explica e leva para o cadastro.
  const cnhVencida =
    usuario?.cnh_validade && new Date(`${usuario.cnh_validade}T23:59:59`) < new Date();
  if (!usuario?.e_motorista || cnhVencida || veiculos.length === 0) {
    let titulo = 'Cadastre-se como motorista';
    let texto = 'Para oferecer caronas, informe sua CNH (categoria B ou superior) e os dados do seu carro. Os passageiros vao ver o modelo, a cor e a placa.';
    let botao = 'Cadastrar CNH e veiculo';
    let destinoTela = 'TornarMotorista';
    if (usuario?.e_motorista && cnhVencida) {
      titulo = 'CNH vencida';
      texto = 'Sua CNH esta vencida. Atualize a validade para voltar a oferecer caronas.';
      botao = 'Atualizar CNH';
    } else if (usuario?.e_motorista) {
      titulo = 'Cadastre um veiculo';
      texto = 'Voce precisa de pelo menos um veiculo cadastrado para publicar caronas.';
      botao = 'Adicionar veiculo';
      destinoTela = 'NovoVeiculo';
    }
    return (
      <View style={styles.bloqueio}>
        <Text style={styles.bloqueioTitulo}>{titulo}</Text>
        <Text style={styles.bloqueioTexto}>{texto}</Text>
        <Botao titulo={botao} onPress={() => navigation.navigate('Perfil', { screen: destinoTela, initial: false })} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: espacamento.medio }} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Oferecer carona</Text>
        <Text style={styles.dica}>
          Digite um endereco e selecione uma das sugestoes que aparecerem.
        </Text>

        <SeletorOpcoes
          rotulo="Veiculo"
          opcoes={veiculos.map((v) => ({ valor: v.id, rotulo: v.placa, detalhe: `${v.modelo} · ${v.cor}` }))}
          valor={veiculoId}
          onChange={setVeiculoId}
        />

        <InputAutocomplete
          rotulo="Origem"
          valor={origem.texto}
          placeholder="Ex: Avenida Paulista, Sao Paulo"
          onSelecionar={setOrigem}
        />
        <InputAutocomplete
          rotulo="Destino"
          valor={destino.texto}
          placeholder="Ex: USP Ribeirao Preto"
          onSelecionar={setDestino}
        />

        <View style={styles.duasColunas}>
          <View style={{ flex: 1 }}>
            <Input
              rotulo="Data"
              value={data}
              onChangeText={(t) => setData(mascaraData(t))}
              placeholder="DD/MM/AAAA"
              keyboardType="number-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input rotulo="Hora" value={hora} onChangeText={setHora} placeholder="18:30" keyboardType="numbers-and-punctuation" />
          </View>
        </View>

        <SeletorOpcoes
          rotulo={`Vagas (este carro leva ate ${maxVagas})`}
          opcoes={Array.from({ length: maxVagas }, (_, i) => ({ valor: i + 1, rotulo: String(i + 1) }))}
          valor={vagas}
          onChange={setVagas}
        />

        <Input
          rotulo="Valor do rateio por passageiro (R$)"
          value={valor}
          onChangeText={setValor}
          keyboardType="decimal-pad"
          placeholder="0,00"
        />
        {teto ? (
          <Text style={styles.teto}>
            Carona solidaria: maximo de {reais(teto.teto)} por passageiro
            {teto.distanciaKm ? ` (~${teto.distanciaKm} km)` : ' (sem rota no mapa)'}.
          </Text>
        ) : null}

        <Input
          rotulo="Observacoes"
          value={observacoes}
          onChangeText={setObservacoes}
          placeholder="Ex: aceito ate 2 mochilas"
          multiline
        />

        <Botao titulo="Publicar carona" onPress={criar} carregando={carregando} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  titulo: { fontSize: 24, fontWeight: '800', color: cores.primariaEscura, marginBottom: espacamento.pequeno },
  dica: {
    fontSize: 13, color: cores.textoSecundario, backgroundColor: cores.primariaClara,
    padding: 10, borderRadius: 8, marginBottom: espacamento.pequeno,
  },
  duasColunas: { flexDirection: 'row', gap: 12 },
  teto: { fontSize: 12, color: cores.textoSecundario, marginTop: -2, marginBottom: 4 },
  bloqueio: { flex: 1, backgroundColor: cores.fundo, padding: espacamento.grande, justifyContent: 'center' },
  bloqueioTitulo: { fontSize: 22, fontWeight: '800', color: cores.primariaEscura, marginBottom: 8 },
  bloqueioTexto: {
    fontSize: 15, color: cores.textoSecundario, lineHeight: 22, marginBottom: espacamento.medio,
    backgroundColor: cores.branco, padding: espacamento.medio, borderRadius: raio.medio,
  },
});
