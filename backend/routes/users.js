const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const authenticate = require("../middlewares/authenticate");

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

// Route to update user interest array
router.put("/interests/:uid", authenticate, async (req, res) => {
  const uid = req.params.uid;
  const interests = req.body.interests;
  try {
    await db.collection("users").doc(uid).update({ interests });
    return res.status(200).send("Interests updated successfully");
  } catch (error) {
    console.error("Error updating interests", error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
