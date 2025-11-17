# Reto Técnico Back End – Agendamiento de Cita Médica

## Descripción

Aplicación backend para el agendamiento de citas médicas de asegurados en Perú y Chile.  
El flujo permite registrar una cita, almacenarla en DynamoDB con estado inicial `pending`,
procesarla en RDS según el país y preparar la integración con EventBridge para actualizar
el estado final.

### Flujo implementado

1. **API Gateway + Lambda `appointment`**
   - Endpoint **POST /appointments**: recibe la petición `{ insuredId, scheduleId, countryISO }`.
   - Guarda la cita en _DynamoDB_ con estado `pending`.
   - Publica la información en _SNS_

2. _SNS → SQS por país_
   - Mensajes con `countryISO=PE` se enrutan a _SQS_PE_.
   - Mensajes con `countryISO=CL` se enrutan a _SQS_CL_.

3. _Lambda `appointment_pe` / `appointment_cl`_
   - Insertan la cita en _RDS MySQL_ (evita duplicados).

// 4. \*EventBridge → SQS-last-update → Lambda `appointment`\*\*

## Endpoints

POST - https://cigne8wxl8.execute-api.us-east-1.amazonaws.com/dev/appointments
GET - https://cigne8wxl8.execute-api.us-east-1.amazonaws.com/dev/appointments/{insuredId}

## Tecnologías usadas

- AWS Lambda (Node.js + TypeScript, framework Serverless)
- API Gateway
- DynamoDB
- SNS + SQS
- RDS MySQL
  // EventBridge \*(pending)
