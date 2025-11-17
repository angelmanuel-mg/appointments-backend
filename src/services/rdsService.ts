/*
 * src/services/rdsService.ts
 * Service for persisting appointments into RDS (MySQL).
 */
import mysql from "mysql2/promise";
import { Appointment } from "../models/appointment";

export class RDSService {
  // MySQL connection
  private static pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
  });

  /*
   * Save a new PE appointment
   */
  static async savePE(appointment: Appointment) {
    const createdAt = new Date().toISOString();
    const status = "pending";
    try {
      await this.pool.execute(
        `INSERT INTO appointment_pe
      (insuredId, scheduleId, countryISO, status, createdAt)
      VALUES (?, ?, ?, ?, ?)`,
        [
          appointment.insuredId,
          appointment.scheduleId,
          appointment.countryISO,
          status,
          createdAt,
        ]
      );
      return true;
    } catch (error: any) {
      console.error("[Error] savePE failed:", error);
      if (error.code === "ER_DUP_ENTRY") {
        console.warn(
          `Duplicate detected → insuredId=${appointment.insuredId}, scheduleId=${appointment.scheduleId}`
        );
        return false;
      }
      throw error;
    }
  }

  /*
   * Save a new CL appointment
   */
  static async saveCL(appointment: Appointment) {
    const createdAt = new Date().toISOString();
    const status = "pending";

    try {
      await this.pool.execute(
        `INSERT INTO appointment_cl
      (insuredId, scheduleId, countryISO, status, createdAt)
      VALUES (?, ?, ?, ?, ?)`,
        [
          appointment.insuredId,
          appointment.scheduleId,
          appointment.countryISO,
          status,
          createdAt,
        ]
      );
      return true;
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        console.warn(
          `Duplicate detected → insuredId=${appointment.insuredId}, scheduleId=${appointment.scheduleId}`
        );
        return false;
      }
      throw error;
    }
  }
}
