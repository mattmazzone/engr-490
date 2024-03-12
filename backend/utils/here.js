const axios = require("axios");
const {
  calculateNumberOfDays,
  findClosestMeetingToTargetDate,
  findClosestMeetingToMealTime,
} = require("./timeSlotCalculator");
const { getCoords } = require("./services");

const categories = {
  1000: {
    categories: {
      "100-1000-0000": "Restaurant",
      "100-1000-0001": "Casual Dining",
      "100-1000-0002": "Fine Dining",
      "100-1000-0003": "Take Out and Delivery Only",
      "100-1000-0004": "Food Market-Stall",
      "100-1000-0005": "Taqueria",
      "100-1000-0006": "Deli",
      "100-1000-0007": "Cafeteria",
      "100-1000-0008": "Bistro",
      "100-1000-0009": "Fast Food",
      "100-1100-0000": "Coffee-Tea",
      "100-1100-0010": "Coffee Shop",
      "100-1100-0331": "Tea House",
    },
  },
};
const foodTypes = {
  "101-000": "American",
  "101-001": "American-Californian",
  "101-002": "American-Southwestern",
  "101-003": "American-Barbecue/Southern",
  "101-004": "American-Creole",
  "101-039": "American-Native American",
  "101-040": "American-Soul Food",
  "101-070": "American-Cajun",
  "102-000": "Mexican",
  "102-005": "Mexican-Yucateca",
  "102-006": "Mexican-Oaxaquena",
  "102-007": "Mexican-Veracruzana",
  "102-008": "Mexican-Poblana",
  "103-000": "Canadian",
  "150-000": "Australian",
  "151-000": "Hawaiian/Polynesian",
  "152-000": "Caribbean",
  "153-000": "Cuban",
  "200-000": "Asian",
  "201-000": "Chinese",
  "201-009": "Chinese-Szechuan",
  "201-010": "Chinese-Cantonese",
  "201-041": "Chinese-Shanghai",
  "201-042": "Chinese-Beijing",
  "201-043": "Chinese-Hunan/Hubei",
  "201-044": "Chinese-Jiangsu/Zhejiang",
  "201-045": "Chinese-Shandong",
  "201-046": "Chinese-Northeastern",
  "201-047": "Chinese-Inner Mongolian",
  "201-048": "Chinese-Yunnan/Guizhou",
  "201-049": "Chinese-Taiwanese",
  "201-050": "Chinese-Guangxi",
  "201-051": "Chinese-Jiangxi",
  "201-052": "Chinese-Northwestern",
  "201-053": "Chinese-Porridge",
  "201-054": "Chinese-Islamic",
  "201-055": "Chinese-Hot Pot",
  "202-000": "Indian",
  "202-011": "Indian-Tandoori",
  "202-012": "Indian-Punjabi",
  "202-013": "Indian-Rajasthani",
  "202-014": "Indian-Mughlai",
  "202-015": "Indian-Bengali",
  "202-016": "Indian-Goan",
  "202-017": "Indian-Jain",
  "202-018": "Indian-Konkani",
  "202-019": "Indian-Gujarati",
  "202-020": "Indian-Parsi",
  "202-021": "Indian-South Indian",
  "202-022": "Indian-Maharashtrian",
  "202-023": "Indian-North Indian",
  "202-024": "Indian-Malvani",
  "202-025": "Indian-Hyderabadi",
  "203-000": "Japanese",
  "203-026": "Japanese-Sushi",
  "204-000": "Southeast Asian",
  "205-000": "Thai",
  "206-000": "Vietnamese",
  "207-000": "Korean",
  "208-000": "Pakistani",
  "209-000": "Malaysian",
  "210-000": "Bruneian",
  "211-000": "Indonesian",
  "212-000": "Filipino",
  "250-000": "Middle Eastern",
  "251-000": "Azerbaijani",
  "252-000": "Turkish",
  "253-000": "Lebanese",
  "254-000": "Yemeni",
  "255-000": "Burmese",
  "256-000": "Cambodian",
  "257-000": "Singaporean",
  "258-000": "Sri Lankan",
  "259-000": "Tibetan",
  "300-000": "European",
  "301-000": "French",
  "301-027": "French-Alsatian",
  "301-028": "French-Auvergnate",
  "301-029": "French-Basque",
  "301-030": "French-Corse",
  "301-031": "French-Lyonnaise",
  "301-032": "French-Provencale",
  "301-033": "French-Sud-ouest",
  "302-000": "German",
  "303-000": "Greek",
  "304-000": "Italian",
  "305-000": "Irish",
  "306-000": "Austrian",
  "307-000": "Belgian",
  "308-000": "British Isles",
  "309-000": "Dutch",
  "310-000": "Swiss",
  "311-000": "Spanish",
  "311-034": "Spanish-Tapas",
  "313-000": "Portuguese",
  "314-000": "Maltese",
  "315-000": "Sicilian",
  "350-000": "Scandinavian",
  "351-000": "Finnish",
  "352-000": "Swedish",
  "353-000": "Norwegian",
  "354-000": "Danish",
  "370-000": "East European",
  "371-000": "Hungarian",
  "372-000": "Mediterranean",
  "373-000": "Baltic",
  "374-000": "Belorusian",
  "375-000": "Ukrainian",
  "376-000": "Polish",
  "377-000": "Russian",
  "378-000": "Bohemian",
  "379-000": "Balkan",
  "380-000": "Caucasian",
  "381-000": "Romanian",
  "382-000": "Armenian",
  "404-000": "Argentinean",
  "406-000": "Brazilian",
  "406-035": "Brazilian-Baiana",
  "406-038": "Brazilian-Bakery",
  "406-036": "Brazilian-Capixaba",
  "406-037": "Brazilian-Mineira",
  "405-000": "Chilean",
  "403-000": "Latin American",
  "407-000": "Peruvian",
  "400-000": "South American",
  "401-000": "Surinamese",
  "402-000": "Venezuelan",
  "500-000": "African",
  "501-000": "Moroccan",
  "502-000": "Egyptian",
  "503-000": "Ethiopian",
  "504-000": "Seychellois",
  "505-000": "South African",
  "506-000": "North African",
  "600-000": "Oceanic",
  "800-056": "Steak House",
  "800-057": "Pizza",
  "800-058": "Snacks and Beverages",
  "800-059": "Hot Dogs",
  "800-060": "Sandwich",
  "800-061": "Breakfast",
  "800-062": "Chicken",
  "800-063": "Ice Cream",
  "800-064": "International",
  "800-065": "Continental",
  "800-066": "Fusion",
  "800-067": "Burgers",
  "800-068": "Creperie",
  "800-069": "Pastries",
  "800-071": "Fondue",
  "800-072": "Brunch",
  "800-073": "Bistro",
  "800-074": "BrewPub",
  "800-075": "Seafood",
  "800-076": "Vegan",
  "800-077": "Vegetarian",
  "800-078": "Grill",
  "800-079": "Jewish/Kosher",
  "800-080": "Soup",
  "800-081": "Lunch",
  "800-082": "Dinner",
  "800-083": "Natural/Healthy",
  "800-084": "Organic",
  "800-085": "Noodles",
};

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
    q: `restaurant ${mealType}`,
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
  for (let i = 0; i < meetings.length; i++) {
    const meeting = meetings[i];
    const coords = await getCoords(meeting.location);
    if (coords) {
      meeting.coords = coords;
    }
  }
}

