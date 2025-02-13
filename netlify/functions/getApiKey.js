if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

module.exports.handler = async () => {
    console.log("🔍 Running getApiKey function...");

    try {
        console.log("🔑 Checking GOOGLE_MAPS_API_KEY...");
        if (!process.env.GOOGLE_MAPS_API_KEY) {
            throw new Error("❌ GOOGLE_MAPS_API_KEY is not set!");
        }

        console.log("✅ API Key Found!");
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiKey: process.env.GOOGLE_MAPS_API_KEY }),
        };
    } catch (error) {
        console.error("❌ Error in getApiKey:", error);

        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: error.message }),
        };
    }
};


