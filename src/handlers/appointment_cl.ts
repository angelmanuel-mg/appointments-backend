/*
 * src/handlers/appointment-cl.ts
 * Lambda handler for processing medical appointments in Chile (CL).
 */

import { SQSEvent } from "aws-lambda";
import { RDSService } from "../services/rdsService";
import { Appointment } from "../models/appointment";

export const handler = async (event: SQSEvent) => {
  try {
    for (const record of event.Records) {
      // Parse appointment from SQS message
      const appointment: Appointment = JSON.parse(record.body);
      appointment.status = "pending";
      appointment.createdAt = new Date().toISOString();

      // Save to RDS (Chile)
      await RDSService.saveCL(appointment);
      console.log("Appointment saved in RDS_CL:", appointment);
    }

    // Return success message
    return { message: "Appointments processed successfully for CL" };
  } catch (error) {
    // Log error and rethrow
    console.error("Error processing CL appointments:", error);
    throw error;
  }
};
