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
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@notionhq/client");
dotenv_1.default.config();
const notion = new client_1.Client({ auth: process.env.NOTION_API_KEY });
function testDatabase(databaseId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield notion.databases.retrieve({ database_id: databaseId });
            console.log('Database retrieved successfully:', response);
        }
        catch (error) {
            console.error('Error retrieving database:', error);
        }
    });
}
// Test both databases:
testDatabase(process.env.CAMPAIGNS_DB_ID);
testDatabase(process.env.CAMPAIGN_EVENTS_DB_ID);
