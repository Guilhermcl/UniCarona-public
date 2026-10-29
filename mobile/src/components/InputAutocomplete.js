import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { cores, raio, espacamento } from '../theme';

/**
 * Input com autocomplete de endereços via Nominatim (OpenStreetMap).
 *
 * Props:
 *  - rotulo: texto do label
 *  - valor: string atual do campo
 *  - onSelecionar: callback({ texto, lat, lng }) quando o usuário escolhe uma sugestão
 *  - placeholder
 *
 * Comportamento: aguarda 500ms após o usuário parar de digitar antes de buscar
 * sugestões (debounce), pra evitar muitas requisições.
 */
export default function InputAutocomplete({
  rotulo,
  valor,
  onSelecionar,
  placeholder,
}) {
  const [texto, setTexto] = useState(valor || '');
  const [sugestoes, setSugestoes] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const timerRef = useRef(null);
  const ignorarProximaBuscaRef = useRef(false);

  // Atualiza o texto interno se a prop "valor" mudar de fora
  useEffect(() => {
    setTexto(valor || '');
  }, [valor]);

  // Debounce: espera 500ms antes de buscar sugestões
  useEffect(() => {
    // Quando o usuário acabou de selecionar uma sugestão, não busca de novo.
    if (ignorarProximaBuscaRef.current) {
      ignorarProximaBuscaRef.current = false;
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    if (!texto || texto.trim().length < 3) {
      setSugestoes([]);
      return;
    }

    timerRef.current = setTimeout(() => {
      buscarSugestoes(texto);
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [texto]);

  async function buscarSugestoes(consulta) {
    setBuscando(true);
    try {
      // Nominatim com limite de 5 resultados, restrito ao Brasil
      const url =
        'https://nominatim.openstreetmap.org/search?q=' +
        encodeURIComponent(consulta + ', Brasil') +
        '&format=json&limit=5&countrycodes=br&addressdetails=1';

      const resposta = await fetch(url, {
        headers: { 'User-Agent': 'UniCarona-TCC/1.0' },
      });
      const dados = await resposta.json();
      setSugestoes(dados);
    } catch (err) {
      console.log('Erro no autocomplete:', err.message);
      setSugestoes([]);
    } finally {
      setBuscando(false);
    }
  }

  function escolherSugestao(item) {
    const enderecoFormatado = formatarEndereco(item);
    ignorarProximaBuscaRef.current = true; // evita buscar de novo após selecionar
    setTexto(enderecoFormatado);
    setSugestoes([]);
    setMostrarSugestoes(false);
    onSelecionar({
      texto: enderecoFormatado,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      nomeCompleto: item.display_name,
    });
  }

  return (
    <View style={styles.container}>
      {rotulo ? <Text style={styles.rotulo}>{rotulo}</Text> : null}
      <TextInput
        style={styles.input}
        value={texto}
        onChangeText={(t) => {
          setTexto(t);
          setMostrarSugestoes(true);
          // Quando o usuário edita, limpa as coordenadas até escolher uma sugestão
          onSelecionar({ texto: t, lat: null, lng: null });
        }}
        placeholder={placeholder}
        placeholderTextColor={cores.textoClaro}
        onFocus={() => setMostrarSugestoes(true)}
      />

      {buscando && (
        <ActivityIndicator
          size="small"
          color={cores.primaria}
          style={styles.loader}
        />
      )}

      {mostrarSugestoes && sugestoes.length > 0 && (
        <View style={styles.sugestoesContainer}>
          {sugestoes.map((item) => (
              <TouchableOpacity
                key={String(item.place_id)}
                style={styles.sugestaoItem}
                onPress={() => escolherSugestao(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.sugestaoTitulo} numberOfLines={1}>
                  📍 {formatarEndereco(item)}
                </Text>
                <Text style={styles.sugestaoSubtitulo} numberOfLines={1}>
                  {item.display_name}
                </Text>
              </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// Pega o nome mais "amigável" do endereço (bairro, cidade ou nome do lugar)
function formatarEndereco(item) {
  const addr = item.address || {};
  const partes = [];
  // Prioriza nomes específicos (universidade, ponto turístico, etc)
  if (addr.amenity) partes.push(addr.amenity);
  else if (addr.building) partes.push(addr.building);
  else if (addr.road) partes.push(addr.road + (addr.house_number ? ', ' + addr.house_number : ''));
  else if (addr.neighbourhood) partes.push(addr.neighbourhood);
  else if (addr.suburb) partes.push(addr.suburb);

  const cidade = addr.city || addr.town || addr.village || addr.municipality;
  if (cidade) partes.push(cidade);
  if (addr.state) partes.push(addr.state);

  return partes.length > 0 ? partes.join(', ') : item.display_name;
}

const styles = StyleSheet.create({
  container: {
    marginVertical: espacamento.pequeno,
    zIndex: 100, // garante que as sugestões fiquem por cima
  },
  rotulo: {
    fontSize: 13,
    color: cores.primariaEscura,
    marginBottom: 6,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: cores.branco,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raio.medio,
    paddingHorizontal: espacamento.medio,
    paddingVertical: 13,
    fontSize: 16,
    color: cores.texto,
  },
  loader: {
    position: 'absolute',
    right: 14,
    top: 38,
  },
  sugestoesContainer: {
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.bordaForte,
    borderRadius: raio.medio,
    marginTop: 4,
    overflow: 'hidden',
    shadowColor: cores.primariaEscura,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  sugestaoItem: {
    paddingVertical: 12,
    paddingHorizontal: espacamento.medio,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  sugestaoTitulo: {
    fontSize: 14,
    color: cores.texto,
    fontWeight: '600',
  },
  sugestaoSubtitulo: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginTop: 2,
  },
});
