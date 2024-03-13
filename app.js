const mongoose = require('mongoose');

// Connect to your MongoDB database
mongoose.connect('mongodb://localhost/logger-svc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('Connected to MongoDB!');

    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();

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
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Helper function to generate schema from a sample document
function generateSchemaFromSampleDoc(doc) {
  const schema = {};

  for (const key in doc) {
    const value = doc[key];
    let schemaType;

    if (value === null) {
      schemaType = { type: Schema.Types.Mixed, required: false };
    } else if (typeof value === 'string') {
      schemaType = { type: String };
    } else if (typeof value === 'number') {
      schemaType = { type: Number };
    } else if (typeof value === 'boolean') {
      schemaType = { type: Boolean };
    } else if (Array.isArray(value)) {
      schemaType = [generateSchemaFromSampleDoc(value[0])];
    } else if (value instanceof Date) {
      schemaType = { type: Date };
    } else {
      schemaType = generateSchemaFromSampleDoc(value);
    }

    schema[key] = schemaType;
  }

  return schema;
}