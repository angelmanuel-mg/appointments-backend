/*
 * src/services/snsService.ts
 * Service for publishing appointment events to AWS SNS.
 */
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { Appointment } from "../models/appointment";

export class SNSService {
  // SNS client configured with AWS region
  private static client = new SNSClient({ region: process.env.AWS_REGION });

  /*
   * Publish appointment event to SNS
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
