/*
 * __tests__/appointmentsService.test.ts
 * Unit tests for AppointmentsService.
 */

import { AppointmentsService } from "../services/appointmentsService";
import { DynamoRepository } from "../repositories/dynamoRepository";
import { SNSService } from "../services/snsService";
import { AppointmentInput } from "../models/appointment";

jest.mock("../repositories/dynamoRepository");
jest.mock("../services/snsService");

describe("AppointmentsService", () => {
  it("creates appointment, saves to Dynamo, and publishes to SNS", async () => {
    const service = new AppointmentsService();
    const input: AppointmentInput = {
      insuredId: "123",
      scheduleId: 456,
      countryISO: "PE",
    };
    const result = await service.createAppointment(input);

    expect(result.status).toBe("pending");
    expect(DynamoRepository.prototype.save).toHaveBeenCalledWith(result);
    expect(SNSService.publish).toHaveBeenCalledWith(result);
  });
});
