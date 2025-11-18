/*
 * src/utils/validation.ts
 * Utility functions for validating appointment input data
 */

import { AppointmentInput } from "../models/appointment";

/*
 * Validate AppointmentInput payload
 * Ensures that insuredId, scheduleId, and countryISO meet required constraints.
 * Throws an Error if validation fails.
 */
export function validateAppointmentInput(
  input: any
): asserts input is AppointmentInput {
  if (!input) throw new Error("Input is required");

  // insuredId: must exist, be a string, and exactly 5 digits
  if (!input.insuredId) throw new Error("insuredId is required");

  if (typeof input.insuredId !== "string")
    throw new Error("insuredId must be a string");

  if (!/^\d{5}$/.test(input.insuredId))
    throw new Error("insuredId must be a 5 digit number");

  // scheduleId: must exist and be a positive integer
  if (input.scheduleId === undefined || input.scheduleId === null)
    throw new Error("scheduleId is required");

  if (typeof input.scheduleId !== "number")
    throw new Error("scheduleId must be a number");

  // countryISO: must exist and be either "PE" or "CL"
  if (!input.countryISO) throw new Error("countryISO is required");

  if (!["PE", "CL"].includes(input.countryISO)) {
    throw new Error("countryISO must be PE or CL");
  }
}
