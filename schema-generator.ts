import mongoose, { Model, Schema } from 'mongoose';
import { generateSchemaFromSampleDoc } from './utils';

async function generateSchemas(databaseUri: string) {
  try {
    await mongoose.connect(databaseUri, {
      serverSelectionTimeoutMS: 5000, // Timeout for server selection (5 seconds)
    });
    console.log('Connected to MongoDB!');

    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();

    // Loop through each collection
    for (const collection of collections) {
      const collectionName = collection.name;

      // Skip system collections
      if (collectionName.startsWith('system.')) {
        console.log(`Skipping system collection: ${collectionName}`);
        continue;
      }

      const Model = mongoose.model(collectionName, new mongoose.Schema({}));

      // Get the count of documents in the collection
      const count = await Model.estimatedDocumentCount();

      if (count === 0) {
        console.log(`${collectionName} collection is empty.`);
        continue;
      }

      // Get a sample document from the collection
      const sampleDoc = await Model.findOne();

      if (sampleDoc) {
        // Generate schema based on the sample document
        const schema = generateSchemaFromSampleDoc(sampleDoc);
        console.log(`Generated schema for ${collectionName}:`, schema);

        // You can save the schema to a file or use it in your application
      } else {
        console.log(`Failed to retrieve a sample document from ${collectionName} collection.`);
      }
    }

    mongoose.disconnect();
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

// Usage
generateSchemas('mongodb://localhost/your-database-name');