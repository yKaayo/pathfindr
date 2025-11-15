import Fastify from "fastify";
import cors from "@fastify/cors";
import "dotenv/config";

// Routes
import users from "./routes/userRoutes.js";
import skills from "./routes/skillRoutes.js";

const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

// Routes
fastify.register(users, { prefix: "/users" });
fastify.register(skills, { prefix: "/skill" });

try {
  await fastify.listen({ port: 3001 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
