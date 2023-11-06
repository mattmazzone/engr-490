const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const app = express();

// Initialize Firebase Admin with your project's credentials
const serviceAccount = require("./tripwise-sdk-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Import routes
const routes = require("./routes");

app.use(cors());
app.use(express.json());

// Use the routes
app.use("/api", routes); // This prefixes all your routes defined in routes.js with '/api'

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
