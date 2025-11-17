/* src/handlers/appointment-pe.ts * Lambda handler for processing medical appointments in Peru (PE). */
import { SQSEvent } from "aws-lambda";
import { RDSService } from "../services/rdsService";
import { Appointment } from "../models/appointment";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
const eventBridge = new EventBridgeClient({});
export const handler = async (event: SQSEvent) => {
  try {
    for (const record of event.Records) {
      // Raw SNS in SQS body
      console.log("Raw SQS body: ", record.body);
      // Parse SNS wrapper
      const snsEnvelope = JSON.parse(record.body);
      // Parse appointment from SQS message
      const appointment: Appointment = JSON.parse(snsEnvelope.Message);
      // Add status and createdAt
      appointment.status = "pending";
      appointment.createdAt = new Date().toISOString();
      console.log("Parsed appointment:", appointment);
      console.log("[Debug] Callling RDSService.savePE");
      // Save to RDS
      const inserted = await RDSService.savePE(appointment);
      console.log("[Debug] RDSService.savePE returned:", inserted);
      if (inserted) {
        console.log("Appointment saved in RDS_PE:", appointment);
      } else {
        console.log("Appointment already exists in RDS_PE:", appointment);
      }
      const eventResult = await eventBridge.send(
        new PutEventsCommand({
          Entries: [
            {
              Source: "appointments.pe",
              DetailType: "appointment.processed",
              EventBusName: process.env.EVENT_BUS_NAME,
              Detail: JSON.stringify({
                insuredId: appointment.insuredId,
                scheduleId: appointment.scheduleId,
                countryISO: appointment.countryISO,
                status: "completed",
                processedAt: new Date().toISOString(),
              }),
            },
          ],
        })
      );
      const entry = eventResult.Entries?.[0];
      if (entry?.EventId) {
        console.info("EventBridge publish OK", { eventId: entry.EventId });
      } else {
        console.warn("EventBridge publish failed", { entry });
      }
    }
    // Return success message
    return { message: "Appointments processed successfully for PE" };
  } catch (error) {
    // Log error and rethrow
    console.error("Error processing PE appointments:", error);
  }
};
