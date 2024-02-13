const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const authenticate = require("../middlewares/authenticate");
const { calculateFreeTimeSlots } = require("../utils/timeSlotCalculator");
const {
  getNearbyPlaces,
  getRecentTrips,
  REQUEST,
  getPlaceDetails,
  getPlaceTextSearch,
} = require("../utils/services");
const axios = require("axios");

const recommenderPort = 4000;
const recommenderRoute = "/api/recommend";
const recommenderURL = `http://localhost:${recommenderPort}${recommenderRoute}`;

async function useGetNearbyPlacesSevice(
  latitude,
  longitude,
  maxNearbyPlaces,
  nearByPlaceRadius
) {
  const payload = {
    maxResultCount: maxNearbyPlaces,
    locationRestriction: {
      circle: {
        center: {
          latitude,
          longitude,
        },
        radius: nearByPlaceRadius,
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
    throw new BadRequestException(error);
  }

  return responseData;
}

async function getCoords(meeting) {
  console.log("Getting coords for meeting location", meeting);
  const [successOrNot, responseData] = await getPlaceTextSearch(
    meeting.location
  );
  if (successOrNot != REQUEST.SUCCESSFUL) {
    error = responseData;
    throw new BadRequestException(error);
  }

  // should only be 1 result
  return responseData;
}

// Route to create a new trip
router.post("/create_trip/:uid", authenticate, async (req, res) => {
  try {
    const uid = req.params.uid;
    const {
      tripStart,
      tripEnd,
      tripMeetings,
      maxRecentTrips,
      maxNearbyPlaces,
      nearByPlaceRadius,
    } = req.body; // Destructure expected properties

    // Validate trip data
    if (!tripStart || !tripEnd || !tripMeetings) {
      return res.status(400).send("Missing required trip data");
    }

    // Assume daily start and end times and buffer are either constants or retrieved from user settings
    const dailyStartTime = "08:00:00";
    const dailyEndTime = "23:00:00";
    const bufferInMinutes = 30;

    const freeSlots = calculateFreeTimeSlots(
      tripStart,
      tripEnd,
      tripMeetings,
      dailyStartTime,
      dailyEndTime,
      bufferInMinutes
    );

    /*
    =--=-=-=-=-=-=-=-=
    Start recommending activities
    =-=-=-=-=-=-=-=-=-=
    */

    // 2d array of places for each meeting location except the 1st one
    let nearbyPlaces = [];

    const numMeetings = tripMeetings.length;

      for (let i = 0; i < numMeetings; i++) {
        let meeting = tripMeetings[i];
        if (!meeting.location || meeting.location === "") {
          console.log("No location for meeting: ", meeting);
          continue;
        }
        const location = await getCoords(meeting);
        const responseData = await useGetNearbyPlacesSevice(
          location.latitude,
          location.longitude,
          maxNearbyPlaces,
          nearByPlaceRadius
        );

        nearbyPlaces.push(responseData.places);
      }

    // Get user's recent trips from firestore
    let [successOrNotTrips, responseDataTrips] = await getRecentTrips(
      admin,
      db,
      uid,
      maxRecentTrips
    );

    if (successOrNotTrips != REQUEST.SUCCESSFUL) {
      if (responseDataTrips == "NEED COLD START") {
        return res.status(301).json({ message: "Need Cold Start" });
        //TODO: change to call cold Start
      }
      else {
      error = responseDataTrips;
      console.error("Error getting recent trips");
      res.status(400).json(error);
      return;
      }
    }
    const recentTrips = responseDataTrips;

    // Extract google place IDs and types from recent trips
    // using the places details API
    let recentTripsPlaceDetails = [];
    for (const trip of recentTrips) {
      const recentTripMeetings = trip.data().tripMeetings;

      for (const place of recentTripMeetings) {
        const [successOrNotPlaceDetails, responsePlaceDetails] =
          await getPlaceDetails(place.placeId, "id,types");
        if (successOrNotPlaceDetails != REQUEST.SUCCESSFUL) {
          error = responsePlaceDetails;
          console.error("Error getting place details");
          res.status(400).json(error);
          return;
        }

        const placeDetails = responsePlaceDetails;
        placeDetails.rating = place.rating;
        recentTripsPlaceDetails.push(placeDetails);

        if (recentTripsPlaceDetails.length >= maxRecentTrips) break;
      }

      if (recentTripsPlaceDetails.length >= maxRecentTrips) break;
    }

    // Finally pass data into the recommender system and get the activities
    const token = req.headers.authorization;
    const response = await axios.post(
      recommenderURL,
      { nearbyPlaces, recentTripsPlaceDetails, freeSlots, tripMeetings },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    const { scheduledActivities } = response.data;
    // Construct trip data for database
    const tripData = {
      tripStart,
      tripEnd,
      tripMeetings,
      scheduledActivities,
    };
    console.log(JSON.stringify(tripData, null, 4));

    const tripRef = await db.collection("trips").add(tripData);
    const tripId = tripRef.id;

    // Add trip to user currentTrip field
    await db.collection("users").doc(uid).update({ currentTrip: tripId });

    return res.status(200).json({ trip: tripData });
  } catch (error) {
    console.error("Error creating trip\n", error);
    res.status(500).send(error.message);
  }
});

// Route to to check if user has an active trip and return trip data
router.get("/current_trip/:uid", authenticate, async (req, res) => {
  const uid = req.params.uid;
  try {
    const user = await db.collection("users").doc(uid).get();
    const userData = user.data();
    if (!userData.currentTrip || userData.currentTrip === "") {
      return res.status(200).json({ hasActiveTrip: false });
    }
    const trip = await db.collection("trips").doc(userData.currentTrip).get();

    return res.status(200).json(trip.data());
  } catch (error) {
    console.error("Error getting active trip\n", error);
    res.status(500).send(error.message);
  }
});

// Route to end current trip and add trip to user's past trips
router.post("/end_trip/:uid", authenticate, async (req, res) => {
  try {
    const uid = req.params.uid;
    const user = await db.collection("users").doc(uid).get();
    const userData = user.data();
    const tripId = userData.currentTrip;
    console.log(tripId);

    // Add trip to user's past trips
    await db
      .collection("users")
      .doc(uid)
      .update({
        pastTrips: admin.firestore.FieldValue.arrayUnion(tripId),
        currentTrip: "",
      });

    return res.status(200).json({ message: "Trip ended successfully" });
  } catch (error) {
    console.error("Error ending trip", error);
    res.status(500).send(error.message);
  }
});

// Route to get all past trips for a user
router.get("/past_trips/:uid", authenticate, async (req, res) => {
  try {
    const uid = req.params.uid;
    const user = await db.collection("users").doc(uid).get();
    const userData = user.data();
    let pastTrips = userData.pastTrips;
    if (!pastTrips || pastTrips.length === 0) {
      pastTrips = [];
    }
    return res.status(200).json(pastTrips);
  } catch (error) {
    console.error("Error getting past trips", error);
    res.status(500).send(error.message);
  }
});

// Route to get a specific past trip for a user
router.get("/past_trips/:uid/:tripId", authenticate, async (req, res) => {
  try {
    const uid = req.params.uid;
    const tripId = req.params.tripId;

    // TODO validate tripId belongs to user
    const trip = await db.collection("trips").doc(tripId).get();

    return res.status(200).json(trip.data());
  } catch (error) {
    console.error("Error getting past trip", error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
