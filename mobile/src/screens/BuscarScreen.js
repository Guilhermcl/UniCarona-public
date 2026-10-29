import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import InputAutocomplete from '../components/InputAutocomplete';
import Botao from '../components/Botao';
import CardCarona from '../components/CardCarona';
import { cores, espacamento } from '../theme';

export default function BuscarScreen({ navigation }) {
  const [destino, setDestino] = useState({ texto: '', lat: null, lng: null });
  const [caronas, setCaronas] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const buscar = useCallback(async () => {
    setCarregando(true);
    try {
      const resposta = await api.get('/caronas', {
        params: destino.texto ? { destino: destino.texto } : {},
      });
      setCaronas(resposta.data);
    } catch (err) {
      console.log('Erro ao buscar caronas:', err.message);
    } finally {
      setCarregando(false);
    }
  }, [destino.texto]);

  useFocusEffect(
    useCallback(() => {
      buscar();
    }, [buscar])
  );

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.tituloTopo}>UniCarona</Text>
        <Text style={styles.subtitulo}>Encontre sua carona universitaria</Text>
        <InputAutocomplete
          valor={destino.texto}
          placeholder="Para onde voce vai?"
          onSelecionar={setDestino}
        />
        <Botao titulo="Buscar caronas" onPress={buscar} carregando={carregando} />
      </View>

      {carregando && caronas.length === 0 ? (
        <ActivityIndicator size="large" color={cores.primaria} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={caronas}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <CardCarona
              carona={item}
              onPress={() => navigation.navigate('DetalheCarona', { id: item.id })}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={carregando} onRefresh={buscar} colors={[cores.primaria]} />
          }
          ListEmptyComponent={
            <View style={styles.vazioContainer}>
              <Text style={styles.vazioTitulo}>Nenhuma carona encontrada</Text>
              <Text style={styles.vazioTexto}>Tente outro destino ou volte mais tarde.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: {
    padding: espacamento.medio,
    paddingTop: espacamento.grande,
    backgroundColor: cores.primaria,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 10, // garante que as sugestoes apareçam por cima da lista
  },
  tituloTopo: {
    fontSize: 28, fontWeight: '800', color: cores.branco,
    letterSpacing: 0.5,
  },
  subtitulo: {
    fontSize: 14, color: cores.primariaClara,
    marginBottom: espacamento.medio, marginTop: 4,
  },
  lista: { padding: espacamento.medio },
  vazioContainer: { marginTop: 60, alignItems: 'center', padding: espacamento.grande },
  vazioTitulo: {
    fontSize: 16, fontWeight: '700', color: cores.texto,
    marginBottom: 6,
  },
  vazioTexto: {
    fontSize: 14, color: cores.textoSecundario, textAlign: 'center',
  },
});
