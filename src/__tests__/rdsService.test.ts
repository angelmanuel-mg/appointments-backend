/*
 * src/services/rdsService.test.ts
 * Unit tests for RDSService.
 */
import { RDSService } from "../services/rdsService";
import mysql from "mysql2/promise";
import { Appointment } from "../models/appointment";

jest.mock("mysql2/promise");

describe("RDSService", () => {
  const mockConn = {
    execute: jest.fn(),
    end: jest.fn(),
  };

  beforeEach(() => {
    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConn);
    jest.clearAllMocks();
  });

  const appointment: Appointment = {
    insuredId: "12345",
    scheduleId: 101,
    countryISO: "PE",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("should save PE appointment successfully", async () => {
    mockConn.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await RDSService.savePE(appointment);

    expect(mysql.createConnection).toHaveBeenCalled();
    expect(mockConn.execute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO appointment_pe"),
      expect.arrayContaining([
        appointment.insuredId,
        appointment.scheduleId,
        appointment.countryISO,
      ])
    );
    expect(result).toEqual({ success: true, duplicate: false });
    expect(mockConn.end).toHaveBeenCalled();
  });

  it("should handle duplicate PE appointment", async () => {
    const duplicateError = { code: "ER_DUP_ENTRY" };
    mockConn.execute.mockRejectedValueOnce(duplicateError);

    const result = await RDSService.savePE(appointment);

    expect(result).toEqual({ success: true, duplicate: true });
    expect(mockConn.end).toHaveBeenCalled();
  });

  it("should save CL appointment successfully", async () => {
    mockConn.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await RDSService.saveCL(appointment);

    expect(mockConn.execute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO appointment_cl"),
      expect.arrayContaining([
        appointment.insuredId,
        appointment.scheduleId,
        appointment.countryISO,
      ])
    );
    expect(result).toEqual({ success: true, duplicate: false });
  });
});
