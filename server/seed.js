require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri || uri === 'your_mongodb_connection_string_here') {
    console.error('❌ Error: MONGODB_URI not configured in .env file');
    console.log('\nPlease:');
    console.log('1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas');
    console.log('2. Create a cluster and get your connection string');
    console.log('3. Update the MONGODB_URI in .env file');
    process.exit(1);
  }

  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('alhuda-maintenance');
    console.log('✅ Connected successfully!');
    
    // Read existing database.json
    const dbFile = path.join(__dirname, 'database.json');
    const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    
    // Clear existing collections
    console.log('\n🗑️  Clearing existing collections...');
    await db.collection('admins').deleteMany({});
    await db.collection('workers').deleteMany({});
    await db.collection('requests').deleteMany({});
    
    // Seed admins
    if (data.admins && data.admins.length > 0) {
      console.log(`\n👥 Seeding ${data.admins.length} admins...`);
      await db.collection('admins').insertMany(data.admins);
      console.log('✅ Admins seeded');
    }
    
    // Seed workers
    if (data.workers && data.workers.length > 0) {
      console.log(`\n👷 Seeding ${data.workers.length} workers...`);
      await db.collection('workers').insertMany(data.workers);
      console.log('✅ Workers seeded');
    }
    
    // Seed requests
    if (data.requests && data.requests.length > 0) {
      console.log(`\n📋 Seeding ${data.requests.length} requests...`);
      await db.collection('requests').insertMany(data.requests);
      console.log('✅ Requests seeded');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Database seeded successfully!');
    console.log('='.repeat(50));
    console.log('\nCollections created:');
    console.log(`  - admins: ${data.admins.length} documents`);
    console.log(`  - workers: ${data.workers.length} documents`);
    console.log(`  - requests: ${data.requests.length} documents`);
    console.log('\nYou can now start the server with: npm start');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Connection closed');
    }
  }
}

seedDatabase();
