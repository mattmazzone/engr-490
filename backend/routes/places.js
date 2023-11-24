const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const axios = require("axios");

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

module.exports = router;
