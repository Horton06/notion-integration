import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import cron from 'node-cron';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const campaignsDbId = process.env.CAMPAIGNS_DB_ID!;
const campaignEventsDbId = process.env.CAMPAIGN_EVENTS_DB_ID!;

async function newCampaigns() {
  const response = await notion.databases.query({
    database_id: campaignsDbId,
    filter: {
      property: 'Processed',
      checkbox: {
        equals: false
      }
    }
  });
  return response.results;
}

export async function checkAndProcessCampaigns() {
  console.log('Checking for new campaigns...');
  const campaigns = await newCampaigns();
  if (campaigns.length === 0) {
    console.log('No new campaigns found.');
    return;
  }
  for (const campaign of campaigns) {
    await processCampaign(campaign);
  }
}

function processCampaign(campaign: import("@notionhq/client/build/src/api-endpoints").PageObjectResponse | import("@notionhq/client/build/src/api-endpoints").PartialPageObjectResponse | import("@notionhq/client/build/src/api-endpoints").PartialDatabaseObjectResponse | import("@notionhq/client/build/src/api-endpoints").DatabaseObjectResponse) {
    throw new Error('Function not implemented.');
}
