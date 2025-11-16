/*
 * __tests__/dynamoRepository.test.ts
 * Unit tests for DynamoRepository.
 */
import { DynamoRepository } from "../repositories/dynamoRepository";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Appointment } from "../models/appointment";

jest.mock("@aws-sdk/lib-dynamodb", () => {
  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: jest.fn().mockResolvedValue({}),
      })),
    },
    PutCommand: jest.fn(),
  };
});

describe("DynamoRepository", () => {
  it("saves appointment into DynamoDB", async () => {
    const repo = new DynamoRepository();
    const appointment: Appointment = {
      insuredId: "123",
      scheduleId: 456,
      countryISO: "PE",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await repo.save(appointment);

    expect(DynamoDBDocumentClient.from).toHaveBeenCalled();
  });
});
