const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const admin = require("firebase-admin");
const db = admin.firestore();
const { getNearbyPlaces, REQUEST } = require("../utils/getNearbyPlaces");

router.post("/recommend-activities", authenticate, async (req, res) => {
  let { maxResultCount, latitude, longitude, radius } = req.body;

  const payload = {
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

  let [successOrNot, responseData] = await getNearbyPlaces(
    payload,
    "places.id, places.displayName, places.types"
  );
  if (successOrNot == REQUEST.SUCCESSFUL) {
    const nearbyPlaces = responseData;
    console.log(nearbyPlaces);
  } else {
    const error = responseData;
    res.status(500).send(error.message);
  }
});

module.exports = router;
