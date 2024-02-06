const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const app = express();

if (process.platform == "win32") {
  require("dotenv").config({ path: __dirname + "\\..\\env" });
} else {
  require("dotenv").config({ path: __dirname + "/../.env" });
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
