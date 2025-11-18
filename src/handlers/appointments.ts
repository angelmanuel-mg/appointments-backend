/*
 * src/handlers/appointments.ts
 * Lambda handler for POST and GET /appointments endpoints
 *
 * Handles:
 * - POST /appointments: creates a new appointment
 * - GET /appointments/{insuredId}: lists appointments by insuredId
 */

import { APIGatewayProxyHandler } from "aws-lambda";
import { AppointmentsService } from "../services/appointmentsService";
import { validateAppointmentInput } from "../utils/validation";

const service = new AppointmentsService();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // POST / Create a new appointment
    if (event.httpMethod === "POST") {
      if (!event.body) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Request body is required" }),
        };
      }

      let body: any;
      try {
        body = JSON.parse(event.body);
      } catch {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Invalid JSON format" }),
        };
      }

      validateAppointmentInput(body);

      // Create appointment (DynamoDB + SNS)
      const created = await service.createAppointment(body);

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Appointment created successfully",
          data: created,
        }),
      };
    }

    //  GET / List appointments by insuredId
    if (event.httpMethod === "GET") {
      const insuredId = event.pathParameters?.insuredId;
      if (!insuredId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "insuredId is required in path" }),
        };
      }

      const appointments = await service.getAppointmentsByInsured(insuredId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          insuredId,
          appointments,
        }),
      };
    }

    // Method not allowed
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  } catch (error: any) {
    console.error("Internal error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};
