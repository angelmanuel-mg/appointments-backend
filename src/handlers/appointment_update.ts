/*
 * src/handlers/appointment_update.ts
 * Lambda handler for final update → DynamoDB
 *
 * Consumes messages from FinalUpdateQueue and updates the status of
 * the corresponding appointment in DynamoDB
 */

import { SQSEvent } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const ddb = new DynamoDBClient({});

/*
 * Lambda handler for SQS event from FinalUpdateQueue
 */
export const handler = async (event: SQSEvent) => {
  console.log("FinalUpdateQueue event:", JSON.stringify(event));

  try {
    for (const record of event.Records) {
      // Parse EventBridge message from SQS
      const body = JSON.parse(record.body);

      console.log("Parsed EventBridge message:", body);

      const detail = body.detail;

      // Validate required fields
      if (!detail.insuredId || !detail.scheduleId) {
        console.warn("Event missing data → skipped:", detail);
        continue;
      }

      // Update DynamoDB to set status to "completed" and updatedAt to now
      const cmd = new UpdateItemCommand({
        TableName: process.env.DYNAMO_TABLE,
        Key: {
          insuredId: { S: detail.insuredId },
          scheduleId: { N: String(detail.scheduleId) },
        },
        UpdateExpression: "SET #st = :completed, updatedAt = :now",
        ExpressionAttributeNames: {
          "#st": "status",
        },
        ExpressionAttributeValues: {
          ":completed": { S: "completed" },
          ":now": { S: new Date().toISOString() },
        },
      });

      // Update DynamoDB
      await ddb.send(cmd);
      console.log(
        `Updated DynamoDB record → insuredId=${detail.insuredId}, scheduleId=${detail.scheduleId}`
      );
    }

    return { message: "Final updates processed successfully" };
  } catch (err) {
    console.error("Error updating DynamoDB:", err);
    throw err;
  }
};
