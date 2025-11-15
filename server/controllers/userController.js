// Model
import { findUser, createUser } from "../models/userModel.js";

// Utils
import { hashPassword, comparePassword } from "../utils/bcrypt.js";

export const registerUser = async (req, rep) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return rep.status(400).send({ success: false, error: "Dados incompletos" });
  }

  const verifyUser = await findUser(email);

  if (verifyUser)
    return rep
      .status(400)
      .send({ success: false, error: "Já existe uma conta com esse email" });

  const hashedPassword = hashPassword(password);

  const user = await createUser(name, email, hashedPassword);

  if (!user)
    return rep
      .status(500)
      .send({ success: false, error: "Erro ao criar a conta" });

  return rep.status(201).send({ success: true, data: user });
};
