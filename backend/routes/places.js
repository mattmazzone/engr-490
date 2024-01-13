const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const axios = require("axios");
const { getNearbyPlaces, REQUEST } = require("../utils/services");

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
  
  let [successOrNot, responseData] = await getNearbyPlaces(
    req.query,
    payload,
    "places.displayName"
  );
  if (successOrNot == REQUEST.SUCCESSFUL) {
    return res.status(200).json(responseData);
  } else {
    const error = responseData;
    res.status(500).send(error.message);
  }
});

module.exports = router;
