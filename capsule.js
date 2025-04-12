import { randomUUID } from "crypto";

export class Capsule {
  constructor(message, unlockDate, password, filePath = null) {
    this.id = randomUUID();
    this.message = message;
    this.unlockDate = new Date(unlockDate);
    this.password = password;
    this.filePath = filePath;
    this.createdAt = new Date();
  }

  isUnlockable() {
    return new Date() >= this.unlockDate;
  }
}
