/*
 * src/models/appointment.ts
 * Data models for medical appointment scheduling
 */

/*
 * Input payload received from client (POST /appointments)
 */
export interface AppointmentInput {
  insuredId: string;
  scheduleId: number;
  countryISO: "PE" | "CL";
}

/*
 * Full appointment entity stored in DynamoDB and RDS
 */
export interface Appointment {
  insuredId: string;
  scheduleId: number;
  countryISO: "PE" | "CL";
  status: "pending" | "completed";

  createdAt: string;
  updatedAt?: string;
}
