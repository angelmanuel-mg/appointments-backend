/*
 * __tests__/snsService.test.ts
 * Unit tests for SNSService.
 */
import { SNSService } from "../services/snsService";
import { Appointment } from "../models/appointment";

describe("SNSService", () => {
  it("should publish message to SNS", async () => {
    const mockClient = {
      send: jest.fn().mockResolvedValue({ MessageId: "abc123" }),
    };
    (SNSService as any).client = mockClient;

    const appointment: Appointment = {
      insuredId: "12345",
      scheduleId: 101,
      countryISO: "PE" as const,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await SNSService.publish(appointment);

    expect(mockClient.send).toHaveBeenCalled();
  });
});
