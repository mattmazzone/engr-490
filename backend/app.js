const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const app = express();

require("dotenv").config();

// check if the environment variables are set
if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.error("GOOGLE_MAPS_API_KEY environment variable not set");
  process.exit(1);
}

if (!process.env.HERE_API_KEY) {
  console.error("HERE_API_KEY environment variable not set");
  process.exit(1);
}

// Initialize Firebase Admin with your project's credentials
const serviceAccount = require("./tripwise-sdk-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Import routes
const tripRoutes = require("./routes/trips");
const userRoutes = require("./routes/users");
const placesRoutes = require("./routes/places");

app.use(cors());
app.use(express.json());

// Use the routes
app.use("/api", tripRoutes);
app.use("/api", userRoutes);
app.use("/api", placesRoutes);

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
