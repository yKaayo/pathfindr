// Controllers
import {
  careerHandler,
} from "../controllers/careerController.js";

const career = async (fastify) => {
  fastify.post("/", careerHandler);
};

export default career;