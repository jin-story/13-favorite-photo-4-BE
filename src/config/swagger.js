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
    paths: {
      "/": {
        get: {
          tags: ["System"],
          summary: "API 서버 확인",
          description: "API 서버의 기본 응답을 조회합니다.",
          responses: {
            200: {
              description: "API 서버 응답 성공",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["message"],
                    properties: {
                      message: {
                        type: "string",
                        const: "Favorite Photo API Server",
                      },
                    },
                  },
                  example: {
                    message: "Favorite Photo API Server",
                  },
                },
              },
            },
          },
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
