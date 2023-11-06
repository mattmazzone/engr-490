// routes.js
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore(); // Assuming Firebase Admin has been initialized in app.js or a separate config file

// Middleware to authenticate the Firebase token
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization;
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send("You are not authorized");
  }
};

// Route to get user profile data
router.get("/profile/:uid", authenticate, async (req, res) => {
  const uid = req.params.uid;
  try {
    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) {
      return res.status(404).send("User not found");
    }
    const userData = doc.data();
    return res.status(200).json(userData);
  } catch (error) {
    console.error("Error getting user data", error);
    res.status(500).send(error.message);
  }
});

// Export the router
module.exports = router;
