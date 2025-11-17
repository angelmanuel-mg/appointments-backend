/*
 * src/handlers/appointment-cl.ts
 * Lambda handler for processing medical appointments in Chile (CL).
 */

import { SQSEvent } from "aws-lambda";
import { RDSService } from "../services/rdsService";
import { Appointment } from "../models/appointment";

import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

const eventBridge = new EventBridgeClient({ region: process.env.AWS_REGION });

export const handler = async (event: SQSEvent) => {
  try {
    for (const record of event.Records) {
      console.log("Raw SQS body:", record.body);

      const snsEnvelope = JSON.parse(record.body);
      const appointment: Appointment = JSON.parse(snsEnvelope.Message);

      appointment.status = "pending";
      appointment.createdAt = new Date().toISOString();

      console.log("Parsed appointment (CL):", appointment);

      const inserted = await RDSService.saveCL(appointment);

      if (inserted) {
        console.log("Appointment saved in RDS_CL:", appointment);
      } else {
        console.log("Appointment already exists in RDS_CL:", appointment);
      }

      const eventResult = await eventBridge.send(
        new PutEventsCommand({
          Entries: [
            {
              Source: "appointments.cl",
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
        throw new Error("PutEvents failed");
      }
    }

    return { message: "Appointments processed successfully for CL" };
  } catch (error) {
    console.error("Error processing CL appointments:", error);
    throw error;
  }
};
