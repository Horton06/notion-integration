"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@notionhq/client");
dotenv_1.default.config();
const notion = new client_1.Client({ auth: process.env.NOTION_API_KEY });
const campaignsDbId = process.env.CAMPAIGNS_DB_ID;
const campaignEventsDbId = process.env.CAMPAIGN_EVENTS_DB_ID;
// ...existing code...
/**
 * API Handler for Vercel:
 * When this endpoint is invoked (by Vercel Cron Jobs or manually),
 * it triggers the processing of new campaigns.
 */
async function handler(req, res) {
    // Secure this endpoint using the CRON_SECRET.
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
    }
    catch (error) {
        console.error('Automation error:', error);
        res.status(500).json({ message: 'Error triggering automation.' });
    }
}
exports.default = handler;
function checkAndProcessCampaigns() {
    throw new Error('Function not implemented.');
}
//# sourceMappingURL=automation.js.map