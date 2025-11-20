import Fastify from "fastify";
import cors from "@fastify/cors";
import "dotenv/config";
import multipart from "@fastify/multipart";

// MongoDB
import { connect } from "./config/mongo.js";

// Routes
import users from "./routes/userRoutes.js";
import skills from "./routes/skillRoutes.js";
import career from "./routes/careerRoutes.js";

const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

fastify.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

connect();

// Routes
fastify.register(users, { prefix: "/users" });
fastify.register(skills, { prefix: "/skill" });
fastify.register(career, { prefix: "/career" });

try {
  await fastify.listen({ port: 3001 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
