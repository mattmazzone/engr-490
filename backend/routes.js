// routes.js
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const axios = require("axios");
const db = admin.firestore(); // Assuming Firebase Admin has been initialized in app.js or a separate config file

// Middleware to authenticate the Firebase token
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization;
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send("You are not authorized");
  }
};

// Route to get user profile data
router.get("/profile/:uid", authenticate, async (req, res) => {
  const uid = req.params.uid;
  try {
    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) {
      return res.status(404).send("User not found");
    }
    const userData = doc.data();
    return res.status(200).json(userData);
  } catch (error) {
    console.error("Error getting user data", error);
    res.status(500).send(error.message);
  }
});

// Route to update user interest array
router.put("/interests/:uid", authenticate, async (req, res) => {
  const uid = req.params.uid;
  const interests = req.body.interests;
  try {
    await db.collection("users").doc(uid).update({ interests });
    return res.status(200).send("Interests updated successfully");
  } catch (error) {
    console.error("Error updating interests", error);
    res.status(500).send(error.message);
  }
});

// Route to create a new trip
router.post("/create_trip/:uid", authenticate, async (req, res) => {
  const uid = req.params.uid;
  const tripData = req.body;

  console.log(tripData);
  try {
    const tripRef = await db.collection("trips").add(tripData);
    const tripId = tripRef.id;

    // Add trip to user currentTrip field
    await db.collection("users").doc(uid).update({ currentTrip: tripId });

    const trip = await tripRef.get();
    return res.status(200).json(trip.data());
  } catch (error) {
    console.error("Error creating trip", error);
    res.status(500).send(error.message);
  }
});

// Route to to check if user has an active trip and return trip data
router.get("/current_trip/:uid", authenticate, async (req, res) => {
  const uid = req.params.uid;
  try {
    const user = await db.collection("users").doc(uid).get();
    const userData = user.data();
    if (userData.currentTrip === "") {
      return res.status(200).json({ hasActiveTrip: false });
    }
    const trip = await db.collection("trips").doc(userData.currentTrip).get();
    return res.status(200).json({ trip: trip.data() });
  } catch (error) {
    console.error("Error getting active trip", error);
    res.status(500).send(error.message);
  }
});

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
router.get("/places/nearby", authenticate, async (req, res) => {
  let { includedTypes, maxResultCount, latitude, longitude, radius } =
    req.query;

  // Parse the includedTypes query parameter to be an array of strings
  try {
    includedTypes = JSON.parse(includedTypes);
  } catch (error) {
    if (typeof includedTypes === "string") {
      includedTypes = includedTypes.split(",");
    } else {
      includedTypes = [];
    }
  }

  maxResultCount = parseInt(maxResultCount);
  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);
  radius = parseInt(radius);

  const payload = {
    includedTypes,
    maxResultCount,
    locationRestriction: {
      circle: {
        center: {
          latitude,
          longitude,
        },
        radius,
      },
    },
  };
  try {
    const response = await axios.post(
      "https://places.googleapis.com/v1/places:searchNearby",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask": "places.displayName",
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error getting nearby places", error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(error.response.data);
      console.error(error.response.status);
      console.error(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error", error.message);
    }
    res.status(500).send(error.message);
  }
});

// Export the router
module.exports = router;
