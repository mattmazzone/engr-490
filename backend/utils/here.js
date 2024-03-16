const axios = require("axios");
const {
  calculateNumberOfDays,
  findClosestMeetingToTargetDate,
  findClosestMeetingToMealTime,
} = require("./utils");
const { getCoords } = require("./services");

//To get info on specific place
async function lookupPlaceById(placeId) {
  const apiKey = process.env.HERE_API_KEY;

  // Define the URL for the lookupbyid endpoint
  const url = `https://lookup.search.hereapi.com/v1/lookup?id=${placeId}&apiKey=${apiKey}`;

  // Make the GET request using Axios
  axios
    .get(url)
    .then((response) => {
      const processedData = processPlaceData(response.data);
      return processedData;
    })
    .catch((error) => {
      // Handle any errors
      console.error(
        "Error:",
        error.response ? error.response.status : error.message
      );
      return null;
    });
}

async function getRestaurants(latitude, longitude, limit, mealType) {
  // Define the API endpoint and parameters
  const url = "https://discover.search.hereapi.com/v1/discover";
  const params = new URLSearchParams({
    at: `${latitude},${longitude}`,
    q: mealType,
    lang: "en",
    limit: limit, //Can set limit
    apiKey: process.env.HERE_API_KEY,
  });

  try {
    // Make the GET request
    const response = await axios.get(url, { params });
    if (response.status >= 200 && response.status < 300) {
      // Check if the response status is 200-299
      const data = response.data;
      const processedData = processRestaurantData(data);
      return processedData; // Return the formatted data
    } else {
      console.error("Failed to fetch restaurants:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return null; // Handle axios errors
  }
}

async function processRestaurantData(data) {
  const processedItems = [];

  // Check if the response has items and iterate over them
  if (data.items && data.items.length > 0) {
    data.items.forEach((item) => {
      // Check for missing or empty fields
      const hasCategories = item.categories && item.categories.length > 0;
      const hasFoodTypes = item.foodTypes && item.foodTypes.length > 0;
      const hasAddress = item.address && item.address.label;
      const hasPosition = item.position;
      const hasOpeningHours = item.openingHours && item.openingHours.length > 0;

      // Only proceed if all required fields are present and not empty
      if (
        hasCategories &&
        hasFoodTypes &&
        hasAddress &&
        hasPosition &&
        hasOpeningHours
      ) {
        // Combine categories and foodTypes names into a single list of strings
        const types = item.categories
          .map((cat) => cat.id)
          .concat(item.foodTypes.map((ft) => ft.id));

        // Extract the required fields
        const processedItem = {
          title: item.title, // Name of the restaurant
          placeId: item.id, // Unique identifier
          address: item.address.label, // Address as a string
          position: item.position, //address coordinates (latitude, longitude)
          openingHours: item.openingHours.map((oh) => oh.text), // Opening hours as an array of strings ex: "Mon-Fri: 09:00 - 18:00"
          types: types, // Array of strings with categories and food types IDS
        };

        // Add the processed item to the array
        processedItems.push(processedItem);
      }
    });
  }

  return processedItems;
}

async function addCoordsToMeetings(meetings) {
  const meetingsWithCoords = [];

  for (let i = 0; i < meetings.length; i++) {
    const meeting = meetings[i];
    // Check if the location exists before attempting to get coords
    if (meeting.location && meeting.location !== "") {
      const coords = await getCoords(meeting.location);
      if (coords) {
        // If coords exist, add them to the meeting and push it to the result array
        meeting.coords = coords;
        meetingsWithCoords.push(meeting);
      }
    }
  }

  return meetingsWithCoords; // Return only meetings with valid locations and coords
}

// Gets list of restaurants per day per meeting for breakfast lunch and dinner
async function processDaysAndGetRestaurants(tripStart, tripEnd, meetings) {
  let restaurantsByDate = {};
  const numberOfDays = calculateNumberOfDays(tripStart, tripEnd);

  // Add coordinates to meetings
  const meetingsWithCoords = await addCoordsToMeetings(meetings);
  console.log("Meetings with coords", meetingsWithCoords);

  // Start date object for iteration
  let currentDate = new Date(tripStart);
  currentDate.setUTCHours(0, 0, 0, 0); // Set to start of the day in UTC

  for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex++) {
    const dateStr = currentDate.toISOString().split("T")[0];

    restaurantsByDate[dayIndex] = { breakfast: [], lunch: [], dinner: [] };

    // Filter meetings for the current UTC day
    const meetingsForDay = meetingsWithCoords.filter((meeting) => {
      return meeting.start.split("T")[0] === dateStr;
    });

    if (meetingsForDay.length === 1) {
      // If there's a single meeting, call getCoords and getRestaurants for breakfast and lunch/dinner
      restaurantsByDate[dayIndex].breakfast = await getRestaurants(
        meetingsForDay[0].coords.lat,
        meetingsForDay[0].coords.lng,
        20,
        "Breakfast"
      );
      restaurantsByDate[dayIndex].lunch = await getRestaurants(
        meetingsForDay[0].coords.lat,
        meetingsForDay[0].coords.lng,
        20,
        "restaurant"
      );
      restaurantsByDate[dayIndex].dinner = await getRestaurants(
        meetingsForDay[0].coords.lat,
        meetingsForDay[0].coords.lng,
        20,
        "restaurant"
      );
    } else if (meetingsForDay.length > 1) {
      // Define meal time windows in UTC hours for comparison with meeting start times
      const breakfastTime = new Date(`${dateStr}T08:00:00.000Z`);
      const lunchTime = new Date(`${dateStr}T12:00:00.000Z`);
      const dinnerTime = new Date(`${dateStr}T18:00:00.000Z`);

      // Find closest meetings for each meal time
      const closestBreakfastMeeting = findClosestMeetingToMealTime(
        breakfastTime,
        meetingsForDay
      );
      const closestLunchMeeting = findClosestMeetingToMealTime(
        lunchTime,
        meetingsForDay
      );
      const closestDinnerMeeting = findClosestMeetingToMealTime(
        dinnerTime,
        meetingsForDay
      );
      if (closestBreakfastMeeting) {
        restaurantsByDate[dayIndex].breakfast = await getRestaurants(
          closestBreakfastMeeting.coords.lat,
          closestBreakfastMeeting.coords.lng,
          20,
          "Breakfast"
        );
      } else {
        restaurantsByDate[dayIndex].breakfast = [];
      }

      if (closestLunchMeeting) {
        restaurantsByDate[dayIndex].lunch = await getRestaurants(
          closestLunchMeeting.coords.lat,
          closestLunchMeeting.coords.lng,
          20,
          "restaurant"
        );
      } else {
        restaurantsByDate[dayIndex].lunch = [];
      }

      if (closestDinnerMeeting) {
        restaurantsByDate[dayIndex].dinner = await getRestaurants(
          closestDinnerMeeting.coords.lat,
          closestDinnerMeeting.coords.lng,
          20,
          "restaurant"
        );
      } else {
        restaurantsByDate[dayIndex].dinner = [];
      }
    } else {
      // If there are no meetings for this day, find the closest previous meeting's location
      const closestMeeting = findClosestMeetingToTargetDate(
        currentDate,
        meetingsWithCoords
      );
      if (closestMeeting) {
        restaurantsByDate[dayIndex].breakfast = await getRestaurants(
          closestMeeting.coords.lat,
          closestMeeting.coords.lng,
          20,
          "Breakfast"
        );
        restaurantsByDate[dayIndex].lunch = await getRestaurants(
          closestMeeting.coords.lat,
          closestMeeting.coords.lng,
          20,
          "restaurant"
        );
        restaurantsByDate[dayIndex].dinner = await getRestaurants(
          closestMeeting.coords.lat,
          closestMeeting.coords.lng,
          20,
          "restaurant"
        );
      } else {
        console.log("No meetings for day", currentDate);
        restaurantsByDate[dayIndex] =
          "No meetings and no previous location found.";
      }
    }

    // Increment the day for the next iteration
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return restaurantsByDate;
}

//No meetings have locations or no meetings at all
async function getRestaurantsWithNoMeetings(tripStart, tripEnd, location) {
  let restaurantsByDate = {};
  const numberOfDays = calculateNumberOfDays(tripStart, tripEnd);

  for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex++) {
    restaurantsByDate[dayIndex] = { breakfast: [], lunch: [], dinner: [] };
    restaurantsByDate[dayIndex].breakfast = await getRestaurants(
      location.lat,
      location.lng,
      20,
      "Breakfast"
    );
    restaurantsByDate[dayIndex].lunch = await getRestaurants(
      location.lat,
      location.lng,
      20,
      "restaurant"
    );
    restaurantsByDate[dayIndex].dinner = await getRestaurants(
      location.lat,
      location.lng,
      20,
      "restaurant"
    );
  }

  return restaurantsByDate;
}

module.exports = {
  processDaysAndGetRestaurants,
  getRestaurantsWithNoMeetings,
};
