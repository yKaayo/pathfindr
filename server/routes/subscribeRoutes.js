// Controllers
import {
  verifySubscribe, createSubscribe
} from "../controllers/subscribeController.js";

const subscribe = async (fastify) => {
  fastify.get("/", verifySubscribe);
  fastify.post("/", createSubscribe);
};

export default subscribe;