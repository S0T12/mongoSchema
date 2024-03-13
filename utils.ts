import { Schema, SchemaDefinitionProperty, SchemaTypes } from 'mongoose';
import fs from 'fs';

const MAX_DEPTH = 5; // Adjust this value as needed

// Helper function to generate schema from a sample document
export function generateSchemaFromSampleDoc(doc: any, depth = 0, visited: any[] = []): SchemaDefinitionProperty {
  const schema: SchemaDefinitionProperty = {};

  // Check if the depth limit is reached or if the object has been visited before
  if (depth > MAX_DEPTH || visited.includes(doc)) {
    return { type: Schema.Types.Mixed };
  }

  visited.push(doc); // Add the current object to the visited list

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
      const arrayType = generateSchemaFromSampleDoc(value[0], depth + 1, visited);
      schemaType = [arrayType];
    } else if (value instanceof Date) {
      schemaType = { type: Date };
    } else if (typeof value === 'object' && value !== null) {
      schemaType = generateSchemaFromSampleDoc(value, depth + 1, visited);
    } else {
      console.warn(`Unsupported data type for key ${key} in document: ${typeof value}`);
      schemaType = { type: Schema.Types.Mixed };
    }

    schema[key] = schemaType;
  }

  return schema;
}

// Helper function to generate a schema file
export function generateSchemaFile(collectionName: string, schema: SchemaDefinitionProperty, filePath: string) {
  const fileContent = `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

@Schema()
export class ${collectionName} {
${Object.keys(schema)
  .map(
    (key) => `  @Prop(${JSON.stringify(schema[key])})
  ${key}: ${inferType(schema[key])};`
  )
  .join('\n\n')}
}

export const ${collectionName}Schema = SchemaFactory.createForClass(${collectionName});
`;

  fs.writeFileSync(filePath, fileContent, 'utf-8');
}

// Helper function to infer the TypeScript type from the Mongoose schema
function inferType(schemaType: SchemaDefinitionProperty): string {
  if (schemaType.type === String) {
    return 'string';
  } else if (schemaType.type === Number) {
    return 'number';
  } else if (schemaType.type === Boolean) {
    return 'boolean';
  } else if (schemaType.type === Date) {
    return 'Date';
  } else if (Array.isArray(schemaType)) {
    const arrayType = inferType(schemaType[0]);
    return `${arrayType}[]`;
  } else if (typeof schemaType === 'object' && schemaType !== null && schemaType.type) {
    const typeKey = Object.keys(SchemaTypes).find((key) => SchemaTypes[key] === schemaType.type);
    if (typeKey) {
      return typeKey;
    } else {
      return 'Record<string, any>';
    }
  } else {
    return 'any';
  }
}