// routes.js
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const axios = require("axios");
const db = admin.firestore(); // Assuming Firebase Admin has been initialized in app.js or a separate config file

// Route to get trip data
// router.get("/trip/:tripId", authenticate, async (req, res) => {
//   const tripId = req.params.tripId;
//   try {
//     const trip = await db.collection("trips").doc(tripId).get();
//     if (!trip.exists) {
//       return res.status(404).send("Trip not found");
//     }
//     return res.status(200).json(trip.data());
//   } catch (error) {
//     console.error("Error getting trip data", error);
//     res.status(500).send(error.message);
//   }
// });

// Google maps Nearby Search API endpoint

// Export the router
module.exports = router;
