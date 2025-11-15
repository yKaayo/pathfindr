// Controllers
import {
  extractSkills,
} from "../controllers/skillController.js";

const skill = async (fastify) => {
  fastify.post("/", extractSkills);
};

export default skill;