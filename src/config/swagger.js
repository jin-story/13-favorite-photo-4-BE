import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "최애의 포토 API",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
      },
    ],
    components: {
      securitySchemes: {
        refreshTokenCookie: {
          type: "apiKey",
          in: "cookie",
          name: "refreshToken",
        },
      },
    },
  },
  apis: ["./src/modules/**/*.route.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
export default swaggerSpec;
