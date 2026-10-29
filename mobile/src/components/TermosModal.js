import React from 'react';
import { Modal, View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import Botao from './Botao';
import { cores, espacamento } from '../theme';

export const VERSAO_TERMOS = '1.0';

const SECOES = [
  ['1. O que e o UniCarona',
    'Plataforma que conecta estudantes para dividir o custo de deslocamentos (carona solidaria). O UniCarona nao presta servico de transporte e nao cobra pelas caronas.'],
  ['2. Carona solidaria, sem lucro',
    'O valor combinado e apenas um rateio dos custos da viagem (combustivel e desgaste). O app limita o valor por passageiro de acordo com a distancia. Cobrar acima do custo pode caracterizar transporte remunerado irregular de passageiros (Lei 12.587/2012 e art. 231, VIII do CTB).'],
  ['3. Motoristas',
    'Para oferecer caronas e preciso ter 18 anos ou mais, CNH valida de categoria B ou superior e informar o veiculo usado (placa, modelo, cor e ano). O motorista e responsavel por respeitar a lotacao do carro e as leis de transito.'],
  ['4. Dados que coletamos',
    'Nome, e-mail institucional, CPF, telefone e senha (guardada de forma criptografada). De motoristas tambem: data de nascimento, numero, categoria e validade da CNH e dados do veiculo. Localizacao apenas quando voce usa o mapa.'],
  ['5. Para que usamos (LGPD, art. 6 e 7)',
    'CPF e CNH: identificar os usuarios, impedir contas duplicadas e dar seguranca as caronas. Placa e modelo: o passageiro confere o carro antes de embarcar. Nao vendemos nem compartilhamos seus dados com terceiros para publicidade.'],
  ['6. Protecao dos dados',
    'Documentos aparecem mascarados no app (ex: ***.456.789-**). Senhas sao armazenadas com hash. Apenas o necessario e exibido aos outros usuarios: nome, avaliacao e dados do veiculo.'],
  ['7. Seus direitos (LGPD, art. 18)',
    'Voce pode consultar seus dados no Perfil, corrigi-los e excluir sua conta a qualquer momento (Perfil > Excluir minha conta). A exclusao apaga seus dados pessoais do sistema.'],
  ['8. Consentimento',
    'Ao marcar o aceite, voce declara ter lido estes termos e concorda com o tratamento dos seus dados para as finalidades acima.'],
];

export default function TermosModal({ visivel, onFechar }) {
  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={onFechar}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ padding: espacamento.grande }}>
          <Text style={styles.titulo}>Termos de Uso e Politica de Privacidade</Text>
          <Text style={styles.versao}>Versao {VERSAO_TERMOS}</Text>
          {SECOES.map(([t, txt]) => (
            <View key={t} style={styles.secao}>
              <Text style={styles.secaoTitulo}>{t}</Text>
              <Text style={styles.texto}>{txt}</Text>
            </View>
          ))}
          <Botao titulo="Fechar" onPress={onFechar} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  titulo: { fontSize: 22, fontWeight: '800', color: cores.primariaEscura },
  versao: { fontSize: 12, color: cores.textoSecundario, marginBottom: espacamento.medio },
  secao: { marginBottom: espacamento.medio },
  secaoTitulo: { fontSize: 15, fontWeight: '700', color: cores.texto, marginBottom: 4 },
  texto: { fontSize: 14, color: cores.textoSecundario, lineHeight: 20 },
});
