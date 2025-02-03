<<<<<<< HEAD
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function testDatabase(databaseId: string) {
  try {
    const response = await notion.databases.retrieve({ database_id: databaseId });
    console.log('Database retrieved successfully:', response);
  } catch (error) {
    console.error('Error retrieving database:', error);
  }
}

// Test both databases:
testDatabase(process.env.CAMPAIGNS_DB_ID!);
testDatabase(process.env.CAMPAIGN_EVENTS_DB_ID!);
=======
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function testDatabase(databaseId: string) {
  try {
    const response = await notion.databases.retrieve({ database_id: databaseId });
    console.log('Database retrieved successfully:', response);
  } catch (error) {
    console.error('Error retrieving database:', error);
  }
}

// Test both databases:
testDatabase(process.env.CAMPAIGNS_DB_ID!);
testDatabase(process.env.CAMPAIGN_EVENTS_DB_ID!);
>>>>>>> 2784a940e3a7b6120797cfd90d5290aa6feb3567
