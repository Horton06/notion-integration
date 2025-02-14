"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndProcessCampaigns = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@notionhq/client");
const node_cron_1 = __importDefault(require("node-cron"));
dotenv_1.default.config();
const notion = new client_1.Client({ auth: process.env.NOTION_API_KEY });
const campaignsDbId = process.env.CAMPAIGNS_DB_ID;
const campaignEventsDbId = process.env.CAMPAIGN_EVENTS_DB_ID;
const EVENT_CONFIG = [
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
/**
 * Query the Campaigns database for new campaigns.
 * This function assumes you added a "Processed" checkbox property in the Campaigns database.
 */
async function getNewCampaigns() {
    try {
        const response = await notion.databases.query({
            database_id: campaignsDbId,
            filter: {
                property: 'Processed',
                checkbox: {
                    equals: false,
                },
            },
        });
        return response.results;
    }
    catch (error) {
        console.error('Error querying Campaigns database:', error);
        return [];
    }
}
/**
 * Process a single campaign by creating subsequent events and marking the campaign as processed.
 * @param campaignPage The Notion page (campaign) object
 */
async function processCampaign(campaignPage) {
    try {
        // Extract information from the campaign page.
        // Ensure that the property names match exactly those in your Campaigns database.
        const campaignTitleProperty = campaignPage.properties['Campaign Name'];
        const campaignName = campaignTitleProperty?.title?.[0]?.plain_text || 'Unnamed Campaign';
        console.log(`Processing campaign: ${campaignName}`);
        // Define subsequent events (this is an example—customize as needed).
        const subsequentEvents = [
            { eventName: `${campaignName} - Kickoff`, date: '2025-02-20', eventType: 'Kickoff' },
            { eventName: `${campaignName} - Follow-Up`, date: '2025-03-05', eventType: 'Follow-Up' },
        ];
        // Create each event in the Campaign Events database.
        for (const event of subsequentEvents) {
            const createResponse = await notion.pages.create({
                parent: { database_id: campaignEventsDbId },
                properties: {
                    'Event Name': {
                        title: [
                            {
                                text: { content: event.eventName },
                            },
                        ],
                    },
                    'Date': {
                        date: {
                            start: event.date,
                        },
                    },
                    'Event Type': {
                        select: {
                            name: event.eventType,
                        },
                    },
                    'Related Campaign': {
                        relation: [
                            {
                                id: campaignPage.id,
                            },
                        ],
                    },
                },
            });
            console.log(`Created event: ${event.eventName} with id: ${createResponse.id}`);
        }
        // Mark the campaign as processed.
        await notion.pages.update({
            page_id: campaignPage.id,
            properties: {
                'Processed': {
                    checkbox: true,
                },
            },
        });
        console.log(`Marked campaign "${campaignName}" as processed.`);
    }
    catch (error) {
        console.error('Error processing campaign:', error);
    }
}
/**
 * Poll for new campaigns and process each one.
 */
async function checkAndProcessCampaigns() {
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
exports.checkAndProcessCampaigns = checkAndProcessCampaigns;
// Schedule the job to run every 5 minutes.
// You can adjust the cron pattern as needed.
node_cron_1.default.schedule('*/5 * * * *', () => {
    checkAndProcessCampaigns().catch(error => console.error('Error in scheduled task:', error));
});
// Optionally, run the check immediately for initial testing.
checkAndProcessCampaigns();
/**
 * Serverless function handler.
 * This endpoint will run when triggered and return a simple JSON response.
 */
async function handler(req, res) {
    try {
        await checkAndProcessCampaigns();
        res.status(200).json({ message: 'Automation triggered successfully.' });
    }
    catch (error) {
        console.error('Automation encountered an error:', error);
        res.status(500).json({ message: 'Automation encountered an error.' });
    }
}
exports.default = handler;
