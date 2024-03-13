import mongoose, { Model, Schema } from 'mongoose';
import { generateSchemaFromSampleDoc, generateSchemaFile } from './utils';
import fs from 'fs';
import path from 'path';

async function generateSchemas(databaseUri: string, outputDir: string) {
  try {
    await mongoose.connect(databaseUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB!');

    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

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

        // Generate the schema file
        const schemaFilePath = path.join(outputDir, `${collectionName}.schema.ts`);
        generateSchemaFile(collectionName, schema, schemaFilePath);
        console.log(`Generated schema file: ${schemaFilePath}`);
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
generateSchemas('mongodb://localhost/logs', './schemas');