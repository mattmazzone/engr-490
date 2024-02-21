const axios = require("axios");



async function getRestaurants(latitude, longitude, limit, userInterests) {
    // Filter out all the non-restaurant user interests
    const filteredRestaurantInterests = userInterests.filter(interest => interest.includes("restaurant"));
    
    //Remove unnecessary "_restaurant" in interests
    const cleanedInterests = filteredRestaurantInterests.map(interest => interest.replace("_restaurant", ""));
    //Randomize array and select 1 random food related interests


  
    const result = selectRandomItem(cleanedInterests);
  
    // Define the API endpoint and parameters
    const url = "https://discover.search.hereapi.com/v1/discover";
    const params = new URLSearchParams({
      at: `${latitude},${longitude}`,
      q: `${result} restaurant`,
      limit: limit, //Can set limit
      apiKey: process.env.HERE_API_KEY 
    });
  
    try {
      // Make the GET request
      const response = await axios.get(url, { params });
      if (response.status >= 200 && response.status < 300) { // Check if the response status is 200-299
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


function selectRandomItem(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

async function processRestaurantData(data){

  const processedItems = [];

  // Check if the response has items and iterate over them
  if (data.items && data.items.length > 0) {
    data.items.forEach(item => {

      // Combine categories and foodTypes names into a single list of strings
      const types = item.categories.map(cat => cat.name).concat(item.foodTypes.map(ft => ft.name));

      // Extract the required fields
      const processedItem = {
        title: item.title,
        id: item.id,
        address: item.address.label,
        position: item.position,
        openingHours: item.openingHours.map(oh => oh.text),
        types: types 
      };

      // Add the processed item to the array
      processedItems.push(processedItem);
    });
  }

  // Return the processed items
  return processedItems;
}



module.exports = {
    getRestaurants
}