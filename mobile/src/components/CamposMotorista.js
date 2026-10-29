import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Input from './Input';
import SeletorOpcoes from './SeletorOpcoes';
import { mascaraData, mascaraPlaca, digitos, converterData, validarPlaca } from '../utils/formatos';
import { cores, espacamento, raio } from '../theme';

const CATEGORIAS = ['B', 'AB', 'C', 'AC', 'D', 'AD', 'E', 'AE'].map((c) => ({ valor: c, rotulo: c }));

export const motoristaVazio = {
  dataNascimento: '', cnhNumero: '', cnhCategoria: 'B', cnhValidade: '',
  placa: '', modelo: '', cor: '', ano: '', capacidade: 5,
};

// Valida no app antes de enviar. Devolve mensagem de erro ou null.
export function conferirMotorista(m, { exigirVeiculo = true } = {}) {
  if (!converterData(m.dataNascimento)) return 'Data de nascimento invalida (DD/MM/AAAA).';
  if (digitos(m.cnhNumero).length !== 11) return 'O numero da CNH tem 11 digitos.';
  if (!converterData(m.cnhValidade)) return 'Validade da CNH invalida (DD/MM/AAAA).';
  if (exigirVeiculo) return conferirVeiculo(m);
  return null;
}

export function conferirVeiculo(m) {
  if (!validarPlaca(m.placa)) return 'Placa invalida. Ex: ABC1D23 ou ABC1234.';
  if (!m.modelo.trim()) return 'Informe o modelo do carro.';
  if (!m.cor.trim()) return 'Informe a cor do carro.';
  if (!/^\d{4}$/.test(String(m.ano))) return 'Informe o ano do carro (4 digitos).';
  return null;
}

// Converte os campos do formulario para o formato da API.
export function dadosMotoristaParaApi(m) {
  return {
    dataNascimento: converterData(m.dataNascimento),
    cnhNumero: digitos(m.cnhNumero),
    cnhCategoria: m.cnhCategoria,
    cnhValidade: converterData(m.cnhValidade),
  };
}

export function veiculoParaApi(m) {
  return {
    placa: mascaraPlaca(m.placa),
    modelo: m.modelo.trim(),
    cor: m.cor.trim(),
    ano: Number(m.ano),
    capacidade: Number(m.capacidade),
  };
}

export function CamposCNH({ valores, onChange }) {
  return (
    <View style={styles.bloco}>
      <Text style={styles.titulo}>Habilitacao (CNH)</Text>
      <Text style={styles.ajuda}>
        Exigida pelo Codigo de Transito para dirigir. So maiores de 18 anos com CNH valida
        oferecem caronas.
      </Text>
      <Input
        rotulo="Data de nascimento"
        value={valores.dataNascimento}
        onChangeText={(t) => onChange('dataNascimento', mascaraData(t))}
        placeholder="DD/MM/AAAA"
        keyboardType="number-pad"
      />
      <Input
        rotulo="Numero de registro da CNH"
        value={valores.cnhNumero}
        onChangeText={(t) => onChange('cnhNumero', digitos(t).slice(0, 11))}
        placeholder="11 digitos"
        keyboardType="number-pad"
      />
      <SeletorOpcoes
        rotulo="Categoria"
        opcoes={CATEGORIAS}
        valor={valores.cnhCategoria}
        onChange={(v) => onChange('cnhCategoria', v)}
      />
      <Input
        rotulo="Validade da CNH"
        value={valores.cnhValidade}
        onChangeText={(t) => onChange('cnhValidade', mascaraData(t))}
        placeholder="DD/MM/AAAA"
        keyboardType="number-pad"
      />
    </View>
  );
}

export function CamposVeiculo({ valores, onChange }) {
  return (
    <View style={styles.bloco}>
      <Text style={styles.titulo}>Veiculo</Text>
      <Text style={styles.ajuda}>
        A placa, o modelo e a cor aparecem para o passageiro conferir antes de entrar no carro.
      </Text>
      <Input
        rotulo="Placa"
        value={valores.placa}
        onChangeText={(t) => onChange('placa', mascaraPlaca(t))}
        placeholder="ABC1D23"
        autoCapitalize="characters"
      />
      <Input
        rotulo="Modelo"
        value={valores.modelo}
        onChangeText={(t) => onChange('modelo', t)}
        placeholder="Ex: Chevrolet Onix"
      />
      <View style={styles.duasColunas}>
        <View style={{ flex: 1 }}>
          <Input
            rotulo="Cor"
            value={valores.cor}
            onChangeText={(t) => onChange('cor', t)}
            placeholder="Prata"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            rotulo="Ano"
            value={String(valores.ano)}
            onChangeText={(t) => onChange('ano', digitos(t).slice(0, 4))}
            placeholder="2020"
            keyboardType="number-pad"
          />
        </View>
      </View>
      <SeletorOpcoes
        rotulo="Lugares no carro (com o motorista)"
        opcoes={[2, 4, 5, 7].map((n) => ({ valor: n, rotulo: String(n) }))}
        valor={Number(valores.capacidade)}
        onChange={(v) => onChange('capacidade', v)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bloco: {
    backgroundColor: cores.branco, borderRadius: raio.grande, padding: espacamento.medio,
    marginVertical: espacamento.pequeno, borderWidth: 1, borderColor: cores.borda,
  },
  titulo: { fontSize: 16, fontWeight: '800', color: cores.primariaEscura },
  ajuda: { fontSize: 12, color: cores.textoSecundario, marginTop: 4, marginBottom: 4, lineHeight: 17 },
  duasColunas: { flexDirection: 'row', gap: 12 },
});
