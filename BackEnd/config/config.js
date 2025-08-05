require('dotenv').config();

module.exports = {
    port: parseInt(process.env.PORT) || 5000,
    claudeAPIKey: process.env.ANTHROPIC_API_KEY,
    temperature:parseFloat(process.env.TEMPERATURE) || 0.7,
    modelName:process.env.MODEL,
    frontendUrl: process.env.FRONTEND_URL
}