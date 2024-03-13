import { Schema, SchemaDefinitionProperty } from 'mongoose';

// Helper function to generate schema from a sample document
export function generateSchemaFromSampleDoc(doc: any): SchemaDefinitionProperty {
  const schema: SchemaDefinitionProperty = {};

  for (const key in doc) {
    const value = doc[key];
    let schemaType: SchemaDefinitionProperty;

    if (value === null) {
      schemaType = { type: Schema.Types.Mixed, required: false };
    } else if (typeof value === 'string') {
      schemaType = { type: String };
    } else if (typeof value === 'number') {
      schemaType = { type: Number };
    } else if (typeof value === 'boolean') {
      schemaType = { type: Boolean };
    } else if (Array.isArray(value)) {
      const arrayType = generateSchemaFromSampleDoc(value[0]);
      schemaType = [arrayType];
    } else if (value instanceof Date) {
      schemaType = { type: Date };
    } else if (typeof value === 'object' && value !== null) {
      schemaType = generateSchemaFromSampleDoc(value);
    } else {
      console.warn(`Unsupported data type for key ${key} in document: ${typeof value}`);
      schemaType = { type: Schema.Types.Mixed };
    }

    schema[key] = schemaType;
  }

  return schema;
}