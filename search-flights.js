/**
 * search-flights.js
 *
 * Mantém TODAS as funções auxiliares (parseDuration, getTotalDuration, getTotalStops, chooseBestFlight)
 * e oferece uma API segura para o front‑end: buscarVoosFront(origin, destination, departureDate).
 *
 * ➜ No browser, NUNCA guarda segredos. Se existir window.FLIGHTS_API_URL, chama o seu backend
 *    (ex.: /api/flights). Caso contrário, devolve dados mock para testes locais.
 * ➜ Em Node (para testes/scripts), pode exportar as helpers via module.exports.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FlightSearch = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ----------------------
  // Funções auxiliares
  // ----------------------
  function parseDuration(isoDuration) {
    // Ex.: "PT15H30M"
    if (!isoDuration || typeof isoDuration !== 'string') return 0;
    var h = (isoDuration.match(/(\d+)H/) || [0, 0])[1];
    var m = (isoDuration.match(/(\d+)M/) || [0, 0])[1];
    return Number(h) + Number(m) / 60;
  }

  function getTotalDuration(itineraries) {
    if (!Array.isArray(itineraries)) return 0;
    return itineraries.reduce(function (sum, it) { return sum + parseDuration(it && it.duration); }, 0);
  }

  function getTotalStops(itineraries) {
    if (!Array.isArray(itineraries)) return 0;
    return itineraries.reduce(function (sum, it) {
      var segs = (it && it.segments) || [];
      return sum + Math.max(0, segs.length - 1);
    }, 0);
  }

  function chooseBestFlight(flightOffers) {
    if (!Array.isArray(flightOffers) || flightOffers.length === 0) return null;
    var enriched = flightOffers.map(function (offer) {
      var price = Number(offer && offer.price && offer.price.total || 0);
      var duration = getTotalDuration(offer && offer.itineraries);
      var stops = getTotalStops(offer && offer.itineraries);
      return { offer: offer, price: price, duration: duration, stops: stops };
    });
    // baseline: mais barato
    var cheapest = enriched.reduce(function (a, b) { return (a.price < b.price ? a : b); });
    var maxAllowedPrice = cheapest.price + 200; // regra de negócio simples
    // elegíveis: até +200€ e com igual/menos escalas que o mais barato
    var eligible = enriched.filter(function (f) {
      return f.price <= maxAllowedPrice && f.stops <= cheapest.stops;
    });
    if (eligible.length > 0) {
      eligible.sort(function (a, b) { return a.duration - b.duration; });
      return eligible[0].offer;
    }
    return cheapest.offer;
  }

  // ----------------------
  // Front-end: busca segura
  // ----------------------
  async function buscarVoosFront(origin, destination, departureDate, options) {
    var opts = Object.assign({ adults: 1, max: 10 }, options);
    // Se existir API de backend, chamar
    if (typeof window !== 'undefined') {
      var q = new URLSearchParams({
        origin: origin,
        destination: destination,
        departureDate: departureDate,
        adults: String(opts.adults || 1),
        max: String(opts.max || 10)
      });
      

    const response = await amadeus.shopping.flightOffersSearch.get({
          originLocationCode: origin,
          destinationLocationCode: destination,
          departureDate: departureDate,
          adults: 1,
          max: 10
        });

    const voos = response.result.data;

    const melhorVoo = chooseBestFlight(voos).json();




      return melhorVoo && (melhorVoo.data || melhorVoo.offers) || [];
    }

    // Fallback: mock para desenvolvimento sem backend
    var pad = function (x) { return String(x).padStart(2, '0'); };
    var mock = function () {
      var depH = 9 + Math.floor(Math.random() * 8);
      var durH = 10 + Math.floor(Math.random() * 6);
      var arrH = (depH + durH) % 24;
      return {
        price: { total: (600 + Math.floor(Math.random() * 400)).toString() },
        itineraries: [{
          duration: 'PT' + durH + 'H' + pad(Math.floor(Math.random() * 60)) + 'M',
          segments: [
            { carrierCode: 'LA', number: String(800 + Math.floor(Math.random() * 100)), departure: { at: departureDate + 'T' + pad(depH) + ':30:00' } },
            ...(Math.random() < 0.4 ? [{ carrierCode: 'LA', number: String(700 + Math.floor(Math.random() * 100)), arrival: { at: departureDate + 'T' + pad((depH + Math.floor(durH / 2)) % 24) + ':10:00' } }] : []),
            { arrival: { at: departureDate + 'T' + pad(arrH) + ':50:00' } }
          ]
        }]
      };
    };
    return Array.from({ length: Math.min(5, opts.max || 5) }, mock);
  }

  // ----------------------
  // Node helper (opcional): buscar e escolher melhor voo
  // ----------------------
  async function escolherMelhorFront(origin, destination, departureDate, options) {
    var offers = await buscarVoosFront(origin, destination, departureDate, options);
    return chooseBestFlight(offers);
  }

  // API pública
  return {
    // helpers
    parseDuration: parseDuration,
    getTotalDuration: getTotalDuration,
    getTotalStops: getTotalStops,
    chooseBestFlight: chooseBestFlight,
    // front-end
    buscarVoosFront: buscarVoosFront,
    escolherMelhorFront: escolherMelhorFront
  };
});

// No browser, expõe funções em window para uso direto com o HTML existente
if (typeof window !== 'undefined' && window.FlightSearch) {
  window.buscarVoosFront = window.FlightSearch.buscarVoosFront;
  window.chooseBestFlight = window.FlightSearch.chooseBestFlight;
}
