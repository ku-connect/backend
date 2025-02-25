import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";

const options = {
  failOnErrors: true,
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KU Connect API",
      version: "1.0.0",
      description: "API documentation for KU Connect",
    },
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // Optional, for better readability in Swagger UI
        },
      },
    },
    security: [
      {
        bearerAuth: [], // Apply this globally to all endpoints
      },
    ],
    tags: [
      { name: "Profile", description: "Profile APIs" },
      { name: "Settings", description: "Settings APIs" },
      { name: "Interactions", description: "Interactions APIs" },
      { name: "Notification", description: "Notification APIs" },
      { name: "Chat", description: "Chat APIs" },
    ],
  },
  apis: ["./src/**/*.ts"], // Path to your API route files
};

const swaggerSpec = swaggerJSDoc(options);

console.log(swaggerSpec);

export function swaggerDocs(app: Express, port: string) {
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`Swagger docs available at http://localhost:${port}/swagger`);
}
