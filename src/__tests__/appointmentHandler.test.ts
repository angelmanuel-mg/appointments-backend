/*
 * src/handlers/appointmentHandler.test.ts
 * Integration tests for appointment handler.
 */
import request from "supertest";
import express from "express";
import { AppointmentsService } from "../services/appointmentsService";

jest.mock("../services/appointmentsService");

const app = express();
app.use(express.json());

app.post("/appointments", async (req, res) => {
  const service = new AppointmentsService();
  const appointment = await service.createAppointment(req.body);
  res.status(201).json(appointment);
});

app.get("/appointments/:insuredId", async (req, res) => {
  const service = new AppointmentsService();
  const appointments = await service.getAppointmentsByInsured(
    req.params.insuredId
  );
  res.status(200).json({ insuredId: req.params.insuredId, appointments });
});

describe("Appointments API", () => {
  it("POST /appointments should create appointment", async () => {
    const mockAppointment = {
      insuredId: "12345",
      scheduleId: 101,
      countryISO: "PE" as const,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    (
      AppointmentsService.prototype.createAppointment as jest.Mock
    ).mockResolvedValue(mockAppointment);

    const res = await request(app)
      .post("/appointments")
      .send({ insuredId: "12345", scheduleId: 101, countryISO: "PE" });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("pending");
  });

  it("GET /appointments/:insuredId should return appointments", async () => {
    const mockAppointments = [
      {
        insuredId: "12345",
        scheduleId: 101,
        countryISO: "PE" as const,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    (
      AppointmentsService.prototype.getAppointmentsByInsured as jest.Mock
    ).mockResolvedValue(mockAppointments);

    const res = await request(app).get("/appointments/12345");

    expect(res.status).toBe(200);
    expect(res.body.appointments).toEqual(mockAppointments);
  });
});
