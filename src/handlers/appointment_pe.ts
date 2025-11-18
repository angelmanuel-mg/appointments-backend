/*
 * src/handlers/appointment-pe.ts
 * Lambda handler for processing medical appointments in Peru (PE)
 *
 * Consumes messages from SQS_PE and saves them to RDS, then publishes
 * an event to EventBridge to update the final status of the appointment
 */
import { SQSEvent, Context } from "aws-lambda";
import { RDSService } from "../services/rdsService";
import { Appointment } from "../models/appointment";

import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

const eventBridge = new EventBridgeClient({
  region: process.env.AWS_REGION,
});

/*
 * Lambda handler for processing medical appointments in Peru (PE)
 */
export const handler = async (event: SQSEvent, context: Context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    for (const record of event.Records) {
      console.log("Raw SQS body: ", record.body);

      // Parse SNS envelope
      const snsEnvelope = JSON.parse(record.body);

      // Parse appointment payload
      const appointment: Appointment = JSON.parse(snsEnvelope.Message);
      console.log("Parsed appointment:", appointment);

      // Save to RDS PE
      const result = await RDSService.savePE(appointment);
      console.log("[Debug] RDSService.savePE returned:", result);

      if (result.duplicate) {
        console.log("Duplicate → skipping EventBridge publish.");
        continue;
      }

      // Publish processed event to EventBridge
      console.log("EventBridgeClient config:", eventBridge.config);
      console.log("Sending to EventBridge with:", {
        bus: process.env.EVENT_BUS_NAME,
        fullArn: `arn:aws:events:${process.env.AWS_REGION}:698928391255:event-bus/${process.env.EVENT_BUS_NAME}`,
      });
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

    return { ok: true };
  } catch (error) {
    console.error("Error processing PE appointments:", error);
    throw error;
  }
};
