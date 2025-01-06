exports.handler = async () => {
    return {
        statusCode: 200, 
        body: JSON.stringify({apiKey: process.env.GOOGLE_MAPS_API_KEY}),
    };
};