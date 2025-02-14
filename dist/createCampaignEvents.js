"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// createCampaignEvents.ts
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@notionhq/client");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
// Load environment variables from your .env file
dotenv_1.default.config();
// Initialize dayjs with timezone plugins
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
// Initialize Notion client with your API key
const notion = new client_1.Client({ auth: process.env.NOTION_API_KEY });
// Define the EVENT_CONFIG array
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
// The main function to create campaign events
function createCampaignEvents(campaignPageId) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // Retrieve the campaign page from Notion
        const campaignPage = yield notion.pages.retrieve({
            page_id: campaignPageId,
        });
        // Extract campaign details.
        // Change property names to match exactly your database configuration.
        const campaignName = (_a = campaignPage.properties['Campaign Name'].title[0]) === null || _a === void 0 ? void 0 : _a.plain_text;
        const campaignLaunchDate = campaignPage.properties['Launch Date'].date.start;
        const campaignType = campaignPage.properties['Campaign Type'].select.name;
        const personInCharge = campaignPage.properties['Person in Charge'].people;
        // Convert the launch date to a dayjs object with timezone 'America/New_York'
        const launchDate = (0, dayjs_1.default)(campaignLaunchDate).tz('America/New_York');
        // Filter events applicable to this campaign based on campaign type.
        const applicableEvents = EVENT_CONFIG.filter(config => config.applicableTypes.includes('*') || config.applicableTypes.includes(campaignType));
        // Loop through each applicable event and create a page in the Campaign Events database
        for (const config of applicableEvents) {
            const eventDate = launchDate.add(config.daysOffset, 'day').format();
            const eventName = `${campaignName} - ${config.eventType}`;
            yield notion.pages.create({
                parent: { database_id: process.env.CAMPAIGN_EVENTS_DB_ID },
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
    });
}
// A simple main function to test the automation flow
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Replace this with your test campaign page ID from the Campaigns database
        const testCampaignPageId = '1234567890abcdef1234567890abcdef';
        yield createCampaignEvents(testCampaignPageId);
    });
}
// Call the main function and handle errors
main().catch(error => {
    console.error('Error creating campaign events:', error);
});
