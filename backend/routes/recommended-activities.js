const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const admin = require("firebase-admin");
const db = admin.firestore();
const {
  getNearbyPlaces,
  getRecentTrips,
  REQUEST,
  getPlaceDetails,
} = require("../utils/services");
const axios = require("axios");

const recommenderPort = 4000;
const recommenderRoute = "/api/recommend";
const recommenderURL = `http://localhost:${recommenderPort}${recommenderRoute}`;

router.post("/recommend-activities/:uid", authenticate, async (req, res) => {
  const { maxResultCount, numRecentTrips, latitude, longitude, radius } =
    req.body;
  console.log(req.body);
  const uid = req.params.uid;

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

  let error;
  // Get nearby place ids and types
  let [successOrNot, responseData] = await getNearbyPlaces(
    payload,
    "places.id,places.types,places.displayName,places.formattedAddress,places.priceLevel,places.rating,places.regularOpeningHours"
  );

  if (successOrNot != REQUEST.SUCCESSFUL) {
    error = responseData;
    console.error("Error getting nearby places");
    res.status(400).json(error);
    return;
  }
  const nearbyPlaces = responseData;

  // Get user's recent trips from firestore
  let [successOrNotTrips, responseDataTrips] = await getRecentTrips(
    admin,
    db,
    uid,
    numRecentTrips
  );

  if (successOrNotTrips != REQUEST.SUCCESSFUL) {
    error = responseDataTrips;
    console.error("Error getting recent trips");
    res.status(400).json(error);
    return;
  }
  const recentTrips = responseDataTrips;

  // Extract google place IDs and types from recent trips
  // using the places details API
  let recentTripsPlaceDetails = [];
  for (const trip of recentTrips) {
    const tripMeetings = trip.data().tripMeetings;

    for (const place of tripMeetings) {
      const [successOrNotPlaceDetails, responsePlaceDetails] =
        await getPlaceDetails(place.placeId, "id,types");
      if (successOrNotPlaceDetails != REQUEST.SUCCESSFUL) {
        error = responsePlaceDetails;
        console.error("Error getting place details");
        res.status(400).json(error);
        return;
      }

      const placeDetails = responsePlaceDetails;
      recentTripsPlaceDetails.push(placeDetails);

      if (recentTripsPlaceDetails.length >= numRecentTrips) break;
    }

    if (recentTripsPlaceDetails.length >= numRecentTrips) break;
  }

  // Finally pass data into the recommender system and get the activities
  const token = req.headers.authorization;
  try {
    const response = await axios.post(
      recommenderURL,
      { nearbyPlaces, recentTripsPlaceDetails },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    const similarityScores = response.data.similarity;
    let activities = [];
    for (let i = 0; i < nearbyPlaces.places.length; i++) {
      const place = nearbyPlaces.places[i];
      let activity = place;
      activity.similarity = similarityScores[place.id];
      activities.push(activity);
      console.log(activity);
    }
    res.status(200).json({ activities });
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});

module.exports = router;
