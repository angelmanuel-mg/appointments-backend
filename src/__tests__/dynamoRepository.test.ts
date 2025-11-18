/*
 * __tests__/dynamoRepository.test.ts
 * Unit tests for DynamoRepository.
 */
import { DynamoRepository } from "../repositories/dynamoRepository";
import { Appointment } from "../models/appointment";

jest.mock("../config/awsConfig", () => {
  return {
    dynamo: {
      send: jest.fn(),
    },
  };
});

import { dynamo } from "../config/awsConfig";

describe("DynamoRepository", () => {
  let repo: DynamoRepository;
  let sendMock: jest.Mock;

  beforeEach(() => {
    sendMock = dynamo.send as jest.Mock;
    sendMock.mockReset();
    repo = new DynamoRepository();
  });

  it("should save appointment correctly", async () => {
    const appointment: Appointment = {
      insuredId: "12345",
      scheduleId: 101,
      countryISO: "PE",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    sendMock.mockResolvedValue({}); // Dynamo responde OK

    await repo.save(appointment);

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0]).toHaveProperty("input.TableName");
  });

  it("should get appointments by insuredId", async () => {
    sendMock.mockResolvedValue({
      Items: [
        {
          insuredId: "12345",
          scheduleId: 101,
          countryISO: "PE",
          status: "pending",
        },
      ],
    });

    const result = await repo.getByInsured("12345");

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].insuredId).toBe("12345");
  });

  it("should update appointment status", async () => {
    sendMock.mockResolvedValue({});

    await repo.updateStatus(
      "12345",
      101,
      "completed",
      new Date().toISOString()
    );

    expect(sendMock).toHaveBeenCalledTimes(1);
  });
});
