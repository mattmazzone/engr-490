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

async function getRecentTrips(admin, db, uid, numRecentTrips) {
  try {
    let recentTripIds = [];
    await db
      .collection("users")
      .doc(uid)
      .get()
      .then((doc) => {
        recentTripIds = (doc.data()?.pastTrips ?? []).slice(0, numRecentTrips);
      });

    if (recentTripIds.length < 2) {
      return [REQUEST.SUCCESSFUL, []];
    }

    let recentTrips = [];
    await db
      .collection("trips")
      .where(admin.firestore.FieldPath.documentId(), "in", recentTripIds)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((trip) => {
          recentTrips.push(trip);
        });
      });
    console.log("Retreived recent trip data");
    return [REQUEST.SUCCESSFUL, recentTrips];
  } catch (error) {
    console.log(error.message);
    return [REQUEST.ERROR, error];
  }
}

async function getPlaceDetails(id, fieldMask) {
  try {
    const response = await axios.get(
      `https://places.googleapis.com/v1/places/${id}`,
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
    console.error(error);
    return [REQUEST.ERROR, error];
  }
}

async function getPlaceTextSearch(address) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;
  try {
    const response = await axios.get(url);
    // Check if the API call was successful and if results were found
    if (response.data.status === "OK" && response.data.results.length > 0) {
      // Getting first result
      const geocodedData = response.data.results[0];
      return [REQUEST.SUCCESSFUL, geocodedData.geometry.location];
    } else {
      // Handle no results or other API errors
      return [
        REQUEST.ERROR,
        { message: "Geocoding failed: " + response.data.status },
      ];
    }
  } catch (error) {
    console.error(error);
    return [REQUEST.ERROR, error.response ? error.response.data : error];
  }
}

async function getUserInterests(uid, db) {
  try {
    let interests = [];
    await db
      .collection("users")
      .doc(uid)
      .get()
      .then((doc) => {
        interests = doc.data().interests;
      });
    return [REQUEST.SUCCESSFUL, interests];
  } catch (error) {
    console.error(error);
    return [REQUEST.ERROR, error];
  }
}
module.exports = {
  REQUEST,
  getNearbyPlaces,
  getRecentTrips,
  getPlaceDetails,
  getPlaceTextSearch,
  getUserInterests,
};
