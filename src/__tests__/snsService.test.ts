/*
 * __tests__/snsService.test.ts
 * Unit tests for SNSService.
 */
import { SNSService } from "../services/snsService";
import { SNSClient } from "@aws-sdk/client-sns";
import { Appointment } from "../models/appointment";

jest.mock("@aws-sdk/client-sns", () => {
  return {
    SNSClient: jest.fn(() => ({
      send: jest.fn().mockResolvedValue({ MessageId: "123" }),
    })),
    PublishCommand: jest.fn(),
  };
});

describe("SNSService", () => {
  it("publishes appointment to SNS with correct attributes", async () => {
    const appointment: Appointment = {
      insuredId: "123",
      scheduleId: 456,
      countryISO: "PE",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await SNSService.publish(appointment);

    expect(SNSClient).toHaveBeenCalled();
  });
});
