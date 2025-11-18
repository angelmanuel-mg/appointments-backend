# Reto Técnico Back End – Agendamiento de Cita Médica

## Descripción

Aplicación backend para el agendamiento de citas médicas de asegurados en Perú y Chile.  
El flujo permite registrar una cita, almacenarla en DynamoDB con estado inicial `pending`,
procesarla en RDS según el país y preparar la integración con EventBridge para actualizar
el estado final.

### Flujo implementado

1. **API Gateway + Lambda `appointment`**
   - Endpoint **POST /appointments**: recibe la petición `{ insuredId, scheduleId, countryISO }`.
   - Guarda la cita en _DynamoDDB_ con estado `pending`.
   - Publica la información en _SNS_

2. _SNS → SQS por país_
   - Mensajes con `countryISO=PE` se enrutan a _SQS_PE_.
   - Mensajes con `countryISO=CL` se enrutan a _SQS_CL_.

3. _Lambda `appointment_pe` / `appointment_cl`_
   - Insertan la cita en _RDS MySQL_ (evita duplicados).

4. _EventBridge → SQS-last-update → Lambda `appointment`_
   - EventBridge dispara eventos de actualización de estado de citas.
   - El lambda `appointment` consume de SQS-last-update y actualiza la estado de la cita en DynamoDB.

## Endpoints

POST - https://cigne8wxl8.execute-api.us-east-1.amazonaws.com/dev/appointments
GET - https://cigne8wxl8.execute-api.us-east-1.amazonaws.com/dev/appointments/{insuredId}

POST /appointments
Content-Type: application/json
{
"insuredId": "00100",
"scheduleId": 1414,
"countryISO": "CL"
}

Response:
{
"message": "Appointment created successfully",
"data": {
"insuredId": "00100",
"scheduleId": 1414,
"countryISO": "CL",
"status": "pending",
"createdAt": "2025-11-18T06:56:08.025Z"
}
}

GET /appointments/00100
Response:
{
"insuredId": "00100",
"appointments": [
{
"countryISO": "CL",
"createdAt": "2025-11-18T06:56:08.025Z",
"insuredId": "00100",
"status": "completed",
"updatedAt": "2025-11-18T06:56:09.988Z",
"scheduleId": 1414
},
]
}

## Tecnologías usadas

- Node.js
- TypeScript
- Serverless Framework
- AWS Lambda
- API Gateway
- DynamoDB
- SNS + SQS
- RDS MySQL
- EventBridge
