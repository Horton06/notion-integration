// Load environment variables from the .env file
require('dotenv').config();

// Test that the configuration works
console.log("Environment loaded:");
console.log("NOTION_API_KEY =", process.env.NOTION_API_KEY);
console.log("CAMPAIGNS_DB_ID =", process.env.CAMPAIGNS_DB_ID);
console.log("CAMPAIGN_EVENTS_DB_ID =", process.env.CAMPAIGN_EVENTS_DB_ID);
