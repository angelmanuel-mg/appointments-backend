/*
 * src/config/awsConfig.ts
 * AWS DynamoDB client configuration
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/*
 * Create a DynamoDB client
 */
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

/*
 * Export DocumentClient
 */
export const dynamo = DynamoDBDocumentClient.from(client);
