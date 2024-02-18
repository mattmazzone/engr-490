

async function getRestaurants(latitude, longitude, limit, userInterests) {
    // Filter out all the non-restaurant user interests
    const filteredRestaurantInterests = userInterests.filter(interest => interest.includes("restaurant"));
  
    // Join the filtered interests with spaces to form the query
    const result = filteredRestaurantInterests.join(" ");
  
    // Define the API endpoint and parameters
    const url = "https://discover.search.hereapi.com/v1/discover";
    const params = new URLSearchParams({
      at: `${latitude},${longitude}`,
      q: result,
      limit: limit, //Can set limit
      apiKey: process.env.HERE_API_KEY 
    });
  
    try {
      // Make the GET request
      const response = await fetch(`${url}?${params.toString()}`);
      if (response.ok) { // Check if the response status is 200-299
        const data = await response.json();

        const processedData = processRestaurantData(data);
        return processedData; // Return the formatted data
      } else {
        console.error("Failed to fetch restaurants:", response.status);
        return null; 
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      return null; // Handle fetch errors
    }
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