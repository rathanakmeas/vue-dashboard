import https from 'https';
import Geography from '../models/Geography.js';

// Create an agent that accepts self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * Sync geography data from MEF API to database
 */
export async function syncGeographyData() {
  try {
    console.log('Starting geography data sync from MEF API...');
    
    const fetch = (await import('node-fetch')).default;
    const allData = [];
    let page = 1;
    let hasMore = true;
    const pageSize = 200; // MEF API max

    while (hasMore) {
      const apiUrl = `https://data.mef.gov.kh/api/v1/public-datasets/pd_68e370856a965e00074a5e7b/json?page=${page}&page_size=${pageSize}`;
      
      console.log(`Fetching page ${page}...`);
      const response = await fetch(apiUrl, {
        agent: httpsAgent,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`MEF API returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.items && result.items.length > 0) {
        allData.push(...result.items);
        console.log(`  Loaded ${allData.length} records so far...`);
        page++;

        if (result.items.length < pageSize) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    console.log(`\nFetched ${allData.length} total records from MEF API`);
    
    // Remove duplicates based on village_code (keep first occurrence)
    console.log('Removing duplicates...');
    const seenVillageCodes = new Set();
    const uniqueData = allData.filter(item => {
      if (seenVillageCodes.has(item.village_code)) {
        return false;
      }
      seenVillageCodes.add(item.village_code);
      return true;
    });
    console.log(`  Removed ${allData.length - uniqueData.length} duplicates, ${uniqueData.length} unique records remain`);
    
    console.log('Clearing existing geography data...');
    
    // Clear existing data
    await Geography.deleteMany({});
    
    console.log('Inserting new geography data...');
    
    // Insert in batches to avoid memory issues
    const batchSize = 1000;
    let totalInserted = 0;
    
    for (let i = 0; i < uniqueData.length; i += batchSize) {
      const batch = uniqueData.slice(i, i + batchSize);
      const result = await Geography.insertMany(batch, { ordered: false });
      totalInserted += result.length;
      console.log(`  Inserted ${Math.min(i + batchSize, uniqueData.length)}/${uniqueData.length} records`);
    }

    console.log(`\n✅ Geography sync complete! ${totalInserted} records stored in database.`);
    return { success: true, count: totalInserted };
  } catch (error) {
    console.error('Error syncing geography data:', error);
    throw error;
  }
}
