"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@notionhq/client");
dotenv_1.default.config();
const notion = new client_1.Client({ auth: process.env.NOTION_API_KEY });
async function testDatabase(databaseId) {
    try {
        const response = await notion.databases.retrieve({ database_id: databaseId });
        console.log('Database retrieved successfully:', response);
    }
    catch (error) {
        console.error('Error retrieving database:', error);
    }
}
// Test both databases:
testDatabase(process.env.CAMPAIGNS_DB_ID);
testDatabase(process.env.CAMPAIGN_EVENTS_DB_ID);
