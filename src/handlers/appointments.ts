/*
 * src/handlers/appointments.ts
 * Lambda handler for POST and GET /appointments endpoints
 */

import { APIGatewayProxyHandler } from "aws-lambda";
import { AppointmentsService } from "../services/appointmentsService";
import { validateAppointmentInput } from "../utils/validation";
import AWS from "@aws-sdk/client-sns";

const sns = new AWS.SNS();

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
      try {
        // Save in DynamoDB
        const created = await service.createAppointment(body);

        // Publish to SNS
        await sns.publish({
          TopicArn: process.env.SNS_TOPIC_ARN,
          Message: JSON.stringify(body),
          MessageAttributes: {
            countryISO: {
              DataType: "String",
              StringValue: body.countryISO,
            },
          },
        });

        return {
          statusCode: 201,
          body: JSON.stringify({
            message: "Appointment created successfully",
            data: created,
          }),
        };
      } catch (error: any) {
        throw error;
      }
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

      const appointments =
        await new AppointmentsService().getAppointmentsByInsured(insuredId);

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
