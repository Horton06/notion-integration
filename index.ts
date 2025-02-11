import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

// Test that the configuration works
console.log("Environment loaded:");
console.log("NOTION_API_KEY =", process.env.NOTION_API_KEY);
console.log("CAMPAIGNS_DB_ID =", process.env.CAMPAIGNS_DB_ID);
console.log("CAMPAIGN_EVENTS_DB_ID =", process.env.CAMPAIGN_EVENTS_DB_ID);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/webhook/campaign-created', async (req, res) => {
  try {
    // Your campaign handling logic here
    res.status(200).send('Campaign events created.');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error creating campaign events.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
