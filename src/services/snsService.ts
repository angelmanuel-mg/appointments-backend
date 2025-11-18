/*
 * src/services/snsService.ts
 * Service for publishing appointment events to AWS SNS.
 *
 * Provides methods for publishing appointment events to SNS topics
 * by countryISO
 */
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { Appointment } from "../models/appointment";

export class SNSService {
  // SNS client configured with AWS region
  private static client = new SNSClient({});

  /*
   * Publish appointment event to SNS
   *
   * Sends the appointment payload to the SNS topics
   */
  static async publish(appointment: Appointment) {
    const command = new PublishCommand({
      TopicArn: process.env.SNS_TOPIC_ARN,
      Message: JSON.stringify(appointment),
      MessageAttributes: {
        countryISO: {
          DataType: "String",
          StringValue: appointment.countryISO,
        },
      },
    });

    await this.client.send(command);
    console.log(
      `Published appointment to SNS with countryISO=${appointment.countryISO}`
    );
  }
}
