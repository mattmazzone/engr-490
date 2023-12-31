const axios = require("axios");

const REQUEST = {
  SUCCESSFUL: 0,
  ERROR: 1,
};

async function getNearbyPlaces(payload, fieldMask) {
  try {
    const response = await axios.post(
      "https://places.googleapis.com/v1/places:searchNearby",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask": fieldMask,
        },
      }
    );

    return [REQUEST.SUCCESSFUL, response.data];
  } catch (error) {
    // console.error("Error getting nearby places", error);
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
    return [REQUEST.ERROR, error];
  }
}

module.exports = { REQUEST, getNearbyPlaces };
