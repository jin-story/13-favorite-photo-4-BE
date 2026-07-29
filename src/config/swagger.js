import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "최애의 포토 API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        refreshTokenCookie: {
          type: "apiKey",
          in: "cookie",
          name: "refreshToken",
        },
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
      },
    ],
  },
  apis: ["./src/modules/**/*.route.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
export default swaggerSpec;
