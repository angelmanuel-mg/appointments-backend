/*
 * src/handlers/appointment_update.ts
 * Lambda handler for final update → DynamoDB
 */

import { SQSEvent } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const ddb = new DynamoDBClient({});

export const handler = async (event: SQSEvent) => {
  console.log("FinalUpdateQueue event:", JSON.stringify(event));

  try {
    for (const record of event.Records) {
      const body = JSON.parse(record.body);

      console.log("Parsed EventBridge message:", body);

      const detail = body.detail;

      if (!detail.insuredId || !detail.scheduleId) {
        console.warn("Event missing data → skipped:", detail);
        continue;
      }

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
