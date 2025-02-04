import { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import cron from 'node-cron';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const campaignsDbId = process.env.CAMPAIGNS_DB_ID!;
const campaignEventsDbId = process.env.CAMPAIGN_EVENTS_DB_ID!;

// Define the configuration for events
interface EventConfig {
  daysOffset: number;
  eventType: string;
  applicableTypes: string[];
}

const EVENT_CONFIG: EventConfig[] = [
  // Universal Events (applies to all campaigns)
  { daysOffset: -21, eventType: 'Brief Date', applicableTypes: ['*'] },
  { daysOffset: -28, eventType: 'Planning Date 1', applicableTypes: ['*'] },

  // Campaign-Specific Events
  { 
    daysOffset: -42, 
    eventType: 'Planning Date 2',
    applicableTypes: ['Drink Launch', 'Bake Launch', 'Lab Events', 'Lab Promotions']
  },
  {
    daysOffset: -7,
    eventType: 'Marketing 1 Date',
    applicableTypes: [
      'Drink Launch', 'Bake Launch', 'Lab Events', 
      'Lab Promotions', 'Workshops', 'Hours Change', 'Startup City'
    ]
  },
  {
    daysOffset: -14,
    eventType: 'Marketing 2 Date',
    applicableTypes: ['Lab Events', 'Lab Promotions', 'Workshops']
  },
  {
    daysOffset: -21,
    eventType: 'Marketing 3 Date',
    applicableTypes: ['Lab Events', 'Lab Promotions', 'Workshops']
  },
  {
    daysOffset: -14,
    eventType: 'Ingredient Purchase Date',
    applicableTypes: ['Bake Launch', 'Drink Launch', 'Workshops']
  },
  {
    daysOffset: -10,
    eventType: 'Staff Training Date',
    applicableTypes: ['Bake Launch', 'Drink Launch', 'Workshops']
  },
  {
    daysOffset: -14,
    eventType: 'Newsletter Draft Date',
    applicableTypes: ['Newsletter']
  },
  {
    daysOffset: 7,
    eventType: 'Followup',
    applicableTypes: ['Lab Promotions', 'Lab Events', 'Newsletter']
  }
];

// Function to create events based on the configuration
async function createCampaignEvents(campaignPageId: string, campaignType: string, campaignStartDate: Date) {
  const eventsToCreate = EVENT_CONFIG.filter(event => 
    event.applicableTypes.includes(campaignType) || event.applicableTypes.includes('*')
  );

  for (const event of eventsToCreate) {
    const eventDate = new Date(campaignStartDate);
    eventDate.setDate(eventDate.getDate() + event.daysOffset);

    // Create the event in Notion
    await notion.pages.create({
      parent: { database_id: campaignEventsDbId },
      properties: {
        Name: { title: [{ text: { content: event.eventType } }] },
        Date: { date: { start: eventDate.toISOString() } },
        Campaign: { relation: [{ id: campaignPageId }] },
        Type: { select: { name: event.eventType } }
      }
    });
  }
}

// Function to process a single campaign
async function processCampaign(campaignPage: any) {
  try {
    const campaignTitleProperty = campaignPage.properties['Campaign Name'];
    const campaignName = campaignTitleProperty?.title?.[0]?.plain_text || 'Unnamed Campaign';
    const campaignType = campaignPage.properties['Campaign Type'].select.name;
    const campaignStartDate = new Date(campaignPage.properties['Start Date'].date.start);

    console.log(`Processing campaign: ${campaignName}`);

    await createCampaignEvents(campaignPage.id, campaignType, campaignStartDate);

    // Mark the campaign as processed
    await notion.pages.update({
      page_id: campaignPage.id,
      properties: {
        'Processed': { checkbox: true }
      }
    });
    console.log(`Marked campaign "${campaignName}" as processed.`);
  } catch (error) {
    console.error('Error processing campaign:', error);
  }
}

// Function to query new campaigns
async function getNewCampaigns() {
  try {
    const response = await notion.databases.query({
      database_id: campaignsDbId,
      filter: {
        property: 'Processed',
        checkbox: { equals: false }
      }
    });
    return response.results;
  } catch (error) {
    console.error('Error querying Campaigns database:', error);
    return [];
  }
}

// Function to check and process campaigns
export async function checkAndProcessCampaigns() {
  console.log('Checking for new campaigns...');
  const newCampaigns = await getNewCampaigns();
  if (newCampaigns.length === 0) {
    console.log('No new campaigns found.');
    return;
  }
  for (const campaign of newCampaigns) {
    await processCampaign(campaign);
  }
}

// For local development only: schedule the task internally using node-cron
if (process.env.NODE_ENV !== 'production') {
  cron.schedule('*/5 * * * *', () => {
    checkAndProcessCampaigns().catch((error) =>
      console.error('Error in scheduled task:', error)
    );
  });
}

// API Handler for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized');
  }
  const startTime = Date.now();
  try {
    await checkAndProcessCampaigns();
    const duration = Date.now() - startTime;
    console.log(`Automation executed in ${duration}ms at ${new Date().toISOString()}`);
    res.status(200).json({ 
      message: 'Automation triggered successfully.', 
      duration,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Automation error:', error);
    res.status(500).json({ message: 'Error triggering automation.' });
  }
}
