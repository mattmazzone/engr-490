const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const authenticate = require("../middlewares/authenticate");
const { calculateFreeTimeSlots } = require("../utils/timeSlotCalculator");
const axios = require("axios");

const recommenderPort = 4000;
const recommenderRoute = "/api/scheduleActivities";
const recommenderURL = `http://localhost:${recommenderPort}${recommenderRoute}`;

// Route to create a new trip
router.post("/create_trip/:uid", authenticate, async (req, res) => {
  try {
    const uid = req.params.uid;
    const { tripStart, tripEnd, tripMeetings } = req.body; // Destructure expected properties

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

    // Construct trip data for database
    let tripData = {
      tripStart,
      tripEnd,
      tripMeetings,
      freeSlots,
    };

    //request to python server for recommendations
    //post request and the body should be the trip data
    const token = req.headers.authorization;
    try{
      //get an array for the response (array of recommendations) from the python
      response = await axios.post(recommenderURL, tripData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );
    }catch(error){
      console.error(error)
      res.status(500).send(error);
    }
    //add recommendations to tripData
    let tripMeetingsUpdated = response.data.tripMeetings;
    //print response of python code
    console.log(tripMeetingsUpdated.data)
    //create trip in database
    tripData = {tripStart, tripEnd, tripMeetingsUpdated, freeSlots}
    
    const tripRef = await db.collection("trips").add(tripData);
    const tripId = tripRef.id;

    // Add trip to user currentTrip field
    await db.collection("users").doc(uid).update({ currentTrip: tripId });

    const trip = await tripRef.get();

    return res.status(200).json({ trip: trip.data() });
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
    const pastTrips = userData.pastTrips;

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
