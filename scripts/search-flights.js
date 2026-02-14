(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FlightSearch = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ----------------------
  // Helpers
  // ----------------------
  function parseDuration(isoDuration) {
    // e.g., "PT15H30M"
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
    // baseline: cheapest
    var cheapest = enriched.reduce(function (a, b) { return (a.price < b.price ? a : b); });
    var maxAllowedPrice = cheapest.price + 200; // simple business rule
    // eligible: <= +200€ and <= stops of cheapest
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
  // Front-end fetcher (no SDK here)
  // ----------------------
  async function buscarVoosFront(origin, destination, departureDate, options) {
    var opts = Object.assign({ adults: 1, max: 10 }, options);

    if (typeof window !== 'undefined' && window.FLIGHTS_API_URL) {
      var q = new URLSearchParams({
        origin: origin,
        destination: destination,
        departureDate: departureDate,
        adults: String(opts.adults || 1),
        max: String(opts.max || 10)
      });
      var url = window.FLIGHTS_API_URL + '?' + q.toString();
      var res = await fetch(url);
      if (!res.ok) throw new Error('API error: ' + res.status);
      var data = await res.json();
      var bestOption = chooseBestFlight(data.data);
      return bestOption || [];
    }

    // Fallback mock (dev only)
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

  // Public API
  return {
    parseDuration: parseDuration,
    getTotalDuration: getTotalDuration,
    getTotalStops: getTotalStops,
    chooseBestFlight: chooseBestFlight,
    buscarVoosFront: buscarVoosFront
  };
});

// Expose globals for the page
if (typeof window !== 'undefined' && window.FlightSearch) {
  window.buscarVoosFront = window.FlightSearch.buscarVoosFront;
  window.chooseBestFlight = window.FlightSearch.chooseBestFlight;
}

let airportMap = {};

async function loadAirports() {
  const response = await fetch("../../JSON/airports.json");
  const airports = await response.json();

  airportMap = airports.reduce((acc, a) => {
    acc[a.code] = a;
    return acc;
  }, {});
}

function getAirportLabel(code) {
  const key = code.toUpperCase();
  const airport = airportMap[key];

  if (!airport) return `${key} - Unknown`;

  return `${airport.code} - ${airport.city}`;
}

// Load data as soon as the page opens
loadAirports();

  function getStops(itinerary) {
  const segments = itinerary.segments;
  const stops = [];

  for (let i = 0; i < segments.length - 1; i++) {
    const current = segments[i];
    const next = segments[i + 1];

    const stopLocation = getAirportLabel(current.arrival.iataCode);

    const arrivalTime = new Date(current.arrival.at);
    const nextDepartureTime = new Date(next.departure.at);

    const diffMs = nextDepartureTime - arrivalTime;

    // Convert to hours and minutes
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    stops.push(`${stopLocation} - ${hours}h${minutes}m`);
  }
    return stops.join("\n");;
}

async function getAllOffers(isoDate, flights) {
  const baseDate = new Date(isoDate);

  const offers = [];

  for (const [from, to, offset] of flights) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + offset);

    const formattedDate = date.toISOString().split("T")[0];

    const offer = await window.buscarVoosFront(from, to, formattedDate);

    offers.push(offer);
  }

  return offers;
}
