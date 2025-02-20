const axios = require("axios");

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

module.exports.handler = async (event) => {
    console.log("🔍 Running Google Places Proxy...");

    try {
        const { queryStringParameters } = event;
        const { location, radius, type } = queryStringParameters;

        if (!process.env.GOOGLE_MAPS_API_KEY) {
            throw new Error("❌ GOOGLE_MAPS_API_KEY is not set!");
        }

        if (!location || !radius || !type) {
            throw new Error("❌ Missing required parameters: location, radius, type.");
        }

        const googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

        console.log("🌍 Fetching data from Google Places API...");
        const response = await axios.get(googleUrl);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
            },
            body: JSON.stringify(response.data),
        };
    } catch (error) {
        console.error("❌ Error in Google Places Proxy:", error);

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
            },
            body: JSON.stringify({ error: error.message }),
        };
    }
};
