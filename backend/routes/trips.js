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
  getUserInterests,
  getCoords,
  getTimezone,
  adjustMeetingTimes,
} = require("../utils/services");
const {
  processDaysAndGetRestaurants,
  getRestaurantsWithNoMeetings,
} = require("../utils/here");
const axios = require("axios");

const recommenderPort = 4000;
const recommenderRoute = "/api/recommend";
const recommenderURL = `http://localhost:${recommenderPort}${recommenderRoute}`;

async function useGetNearbyPlacesSevice(
  latitude,
  longitude,
  maxNearbyPlaces,
  nearByPlaceRadius,
  includedTypes
) {
  const payload = {
    includedTypes,
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

// Route to create a new trip
router.post("/create_trip/:uid", authenticate, async (req, res) => {
  try {
    const uid = req.params.uid;
    const {
      tripStart,
      tripEnd,
      tripMeetings,
      tripLocation,
      currentLocation,
      maxRecentTrips,
      maxNearbyPlaces,
      nearByPlaceRadius,
    } = req.body; // Destructure expected properties
    console.log(tripStart, tripEnd);

    // Validate trip data
    if (!tripStart || !tripEnd) {
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

    const [success, interests] = await getUserInterests(uid, db);
    if (success != REQUEST.SUCCESSFUL) {
      error = interests;
      throw interests;
    }

    // Filter out restaurant interests
    const { restaurantInterests, nonRestaurantInterests } = interests.reduce(
      (acc, interest) => {
        // Use a regular expression to test if the interest contains any number
        if (interest.match(/\d/)) {
          acc.restaurantInterests.push(interest); // Add to restaurant interests
        } else {
          acc.nonRestaurantInterests.push(interest); // Otherwise, add to non-restaurant interests
        }
        return acc;
      },
      { restaurantInterests: [], nonRestaurantInterests: [] }
    );

    console.log("Restaurant Interests", restaurantInterests);
    console.log("Non Restaurant Interests", nonRestaurantInterests);

    /*
    =--=-=-=-=-=-=-=-=
    Start recommending activities
    =-=-=-=-=-=-=-=-=-=
    */

    // 2d array of places for each meeting location except the 1st one
    let nearbyPlaces = [];
    let nearbyRestaurants = [];

    const numMeetings = tripMeetings.length;

    const adsjustedMeetings = await adjustMeetingTimes(
      tripMeetings,
      currentLocation.timezone
    );

    //Checking if atleast 1 meeting has a location
    if (!tripLocation || tripLocation == "") {
      // Get nearby restaurants
      nearbyRestaurants = await processDaysAndGetRestaurants(
        tripStart,
        tripEnd,
        adsjustedMeetings
      );

      console.log("Nearby Restaurants", nearbyRestaurants);
      // Get all meeting locations
      let locations = [];
      for (let i = 0; i < numMeetings; i++) {
        let meeting = tripMeetings[i];
        if (meeting.location && meeting.location != "") {
          locations.push(meeting.location);
        }
      }

      let locationIndex = 0;
      for (let i = 0; i < numMeetings; i++) {
        let meeting = tripMeetings[i];

        // Skip meetings without start and end times (all day events)
        if (!meeting.start || !meeting.end) {
          continue;
        }

        if (!meeting.location || meeting.location === "") {
          meeting.location = locations[locationIndex];
          if (locationIndex < locations.length - 1) locationIndex++;
        }

        const location = await getCoords(meeting.location);
        const timeZone = await getTimezone(
          location.lat,
          location.lng,
          meeting.start
        );
        console.log("Timezone", timeZone);
        const responseData = await useGetNearbyPlacesSevice(
          location.lat,
          location.lng,
          maxNearbyPlaces,
          nearByPlaceRadius,
          nonRestaurantInterests
        );

        nearbyPlaces.push({ places: responseData.places, timeZone: timeZone });
      }
    } else {
      //Need to use tripLocation
      const location = await getCoords(tripLocation);
      const responseData = await useGetNearbyPlacesSevice(
        location.lat,
        location.lng,
        maxNearbyPlaces,
        nearByPlaceRadius,
        nonRestaurantInterests
      );

      nearbyRestaurants = await getRestaurantsWithNoMeetings(
        tripStart,
        tripEnd,
        location
      );
      //No meeting has location
      if (numMeetings > 0) {
        for (let i = 0; i < numMeetings; i++) {
          let meeting = tripMeetings[i];
          const timeZone = await getTimezone(
            location.lat,
            location.lng,
            meeting.start
          );
          nearbyPlaces.push({
            places: responseData.places,
            timeZone: timeZone,
          });
        }
      }
      //No meetings at all
      else {
        console.log("Trip Start", tripStart);
        const timeZone = await getTimezone(
          location.lat,
          location.lng,
          tripStart
        );
        console.log("TimeZone", timeZone);
        nearbyPlaces.push({ places: responseData.places, timeZone: timeZone });
        nearbyRestaurants.push(restoData);
      }
    }

    // Get user's recent trips from firestore
    let [successOrNotTrips, responseDataTrips] = await getRecentTrips(
      admin,
      db,
      uid,
      maxRecentTrips
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
    let recentRestaurants = [];
    for (const trip of recentTrips) {
      const recentTripMeetings = trip.data().scheduledActivities;

      for (const place of recentTripMeetings) {
        const placeId = place.place_similarity.place_id;

        //Seperate the here places from the google places
        if (placeId.startsWith("here")) {
          recentRestaurants.push(place);
          continue;
        }
        const [successOrNotPlaceDetails, responsePlaceDetails] =
          await getPlaceDetails(placeId, "id,types");
        if (successOrNotPlaceDetails != REQUEST.SUCCESSFUL) {
          error = responsePlaceDetails;
          console.error("Error getting place details");
          res.status(400).json(error);
          return;
        }

        const placeDetails = responsePlaceDetails;
        placeDetails.rating = place.rating;
        recentTripsPlaceDetails.push(placeDetails);

        if (
          recentTripsPlaceDetails.length >= maxRecentTrips ||
          recentRestaurants.length >= maxRecentTrips
        )
          break;
      }

      if (
        recentTripsPlaceDetails.length >= maxRecentTrips ||
        recentRestaurants.length >= maxRecentTrips
      )
        break;
    }

    // Finally pass data into the recommender system and get the activities
    const token = req.headers.authorization;
    //TODO: add TripLocation to the request
    const response = await axios.post(
      recommenderURL,
      {
        nearbyPlaces,
        nearbyRestaurants,
        recentTripsPlaceDetails,
        recentRestaurants,
        freeSlots,
        tripMeetings,
        interests,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    const { scheduledActivities } = response.data;
    // Construct trip data for database
    let tripData = {
      tripStart,
      tripEnd,
      tripMeetings,
      scheduledActivities,
    };

    const tripRef = await db.collection("trips").add(tripData);
    const tripId = tripRef.id;

    // Add trip to user currentTrip field
    await db.collection("users").doc(uid).update({ currentTrip: tripId });

    return res.status(200).json({ trip: tripData });
  } catch (error) {
    //console.error("Error creating trip\n", error);
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

router.get("/searchAddress:query", authenticate, async (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const userQuery = req.params.query;
  const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}&input=${encodeURIComponent(
    userQuery
  )}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching from Google Places API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
