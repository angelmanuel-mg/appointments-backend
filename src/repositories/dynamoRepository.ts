/*
 * src/repositories/dynamoRepository.ts
 * Repository class for interaction with DynamoDB
 *
 * Provides methods for saving, retrieving, and updating appointments in
 * DynamoDB table
 */

import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../config/awsConfig";
import { Appointment } from "../models/appointment";

export class DynamoRepository {
  /* DynamoDB table name (from env or default). */
  private tableName = process.env.DYNAMO_TABLE || "AppointmentsTable";

  /*
   * Save a new appointment
   *
   * Inserts a new appointment record into DynamoDB
   * Fails if an appointment with the same insuredId and scheduleId already exists
   */
  async save(appointment: Appointment): Promise<void> {
    try {
      await dynamo.send(
        new PutCommand({
          TableName: this.tableName,
          Item: appointment,
          ConditionExpression:
            "attribute_not_exists(insuredId) AND attribute_not_exists(scheduleId)",
        })
      );
    } catch (error) {
      console.error("Error saving to DynamoDB:", error);
      throw error;
    }
  }

  /*
   * Get all appointments by insuredId
   *
   * Retrieves all appointments with the specified insuredId
   */
  async getByInsured(insuredId: string): Promise<Appointment[]> {
    try {
      const result = await dynamo.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: "insuredId = :insuredId",
          ExpressionAttributeValues: {
            ":insuredId": insuredId,
          },
        })
      );
      return result.Items?.map((item) => item as Appointment) ?? [];
    } catch (error) {
      console.error("Error getting from DynamoDB:", error);
      throw error;
    }
  }

  /*
   * Update appointment status
   *
   * Updates the status of an appointment of an existing appointment
   * Require that the appointment exists in DynamoDB
   */
  async updateStatus(
    insuredId: string,
    scheduleId: number,
    status: string,
    updatedAt: string
  ): Promise<void> {
    try {
      await dynamo.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: {
            insuredId,
            scheduleId,
          },
          UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
          ExpressionAttributeNames: { "#status": "status" },
          ConditionExpression:
            "attribute_exists(insuredId) AND attribute_exists(scheduleId)",
          ExpressionAttributeValues: {
            ":status": status,
            ":updatedAt": updatedAt,
          },
        })
      );
    } catch (error) {
      console.log("Error updating DynamoDB:", error);
      throw error;
    }
  }
}
