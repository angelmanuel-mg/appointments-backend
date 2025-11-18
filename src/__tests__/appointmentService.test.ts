/*
 * __tests__/appointmentsService.test.ts
 * Unit tests for AppointmentsService.
 */

import { AppointmentsService } from "../services/appointmentsService";
import { DynamoRepository } from "../repositories/dynamoRepository";
import { SNSService } from "../services/snsService";

jest.mock("../repositories/dynamoRepository");
jest.mock("../services/snsService");

describe("AppointmentsService", () => {
  const service = new AppointmentsService();

  it("should create a new appointment with status pending", async () => {
    const input = {
      insuredId: "12345",
      scheduleId: 101,
      countryISO: "PE" as const,
    };
    const result = await service.createAppointment(input);

    expect(result.status).toBe("pending");
    expect(DynamoRepository.prototype.save).toHaveBeenCalledWith(result);
    expect(SNSService.publish).toHaveBeenCalledWith(result);
  });

  it("should get appointments by insuredId", async () => {
    const mockAppointments = [
      {
        insuredId: "12345",
        scheduleId: 101,
        countryISO: "PE",
        status: "pending",
      },
    ];
    (DynamoRepository.prototype.getByInsured as jest.Mock).mockResolvedValue(
      mockAppointments
    );

    const result = await service.getAppointmentsByInsured("12345");
    expect(result).toEqual(mockAppointments);
  });
});
