import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const campaignsDbId = process.env.CAMPAIGNS_DB_ID!;

async function testConnection() {
  try {
    // Test database access
    const response = await notion.databases.query({
      database_id: campaignsDbId,
      page_size: 1
    });
    
    console.log('Connection successful!');
    console.log('Database access verified');
    console.log(`Found ${response.results.length} entries`);
    
    // Log the properties of the first item to verify structure
    if (response.results.length > 0) {
      console.log('\nSample entry properties:');
      const page = response.results[0];
      if ('properties' in page) {
        console.log(Object.keys(page.properties));
      }
    }
  } catch (error) {
    console.error('Error connecting to Notion:', error);
  }
}

testConnection();