import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI não configurado");

export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 20000,
  retryWrites: true,
  w: 'majority',
});

let dbInstance = null;

export async function connect() {
  if (dbInstance) return dbInstance;
  
  try {
    await client.connect();
    console.log("Conectado ao MongoDB com sucesso!");
    
    dbInstance = client.db(process.env.MONGO_DB_NAME || "pathfindr");
    return dbInstance;
  } catch (error) {
    console.error("Erro ao conectar no MongoDB:", error.message);
    throw error;
  }
}

export function getDb() {
  if (!dbInstance)
    throw new Error("Banco não conectado. Chame connect() antes.");
  return dbInstance;
}

export async function close() {
  await client.close();
  dbInstance = null;
}