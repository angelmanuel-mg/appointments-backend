/*
 * src/services/rdsService.ts
 * Service for persisting appointments into RDS (MySQL).
 *
 * Provides methods for saving, retrieving, and updating appointments in
 * RDS table
 */
import mysql from "mysql2/promise";
import { Appointment } from "../models/appointment";

export class RDSService {
  /*
   * Save a new PE appointment
   *
   * Inserts a new PE appointment record into the `appointment_pe` table
   */
  static async savePE(
    a: Appointment
  ): Promise<{ success: boolean; duplicate: boolean }> {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    try {
      await conn.execute(
        `INSERT INTO appointment_pe
        (insuredId, scheduleId, countryISO, status, createdAt)
        VALUES (?, ?, ?, ?, ?)`,
        [
          a.insuredId,
          a.scheduleId,
          a.countryISO,
          "pending",
          new Date().toISOString(),
        ]
      );

      return { success: true, duplicate: false };
    } catch (err: any) {
      if (err.code === "ER_DUP_ENTRY") {
        console.warn("Duplicate →", a.insuredId, a.scheduleId);
        return { success: true, duplicate: true };
      }

      throw err;
    } finally {
      await conn.end();
    }
  }

  /*
   * Save a new CL appointment
   *
   * Inserts a new CL appointment record into the `appointment_cl` table
   */
  static async saveCL(
    a: Appointment
  ): Promise<{ success: boolean; duplicate: boolean }> {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    try {
      await conn.execute(
        `INSERT INTO appointment_cl
       (insuredId, scheduleId, countryISO, status, createdAt)
       VALUES (?, ?, ?, ?, ?)`,
        [
          a.insuredId,
          a.scheduleId,
          a.countryISO,
          "pending",
          new Date().toISOString(),
        ]
      );

      return { success: true, duplicate: false };
    } catch (err: any) {
      if (err.code === "ER_DUP_ENTRY") {
        console.warn("Duplicate →", a.insuredId, a.scheduleId);
        return { success: true, duplicate: true };
      }

      throw err;
    } finally {
      await conn.end();
    }
  }
}
