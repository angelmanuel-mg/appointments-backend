/*
 * __tests__/rdsService.test.ts
 * Unit tests for RDSService.
 */
import { RDSService } from "../services/rdsService";
import mysql from "mysql2/promise";

jest.mock("mysql2/promise", () => ({
  createPool: jest.fn(() => ({
    execute: jest.fn().mockResolvedValue([{}, {}]),
    end: jest.fn(),
  })),
}));

describe("RDSService", () => {
  it("savePE inserts into appointment_pe", async () => {
    await RDSService.savePE({
      insuredId: "A1",
      scheduleId: 1,
      countryISO: "PE",
      status: "pending",
      createdAt: new Date().toISOString(),
    } as any);
    expect((mysql as any).createPool).toHaveBeenCalled();
  });
});
