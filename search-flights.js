const Amadeus = require("amadeus");

const amadeus = new Amadeus({
  clientId: "8k7L2HM3T5ApBkArcX24IYVkw2iv5LaA",
  clientSecret: "IFnNDbzM7232IRYF",
});



// ----------------------
// Funções auxiliares
// ----------------------

function parseDuration(isoDuration) {
  // Exemplo: "PT15H30M"
  const hours = isoDuration.match(/(\d+)H/)?.[1] ?? 0;
  const minutes = isoDuration.match(/(\d+)M/)?.[1] ?? 0;
  return Number(hours) + Number(minutes) / 60;
}

function getTotalDuration(itineraries) {
  return itineraries.reduce((sum, it) => sum + parseDuration(it.duration), 0);
}

function getTotalStops(itineraries) {
  return itineraries.reduce((sum, it) => sum + (it.segments.length - 1), 0);
}


function chooseBestFlight(flightOffers) {
  const enriched = flightOffers.map(offer => {
    const price = Number(offer.price.total);
    const duration = getTotalDuration(offer.itineraries);
    const stops = getTotalStops(offer.itineraries);

    return { offer, price, duration, stops };
  });

  // baseline: mais barato
  const cheapest = enriched.reduce((a, b) => (a.price < b.price ? a : b));

  const maxAllowedPrice = cheapest.price + 200;

  // voos elegíveis: até +200€ e com igual ou menos escalas
  const eligible = enriched.filter(f =>
    f.price <= maxAllowedPrice &&
    f.stops <= cheapest.stops
  );

  // se houver elegíveis, escolher o mais rápido
  if (eligible.length > 0) {
    eligible.sort((a, b) => a.duration - b.duration);
    return eligible[0].offer;
  }

  // fallback: o mais barato
  return cheapest.offer;
}



async function buscarVoos(origin, destination, departureDate) {
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: departureDate,
      adults: 1,
      max: 10
    });

    const voos = response.result.data;

    const melhorVoo = chooseBestFlight(voos);

    console.log("Melhor voo encontrado:");
    console.log(JSON.stringify(melhorVoo, null, 2));

  } catch (error) {
    console.error("Erro ao buscar voos:");
    console.error(error.response?.data || error.message);
  }
}

buscarVoos("LIS","SCL","2026-08-03");