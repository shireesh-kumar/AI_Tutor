require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    claudeAPIKey: process.env.ANTHROPIC_API_KEY,
    temperature:process.env.TEMPERATURE,
    modelName:process.env.MODEL,
    frontendUrl: process.env.FRONTEND_URL
}