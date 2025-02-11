import express from 'express';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const notion = new Client({ auth: process.env.NOTION_API_KEY });

app.use(express.json());

app.post('/api/campaign', async (req, res) => {
  const { campaignPageId } = req.body;

  try {
    const page = await notion.pages.retrieve({ page_id: campaignPageId });
    res.status(200).json(page);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Failed to retrieve page" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
