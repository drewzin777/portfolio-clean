require("dotenv").config();

exports.handler = async () => {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "❌ GOOGLE_MAPS_API_KEY is missing from environment variables!" }),
        };
    }

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
        body: JSON.stringify({ apiKey: process.env.GOOGLE_MAPS_API_KEY }),
    };
};
