import mongoose, { Model, Schema } from 'mongoose';
import { generateSchemaFromSampleDoc } from './utils';

async function generateSchemas(databaseUri: string) {
  try {
    await mongoose.connect(databaseUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB!');

    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(collections);

    // Loop through each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      const Model = mongoose.model(collectionName, new mongoose.Schema({}));

      // Get a sample document from the collection
      const sampleDoc = await Model.findOne();

      if (sampleDoc) {
        // Generate schema based on the sample document
        const schema = generateSchemaFromSampleDoc(sampleDoc);
        console.log(`Generated schema for ${collectionName}:`, schema);

        // You can save the schema to a file or use it in your application
      } else {
        console.log(`No documents found in ${collectionName} collection.`);
      }
    }

    mongoose.disconnect();
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

// Usage
generateSchemas('mongodb://localhost/your-database-name');