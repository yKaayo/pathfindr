// Controllers
import {
  registerUser,
} from "../controllers/userController.js";

const users = async (fastify) => {
  fastify.post("/", registerUser);
};

export default users;