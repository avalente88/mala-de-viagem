const express = require("express");
const Amadeus = require("amadeus");
const { API_KEY, API_SECRET } = require("./config");

const router = express.Router();

// Initialize Amadeus with ENV vars
const amadeus = new Amadeus({
  clientId: API_KEY,
  clientSecret: API_SECRET
});

// GET /api/flights
router.get("/api/flights", async (req, res) => {
  const { origin, destination, departureDate, adults = 1, max = 10 } = req.query;

  if (!origin || !destination || !departureDate) {
    return res.status(400).json({ error: "origin, destination and departureDate are required" });
  }

  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults,
      max
    });

    res.json({ data: response.result.data });
  } catch (err) {
    console.error("Amadeus error:", err?.response?.data || err);
    res.status(500).json({ error: "Flight search failed" });
  }
});

module.exports = router;
