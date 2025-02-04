// createCampaignEvents.ts
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Load environment variables from your .env file
dotenv.config();

// Initialize dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Initialize Notion client with your API key
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Define the interface for event configuration (for TypeScript users)
interface EventConfig {
  daysOffset: number;
  eventType: string;
  applicableTypes: string[];
}

// Define the EVENT_CONFIG array
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

// The main function to create campaign events
async function createCampaignEvents(campaignPageId: string) {
  // Retrieve the campaign page from Notion
  const campaignPage: any = await notion.pages.retrieve({
    page_id: campaignPageId,
  });

  // Extract campaign details.
  // Change property names to match exactly your database configuration.
  const campaignName: string = campaignPage.properties['Campaign Name'].title[0]?.plain_text;
  const campaignLaunchDate: string = campaignPage.properties['Launch Date'].date.start;
  const campaignType: string = campaignPage.properties['Campaign Type'].select.name;
  const personInCharge = campaignPage.properties['Person in Charge'].people;

  // Convert the launch date to a dayjs object with timezone 'America/New_York'
  const launchDate = dayjs(campaignLaunchDate).tz('America/New_York');

  // Filter events applicable to this campaign based on campaign type.
  const applicableEvents = EVENT_CONFIG.filter(config =>
    config.applicableTypes.includes('*') || config.applicableTypes.includes(campaignType)
  );

  // Loop through each applicable event and create a page in the Campaign Events database
  for (const config of applicableEvents) {
    const eventDate = launchDate.add(config.daysOffset, 'day').format();
    const eventName = `${campaignName} - ${config.eventType}`;

    await notion.pages.create({
      parent: { database_id: process.env.CAMPAIGN_EVENTS_DB_ID as string },
      properties: {
        'Event Name': {
          title: [
            {
              text: { content: eventName }
            }
          ]
        },
        'Event Date': {
          date: { start: eventDate }
        },
        'Event Type': {
          select: { name: config.eventType }
        },
        'Related Campaign': {
          // Establish the bidirectional relationship using the campaign's page ID
          relation: [{ id: campaignPageId }]
        },
        'Responsible Party': {
          // Populate using the Person in Charge from the campaign
          people: personInCharge
        }
      }
    });
  }

  console.log(`Campaign events created for campaign: ${campaignName}`);
}

// A simple main function to test the automation flow
async function main() {
  // Replace this with your test campaign page ID from the Campaigns database
  const testCampaignPageId = '1234567890abcdef1234567890abcdef';
  await createCampaignEvents(testCampaignPageId);
}

// Call the main function and handle errors
main().catch(error => {
  console.error('Error creating campaign events:', error);
});