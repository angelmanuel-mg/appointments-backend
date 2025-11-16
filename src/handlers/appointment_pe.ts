/*
 * src/handlers/appointment-pe.ts
 * Lambda handler for processing medical appointments in Peru (PE).
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

      // Save to RDS
      await RDSService.savePE(appointment);
      console.log("Appointment saved in RDS_PE:", appointment);
    }

    // Return success message
    return { message: "Appointments processed successfully for PE" };
  } catch (error) {
    // Log error and rethrow
    console.error("Error processing PE appointments:", error);
    throw error;
  }
};
