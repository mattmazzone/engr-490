const axios = require("axios");

const REQUEST = {
  SUCCESSFUL: 0,
  ERROR: 1,
};

async function getNearbyPlaces(payload, fieldMask) {
  try {
    const response = await axios.post(
      "https://places.googleapis.com/v1/places:searchNearby",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask": fieldMask,
        },
      }
    );

    return [REQUEST.SUCCESSFUL, response.data];
  } catch (error) {
    // console.error("Error getting nearby places", error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(error.response.data);
      console.error(error.response.status);
      console.error(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error", error.message);
    }
    return [REQUEST.ERROR, error];
  }
}

async function getRecentTrips(admin, db, uid, numRecentTrips) {
  try {
    let recentTripIds = [];
    await db
      .collection("users")
      .doc(uid)
      .get()
      .then((doc) => {
        recentTripIds = (doc.data()?.pastTrips ?? []).slice(0, numRecentTrips);
      });

    if (recentTripIds.length < 2) {
      return [REQUEST.SUCCESSFUL, []];
    }

    let recentTrips = [];
    await db
      .collection("trips")
      .where(admin.firestore.FieldPath.documentId(), "in", recentTripIds)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((trip) => {
          recentTrips.push(trip);
        });
      });
    console.log("Retreived recent trip data");
    return [REQUEST.SUCCESSFUL, recentTrips];
  } catch (error) {
    console.log(error.message);
    return [REQUEST.ERROR, error];
  }
}

async function getPlaceDetails(id, fieldMask) {
  try {
    const response = await axios.get(
      `https://places.googleapis.com/v1/places/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask": fieldMask,
        },
      }
    );
    return [REQUEST.SUCCESSFUL, response.data];
  } catch (error) {
    console.error(error);
    return [REQUEST.ERROR, error];
  }
}

async function getPlaceTextSearch(address) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;
  try {
    const response = await axios.get(url);
    // Check if the API call was successful and if results were found
    if (response.data.status === "OK" && response.data.results.length > 0) {
      // Getting first result
      const geocodedData = response.data.results[0];
      return [REQUEST.SUCCESSFUL, geocodedData.geometry.location];
    } else {
      // Handle no results or other API errors
      return [
        REQUEST.ERROR,
        { message: "Geocoding failed: " + response.data.status },
      ];
    }
  } catch (error) {
    console.error(error);
    return [REQUEST.ERROR, error.response ? error.response.data : error];
  }
}

async function getUserInterests(uid, db) {
  try {
    let interests = [];
    await db
      .collection("users")
      .doc(uid)
      .get()
      .then((doc) => {
        interests = doc.data().interests;
      });
    return [REQUEST.SUCCESSFUL, interests];
  } catch (error) {
    console.error(error);
    return [REQUEST.ERROR, error];
  }
}

async function getCoords(location) {
  const [successOrNot, responseData] = await getPlaceTextSearch(location);
  if (successOrNot != REQUEST.SUCCESSFUL) {
    error = responseData;
    console.error(error);
    throw new BadRequestException(error);
  }

  // should only be 1 result
  return responseData;
}

async function getTimezone(lat, lng, start) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const secondsSinceEpoch = Math.floor(new Date(start).getTime() / 1000);
  const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${secondsSinceEpoch}&key=${apiKey}`;
  try {
    const response = await axios.get(url);
    // Check if the API call was successful and if results were found
    if (response.data.status === "OK") {
      // Getting first result
      const timeZoneData = response.data;
      return timeZoneData;
    } else {
      // Handle no results or other API errors
      return [
        REQUEST.ERROR,
        { message: "Geocoding failed: " + response.data.status },
      ];
    }
  } catch (error) {
    console.error(error);
    return [REQUEST.ERROR, error.response ? error.response.data : error];
  }
}

async function addMeetingCoordinates(meetings) {
  const enrichedMeetings = [];

  for (const meeting of meetings) {
    if (meeting.location) {
      try {
        const responseData = await getCoords(meeting.location);
        const coords = {
          lat: responseData.lat,
          lng: responseData.lng,
        };

        // Create a new enriched meeting object with the coordinates
        const enrichedMeeting = {
          ...meeting,
          coords,
        };

        enrichedMeetings.push(enrichedMeeting);
      } catch (error) {
        console.error(
          `Failed to get coordinates for meeting at ${meeting.location}:`,
          error
        );
        // Decide how to handle meetings for which coordinates couldn't be fetched
        // For simplicity, we're adding the meeting without coordinates
        enrichedMeetings.push(meeting);
      }
    }
  }

  return enrichedMeetings;
}
async function adjustMeetingTimes(meetings) {
  const adjustedMeetings = [];

  for (const meeting of meetings) {
    if (meeting.location) {
      try {
        const timeZoneData = await getTimezone(
          meeting.coords.lat,
          meeting.coords.lng,
          meeting.start
        );

        // Check if the API call was successful
        if (!timeZoneData || timeZoneData.status !== "OK") {
          console.error("Failed to fetch time zone data:", timeZoneData);
          // Decide how to handle this case. For now, we skip adjustment.
          adjustedMeetings.push(meeting);
          continue;
        }

        // Calculate the total offset (taking into account daylight saving time)
        const offset = timeZoneData.dstOffset + timeZoneData.rawOffset; // In seconds

        // Adjust the meeting start and end times based on the offset
        const adjustedStart = new Date(
          new Date(meeting.start).getTime() + offset * 1000
        ).toISOString();
        const adjustedEnd = new Date(
          new Date(meeting.end).getTime() + offset * 1000
        ).toISOString();

        // Create a new meeting object with adjusted times
        const adjustedMeeting = {
          ...meeting,
          start: adjustedStart,
          end: adjustedEnd,
        };

        adjustedMeetings.push(adjustedMeeting);
      } catch (error) {
        console.error(
          `Failed to adjust time for meeting "${meeting.title}" due to:`,
          error
        );
        // Add the original meeting object in case of failure
        adjustedMeetings.push(meeting);
      }
    }
  }

  return adjustedMeetings;
}

module.exports = {
  REQUEST,
  getNearbyPlaces,
  getRecentTrips,
  getPlaceDetails,
  getPlaceTextSearch,
  getUserInterests,
  getCoords,
  getTimezone,
  addMeetingCoordinates,
  adjustMeetingTimes,
};
