exports.handler = async () => {
    try {
        if (!process.env.GOOGLE_MAPS_API_KEY) {
            throw new Error("GOOGLE_MAPS_API_KEY is not set");
        }
        return {
            statusCode: 200,
            body: JSON.stringify({ apiKey: process.env.GOOGLE_MAPS_API_KEY }),
        };
    } catch (error) {
        console.error("Error in getApiKey:", error); // Debugging output
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};


