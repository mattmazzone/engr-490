const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const admin = require("firebase-admin");
const db = admin.firestore();
const { getNearbyPlaces, REQUEST } = require("../utils/getNearbyPlaces");
const axios = require("axios");

const recommenderPort = 4000;
const recommenderRoute = "/api/recommend";
const recommenderURL = `http://localhost:${recommenderPort}${recommenderRoute}`;

router.post("/recommend-activities", authenticate, async (req, res) => {
  let { maxResultCount, latitude, longitude, radius } = req.body;

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

    const token = req.headers.authorization;
    const response = await axios.post(recommenderURL, nearbyPlaces, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    const activities = response.data.places;
    res.status(200).send(activities);
  } else {
    const error = responseData;
    res.status(400).send(error.message);
  }
});

module.exports = router;
