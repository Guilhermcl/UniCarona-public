/**
 * Converte um endereço em coordenadas (lat/lng) usando Nominatim (OpenStreetMap).
 * Gratuito, sem chave de API. Limite ~1 req/seg.
 *
 * Uso: const coords = await geocode('Centro Campinas');
 * Retorna: { lat, lng } ou null se não encontrou.
 */
export async function geocode(endereco) {
  if (!endereco || endereco.trim().length < 3) return null;

  try {
    // Adiciona ", Brasil" para melhorar precisão em endereços brasileiros
    const consulta = encodeURIComponent(endereco + ', Brasil');
    const url = `https://nominatim.openstreetmap.org/search?q=${consulta}&format=json&limit=1&countrycodes=br`;

    const resposta = await fetch(url, {
      headers: {
        // Boa prática do Nominatim: identificar a aplicação
        'User-Agent': 'UniCarona-TCC/1.0',
      },
    });

    const dados = await resposta.json();

    if (dados.length === 0) return null;

    return {
      lat: parseFloat(dados[0].lat),
      lng: parseFloat(dados[0].lon),
      nomeCompleto: dados[0].display_name,
    };
  } catch (err) {
    console.log('Erro no geocode:', err.message);
    return null;
  }
}
