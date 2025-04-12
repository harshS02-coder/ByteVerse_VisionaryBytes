import fs from "fs/promises";
import { Capsule } from "./capsule.js";

export class CapsuleStorage {
  constructor(file = "capsules.json") {
    this.file = file;
    this.capsules = [];
  }

  async load() {
    try {
      const data = await fs.readFile(this.file, "utf8");
      this.capsules = JSON.parse(data);
    } catch (e) {
      this.capsules = [];
    }
  }

  async save() {
    await fs.writeFile(this.file, JSON.stringify(this.capsules, null, 2));
  }

  async addCapsule(capsule) {
    this.capsules.push({
      id: capsule.id,
      message: capsule.message,
      unlockDate: capsule.unlockDate.toISOString(),
      password: capsule.password,
      filePath: capsule.filePath,
    });
    await this.save();
  }

  getCapsule(id) {
    const data = this.capsules.find((c) => c.id === id);
    if (!data) return null;
    const capsule = new Capsule(
      data.message,
      data.unlockDate,
      data.password,
      data.filePath
    );
    capsule.id = data.id;
    return capsule;
  }
}
