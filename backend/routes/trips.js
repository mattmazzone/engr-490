const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const fetch = require("node-fetch");
const authenticate = require("../middlewares/authenticate");
const {
  calculateFreeTimeSlots,
  categorizeInterests,
} = require("../utils/utils.js");
const {
  getRecentTrips,
  REQUEST,
  getPlaceDetails,
  getUserInterests,
  getCoords,
  getTimezone,
  adjustMeetingTimes,
  useGetNearbyPlacesSevice,
} = require("../utils/services");
const {
  processDaysAndGetRestaurants,
  getRestaurantsWithNoMeetings,
  lookupPlaceById,
} = require("../utils/here");
const axios = require("axios");
require("dotenv").config();

const recommenderPort = 4000;
const recommenderRoute = "/api/recommend";
let reccomenderBaseURL;
if (process.env.NODE_ENV === "production") {
  reccomenderBaseURL = "http://flask-backend";
} else {
  reccomenderBaseURL = "http://localhost";
}
const recommenderURL = `${reccomenderBaseURL}:${recommenderPort}${recommenderRoute}`;

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
      throw new Error(interests);
    }

    // filter out restaurant interests from the list
    const { restaurantInterests, nonRestaurantInterests } =
      categorizeInterests(interests);

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
        const timeZone = await getTimezone(
          location.lat,
          location.lng,
          tripStart
        );
        nearbyPlaces.push({ places: responseData.places, timeZone: timeZone });
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
      console.error(error, "Error getting recent trips");
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
        // check for null place_id or place_similarity
        if (!place.place_similarity || !place.place_similarity.place_id) {
          console.log(
            "Place id is null or place_similarity is null for place",
            place
          );
          continue; // Skip to the next iteration if place_similarity is null or place_id is not present
        }

        const placeId = place.place_similarity.place_id;

        //Seperate the here places from the google places
        if (placeId.startsWith("here")) {
          recentRestaurants.push(place);
          continue;
        }
        const [successOrNotPlaceDetails, responsePlaceDetails] =
          await getPlaceDetails(placeId, "id,types");
        if (successOrNotPlaceDetails != REQUEST.SUCCESSFUL) {
          console.error("Error getting place details");
          return res.status(400).json(responsePlaceDetails);
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
    console.log("Sent request to recommender system");
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
    console.log("Received response from recommender system");
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

    // Select a picture for the trip
    const trip = await db.collection("trips").doc(tripId).get();
    const tripData = trip.data();
    const scheduledActivities = tripData.scheduledActivities;

    let placeId = "";
    for (const activity of scheduledActivities) {
      if (activity.place_similarity.place_id.startsWith("here")) {
        continue;
      }
      placeId = activity.place_similarity.place_id;
    }

    // const scheduledActivity = scheduledActivities[0];
    // const placeId = scheduledActivity.place_similarity.place_id;

    let photoUrl = "";

    // If the place is a Here place, get the photo from Here API
    if (placeId.startsWith("here")) {
      const place = await lookupPlaceById(placeId);
      console.log("Place", place);
      const photos = place.media.images.items;
      for (const photo of photos) {
        if (photo.widthPx > photo.heightPx) {
          photoUrl = photo.href;
          break;
        }
      }
      if (photoUrl === "") {
        photoUrl = photos[0].href;
      }
    } else {
      // Get the photo from Google Places API
      const [successOrNotPlaceDetails, responsePlaceDetails] =
        await getPlaceDetails(placeId, "id,displayName,photos");
      if (successOrNotPlaceDetails != REQUEST.SUCCESSFUL) {
        error = responsePlaceDetails;
        console.error("Error getting place details");
        res.status(400).json(error);
        return;
      }
      const placeDetails = responsePlaceDetails;

      const photos = placeDetails.photos;

      // Loop through photos and select the first horizontal photo
      // If no horizontal photo is found, select the first photo
      let photoName = "";
      for (const photo of photos) {
        if (photo.widthPx > photo.heightPx) {
          photoName = photo.name;
          break;
        }
      }
      if (photoName === "") {
        photoName = photos[0].name;
      }

      // Get the photo
      photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&maxWidthPx=400&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    }
    // Download the photo then upload to firebase storage
    const photoResponse = await axios.get(photoUrl, {
      responseType: "arraybuffer",
    });
    const photoBuffer = Buffer.from(photoResponse.data, "binary");
    const photoPath = `trip-pictures/${tripId}`;
    const bucket = admin.storage().bucket();
    const file = bucket.file(photoPath);
    const stream = file.createWriteStream({
      metadata: {
        contentType: "image/jpeg",
      },
    });
    stream.end(photoBuffer);
    stream.on("error", (err) => {
      console.error("Error uploading file to Firebase Storage:", err);
    });

    stream.on("finish", () => {
      console.log("File uploaded successfully to Firebase Storage.");
    });

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
