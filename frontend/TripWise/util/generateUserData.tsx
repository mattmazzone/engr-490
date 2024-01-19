import { faker } from "@faker-js/faker";
import { tr } from "react-native-paper-dates";

interface Category {
  name: string;
  items: { id: string; titles: string[] }[];
}

const interests: Category[] = [
  {
    name: "Culture 🎨",
    items: [{ id: "Culture 🎨", titles: ["culture"] }],
  },
  {
    name: "Food & Drink 🍔",
    items: [
      {
        id: "Asian Cuisine 🥢",
        titles: [
          "chinese_restaurant",
          "japanese_restaurant",
          "indonesian_restaurant",
          "korean_restaurant",
          "ramen_restaurant",
          "sushi_restaurant",
          "vietnamese_restaurant",
          "thai_restaurant",
        ],
      },
      {
        id: "Middle Eastern Cuisine 🧆",
        titles: [
          "lebanese_restaurant",
          "middle_eastern_restaurant",
          "turkish_restaurant",
        ],
      },
      {
        id: "American Cuisine 🍟",
        titles: [
          "american_restaurant",
          "barbecue_restaurant",
          "hamburger_restaurant",
          "pizza_restaurant",
        ],
      },
      { id: "Cafe ☕", titles: ["cafe", "bakery", "sandwich_restaurant"] },
      {
        id: "Breakfast 🍳",
        titles: ["breakfast_restaurant", "brunch_restaurant"],
      },
      {
        id: "Italian Cuisine 🍝",
        titles: ["italian_restaurant", "pizza_restaurant"],
      },
      {
        id: "Mediterranean Cuisine 🍱",
        titles: ["mediterranean_restaurant", "greek_restaurant"],
      },
      { id: "Vegan 🌱", titles: ["vegan_restaurant", "vegetarian_restaurant"] },
      {
        id: "South American Cuisine 🥘",
        titles: ["brazilian_restaurant", "mexican_restaurant"],
      },
    ],
  },
  {
    name: "Entertainemnt & Recreation 🎉",
    items: [
      { id: "Amusement Park 🎢", titles: ["amusement_park"] },
      { id: "Aquarium 🐟", titles: ["aquarium"] },
      { id: "Bowling 🎳", titles: ["bowling_alley"] },
      { id: "Casino 🎰", titles: ["casino"] },
      { id: "Movies 🎬", titles: ["movie_theatre"] },
      { id: "Outdoors 🌳", titles: ["national_park", "hiking_area"] },
      { id: "Night Club 🕺", titles: ["night_club"] },
      { id: "Tourist Attraction 🗺️", titles: ["tourist_attraction"] },
      { id: "Zoo 🦁", titles: ["zoo"] },
      { id: "History 📜", titles: ["historical_landmark"] },
    ],
  },
  {
    name: "Health & Wellness 💆",
    items: [{ id: "Spa 💅", titles: ["spa"] }],
  },
  {
    name: "Places of Worship 🛐",
    items: [
      { id: "Church ⛪", titles: ["church"] },
      { id: "Temple 🕍", titles: ["hindu_temple"] },
      { id: "Mosque 🕌", titles: ["mosque"] },
      { id: "Synagogue 🕍", titles: ["synagogue"] },
    ],
  },
  {
    name: "Shopping 🛍️",
    items: [
      { id: "Book Store 📚", titles: ["book_store"] },
      { id: "Clothing Store 👗", titles: ["clothing_store"] },
      { id: "Gift Shop 🎁", titles: ["gift_shop"] },
      { id: "Jewellery Store 💍", titles: ["jewellery_store"] },
      { id: "Liquor Store 🍷", titles: ["liquor_store"] },
      { id: "Shopping Mall 🏬", titles: ["shopping_mall"] },
    ],
  },
  {
    name: "Sports ⚽",
    items: [
      { id: "Golf ⛳", titles: ["golf_course"] },
      { id: "Gym 💪", titles: ["gym"] },
      { id: "Playground 🤸", titles: ["playground"] },
      { id: "Ski 🎿", titles: ["ski"] },
      { id: "Sports Club 🏟️", titles: ["sports_club"] },
      { id: "Swimming Pool 🏊", titles: ["swimming_pool"] },
    ],
  },
];

interface Activity {
  googlePlaceId: string;
  name: string;
  address: string;
  category: string;
  rating: number;
  duration: number;
}

interface Trip {
  id: string;
  city: string;
  generatedActivities: Activity[];
}

export default async function generateUserData() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  let userInterests: string[] = [];

  // Iterate over each interest category
  interests.forEach((category) => {
    // Randomly decide to include this category or not
    if (faker.datatype.boolean()) {
      // Randomly pick a title from one of the items in the category
      const item: { id: string; titles: string[] } = faker.helpers.arrayElement(
        category.items
      );
      const titles: string[] = item.titles;

      // Add the titles to the user interests
      titles.forEach((title) => {
        userInterests.push(title);
      });
    }
  });

  // Generate a trip
  let trip: Trip = {
    id: faker.string.uuid(),
    city: faker.location.city(),
    generatedActivities: [],
  };

  //import env variables
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  // GEOCODE CITY

  console.log(trip.city);

  const apiKey: any = process.env.GOOGLE_MAPS_API_KEY;
  const url = "https://places.googleapis.com/v1/places:searchText";

  // get 5 random places from the city based on randomly selected interests
  let places: any = [];

  // log users interests
  console.log(userInterests);

  for (let i = 0; i < 5; i++) {
    let selectedInterest = faker.helpers.arrayElement(userInterests);
    // remove selected interest from array
    userInterests = userInterests.filter((item) => item !== selectedInterest);
    console.log(selectedInterest);
    let data = {
      textQuery: `${trip.city} ${selectedInterest}`,
      minRating: 3.5,
      maxResultCount: 1,
    };

    let response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": "AIzaSyB_69fhnPW9G4HySH19m4pARxDB1iOtlZg",
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.priceLevel",
      },
      body: JSON.stringify(data),
    });

    let place = await response.json();
    places.push(place);
  }

  console.log(places);

  let user: any = {
    firstName: firstName,
    lastName: lastName,
    userInterests: userInterests,
  };
  return user;
}
