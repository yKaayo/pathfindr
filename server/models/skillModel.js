import { client } from "../config/mongo.js";
import { ObjectId } from "mongodb";

export class SkillModel {
  async collection() {
    const db = client.db("Cluster0");
    return db.collection("skills");
  }

  async create(memoryData) {
    const col = await this.collection();
    const result = await col.insertOne({
      ...memoryData,
      createdAt: new Date(),
    });
    return result;
  }

  async findAll() {
    const col = await this.collection();
    return col.find().sort({ createdAt: -1 }).toArray();
  }

  async findById(id) {
    const col = await this.collection();
    return col.findOne({ _id: new ObjectId(id) });
  }

  async update(id, data) {
    const col = await this.collection();
    const result = await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } }
    );
    return result;
  }

  async delete(id) {
    const col = await this.collection();
    return col.deleteOne({ _id: new ObjectId(id) });
  }
}
