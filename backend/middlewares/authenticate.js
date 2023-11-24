const admin = require("firebase-admin");

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

module.exports = authenticate;
