import oracledb from "oracledb";

// Config
import { getConnection } from "../config/oracle.js";

// Util
import { hashPassword } from "../utils/bcrypt.js";

export async function verifySubscribe(request, reply) {
  const email = (request.query.email || "").trim().toLowerCase();
  if (!email) return reply.status(400).send({ error: "email é obrigatório" });

  let conn;
  try {
    conn = await getConnection();

    const sql = `
      SELECT u.id as user_id, u.name, u.email,
             s.id as sub_id, s.active, s.started_at, s.expires_at, s.external_id
      FROM users_pathfindr u
      LEFT JOIN users_pathfindr s ON s.user_id = u.id AND s.active = 1
      WHERE u.email = :email
    `;

    const result = await conn.execute(
      sql,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows && result.rows.length) {
      const row = result.rows[0];
      const subscribed = !!row.SUB_ID;
      const user = { id: row.USER_ID, name: row.NAME, email: row.EMAIL };
      const subscription = subscribed
        ? {
            id: row.SUB_ID,
            active: row.ACTIVE === 1,
            startedAt: row.STARTED_AT,
            expiresAt: row.EXPIRES_AT,
            externalId: row.EXTERNAL_ID,
          }
        : null;

      return reply.status(200).send({ subscribed, user, subscription });
    }

    return reply
      .status(200)
      .send({ subscribed: false, user: null, subscription: null });
  } catch (err) {
    request.log?.error?.(err);
    return reply.status(500).send({ error: "Erro ao verificar assinatura" });
  } finally {
    try {
      if (conn) await conn.close();
    } catch {}
  }
}

export async function createSubscribe(request, reply) {
  const {
    name = "",
    email = "",
    password = "",
    durationDays = null,
  } = request.body || {};
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanName = (name || "").trim();

  if (!cleanEmail || !password)
    return reply
      .status(400)
      .send({ error: "email e password são obrigatórios" });
  if (String(password).length < 8)
    return reply
      .status(400)
      .send({ error: "senha deve ter pelo menos 8 caracteres" });

  let conn;
  try {
    conn = await getConnection();
    await conn.execute("BEGIN NULL; END;");

    const checkSql = `SELECT id FROM users_pathfindr WHERE email = :email`;
    const chk = await conn.execute(
      checkSql,
      { email: cleanEmail },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    let userId;
    if (chk.rows && chk.rows.length) {
      userId = chk.rows[0].ID;
    } else {
      const passwordHash = await hashPassword(password);

      const insertUserSql = `
        INSERT INTO users_pathfindr (id, name, email, password_hash, created_at)
        VALUES (seq_users_id_pathfindr.NEXTVAL, :name, :email, :password_hash, SYSTIMESTAMP)
        RETURNING id INTO :out_id
      `;
      const userBinds = {
        name: cleanName,
        email: cleanEmail,
        password_hash: passwordHash,
        out_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      };

      const userRes = await conn.execute(insertUserSql, userBinds, {
        autoCommit: false,
      });
      userId = userRes.outBinds.out_id[0];
    }

    let expiresBind = null;
    let expiresClause = "NULL";
    if (durationDays && Number(durationDays) > 0) {
      expiresClause = "SYSTIMESTAMP + NUMTODSINTERVAL(:durationDays, 'DAY')";
      expiresBind = { durationDays: Number(durationDays) };
    }

    const insertSubSql = `
      INSERT INTO subscriptions_pathfindr (id, user_id, active, started_at, expires_at, created_at)
      VALUES (seq_subscriptions_id_pathfindr.NEXTVAL, :user_id, 1, SYSTIMESTAMP, ${expiresClause}, SYSTIMESTAMP)
      RETURNING id INTO :out_sub_id
    `;

    const subBinds = {
      user_id: userId,
      out_sub_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      ...(expiresBind || {}),
    };

    const subRes = await conn.execute(insertSubSql, subBinds, {
      autoCommit: false,
    });
    const subId = subRes.outBinds.out_sub_id[0];

    await conn.commit();

    const user = { id: userId, name: cleanName, email: cleanEmail };
    const subscription = { id: subId, active: true };

    return reply
      .status(201)
      .send({ success: true, isSubscribed: true, user, subscription });
  } catch (err) {
    request.log?.error?.(err);
    try {
      if (conn) await conn.rollback();
    } catch (e) {}

    if (err?.errorNum === 1 || (err?.message || "").includes("ORA-00001")) {
      return reply.status(409).send({ error: "Email já cadastrado" });
    }

    return reply.status(500).send({ error: "Erro ao criar assinatura" });
  } finally {
    try {
      if (conn) await conn.close();
    } catch {}
  }
}