// Gets list of restaurants per day per meeting for breakfast lunch and dinner
async function processDaysAndGetRestaurants(tripStart, tripEnd, meetings) {
  let restaurantsByDate = {};
  const numberOfDays = calculateNumberOfDays(tripStart, tripEnd);

  // Add coordinates to meetings
  await addCoordsToMeetings(meetings);

  // Start date object for iteration
  let currentDate = new Date(tripStart);
  currentDate.setUTCHours(0, 0, 0, 0); // Set to start of the day in UTC

  for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex++) {
    const dateStr = currentDate.toISOString().split("T")[0];

    restaurantsByDate[dayIndex] = { breakfast: [], lunchDinner: [] };

    // Filter meetings for the current UTC day
    const meetingsForDay = meetings.filter((meeting) => {
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
      console.log("Multiple meetings for day", currentDate);
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
          "lunch"
        );
      } else {
        restaurantsByDate[dayIndex].lunch = [];
      }

      if (closestDinnerMeeting) {
        restaurantsByDate[dayIndex].dinner = await getRestaurants(
          closestDinnerMeeting.coords.lat,
          closestDinnerMeeting.coords.lng,
          20,
          "dinner"
        );
      } else {
        restaurantsByDate[dayIndex].dinner = [];
      }
    } else {
      // If there are no meetings for this day, find the closest previous meeting's location
      const closestMeeting = findClosestMeetingToTargetDate(
        currentDate,
        meetings
      );
      if (closestMeeting) {
        restaurantsByDate[dayIndex].breakfast = await getRestaurants(
          closestMeeting.coords.lat,
          closestMeeting.coords.lat,
          20,
          "Breakfast"
        );
        restaurantsByDate[dayIndex].lunch = await getRestaurants(
          closestMeeting.coords.lat,
          closestMeeting.coords.lat,
          20,
          "lunch"
        );
        restaurantsByDate[dayIndex].dinner = await getRestaurants(
          closestMeeting.coords.lat,
          closestMeeting.coords.lat,
          20,
          "dinner"
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
      "Lunch"
    );
    restaurantsByDate[dayIndex].dinner = await getRestaurants(
      location.lat,
      location.lng,
      20,
      "Dinner"
    );
  }

  return restaurantsByDate;
}

module.exports = {
  processDaysAndGetRestaurants,
  getRestaurantsWithNoMeetings,
};
