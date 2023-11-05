const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin with your project's credentials
const serviceAccount = require("./tripwise-sdk-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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

// An example protected route
app.post("/firestore-action", authenticate, (req, res) => {
  // Here you have access to req.user which contains the user's uid and other data
  // You can now perform actions on Firestore using the admin SDK
  const data = req.body; // Data sent from the client
  // Perform Firestore operations here
  res.send("Firestore action was performed");
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
