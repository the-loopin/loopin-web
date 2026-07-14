import fs from 'fs';
import path from 'path';

const schemaUrl = process.env.OPENAPI_SCHEMA_URL || 'http://localhost:8080/api/v3/api-docs';

console.log(`Fetching OpenAPI schema from: ${schemaUrl}...`);

try {
  const response = await fetch(schemaUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON received from schema URL');
  }

  if (!json.openapi && !json.swagger) {
    throw new Error('Fetched document does not appear to be a valid OpenAPI spec (missing openapi/swagger version)');
  }

  const outputDir = path.resolve('contracts');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(json, null, 2), 'utf-8');
  console.log(`Successfully saved OpenAPI schema to ${outputPath}`);
} catch (error) {
  console.error(`Failed to update OpenAPI schema: ${error.message}`);
  process.exit(1);
}
