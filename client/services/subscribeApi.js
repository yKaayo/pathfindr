import axios from "axios";

export async function verifySubscribe(email) {
  if (!email) throw new Error("email é obrigatório");

  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe`,
      {
        params: { email },
      },
    );
    return res.data;
  } catch (err) {
    console.error("verifySubscribe error:", err);
    throw err.response?.data || new Error("Erro ao verificar assinatura");
  }
}

export async function createSubscribe({ name, email, password }) {
  if (!email || !password) throw new Error("email e password são obrigatórios");
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe`,
      {
        name,
        email,
        password,
      },
    );
    return res.data;
  } catch (err) {
    console.error("createSubscribe error:", err);
    throw err.response?.data || new Error("Erro ao criar assinatura");
  }
}
