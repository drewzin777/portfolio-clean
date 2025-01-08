require('dotenv').config();

exports.handler = async () => {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "GOOGLE_MAPS_API_KEY is not set" }),
        };
    }
    return {
        statusCode: 200,
        body: JSON.stringify({ apiKey: process.env.GOOGLE_MAPS_API_KEY }),
    };
};


