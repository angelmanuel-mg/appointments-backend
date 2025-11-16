/*
 * src/services/appointmentsService.ts
 * Service layer for managing medical appointments.
 */

import { AppointmentInput, Appointment } from "../models/appointment";
import { DynamoRepository } from "../repositories/dynamoRepository";
import { SNSService } from "./snsService";

export class AppointmentsService {
  private dynamo = new DynamoRepository();

  /*
   * Create a new appointment
  
   */
  async createAppointment(input: AppointmentInput): Promise<Appointment> {
    const appointment: Appointment = {
      ...input,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Save in DynamoDB
    await this.dynamo.save(appointment);

    // Publish to SNS → distributes to SQS by countryISO
    await SNSService.publish(appointment);

    return appointment;
  }

  /*
   * Get all appointments by insuredId
   */
  async getAppointmentsByInsured(insuredId: string) {
    return await this.dynamo.getByInsured(insuredId);
  }
}
