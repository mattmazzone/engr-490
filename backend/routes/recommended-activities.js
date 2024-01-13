const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const admin = require("firebase-admin");
const db = admin.firestore();
const {
  getNearbyPlaces,
  getRecentTrips,
  REQUEST,
} = require("../utils/services");
const axios = require("axios");

const recommenderPort = 4000;
const recommenderRoute = "/api/recommend";
const recommenderURL = `http://localhost:${recommenderPort}${recommenderRoute}`;

router.post("/recommend-activities/:uid", authenticate, async (req, res) => {
  let { maxResultCount, latitude, longitude, radius } = req.body;
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

  let [successOrNot, responseData] = await getNearbyPlaces(
    payload,
    "places.id,places.types"
  );

  if (successOrNot == REQUEST.SUCCESSFUL) {
    const nearbyPlaces = responseData;

    let [successOrNotTrips, responseDataTrips] = await getRecentTrips(
      admin,
      db,
      uid
    );
    if (successOrNotTrips == REQUEST.SUCCESSFUL) {
      const recentTrips = responseDataTrips;
      const token = req.headers.authorization;
      try {
        const response = await axios.post(
          recommenderURL,
          { nearbyPlaces, recentTrips },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );
        const activities = response.data;
        res.status(200).json(activities);
      } catch (e) {
        console.error(e);
        res.status(500).send(e);
      }
    } else {
      const error = responseDataTrips;
      console.error("Error getting recent trips");
      res.status(400).json(error);
    }
  } else {
    const error = responseData;
    console.error("Error getting nearby places");
    res.status(400).json(error);
  }
});

module.exports = router;
