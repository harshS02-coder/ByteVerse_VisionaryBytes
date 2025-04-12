import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Capsule } from "./capsule.js";
import { CapsuleStorage } from "./storage.js";
import { hashPassword, verifyPassword } from "./encryption.js";
import { initStorage } from "./storage.js"; // Import the initStorage function

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

async function startServer() {
  try {
    // Initialize MongoDB connection
    await initStorage();
    const storage = new CapsuleStorage();

    app.get("/", (req, res) => {
      res.send("Time Capsule API is running!");
    });

    app.post("/capsules", async (req, res) => {
      const { message, unlockDate, password } = req.body;

      if (!message || !unlockDate || !password) {
        return res.status(400).json({ error: "Missing fields" });
      }

      try {
        await storage.load();
        const hashedPassword = await hashPassword(password);
        const capsule = new Capsule(message, unlockDate, hashedPassword);
        await storage.addCapsule(capsule);
        res.json({ success: true, capsuleId: capsule.id });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get("/capsules/:id", async (req, res) => {
      try {
        await storage.load();
        const capsule = await storage.getCapsule(req.params.id);

        if (!capsule) return res.status(404).json({ error: "Capsule not found" });

        const isUnlockable = capsule.isUnlockable();
        res.json({
          id: capsule.id,
          unlockDate: capsule.unlockDate,
          status: isUnlockable ? "Unlockable" : "Locked",
        });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post("/capsules/:id/unlock", async (req, res) => {
      try {
        const { password } = req.body;
        await storage.load();
        const capsule = await storage.getCapsule(req.params.id);

        if (!capsule) return res.status(404).json({ error: "Capsule not found" });

        if (!capsule.isUnlockable())
          return res.status(403).json({ error: "Capsule is still locked" });

        const isValid = await verifyPassword(capsule.password, password);
        if (!isValid) return res.status(401).json({ error: "Incorrect password" });

        res.json({ message: capsule.message });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("Failed to initialize storage:", err.message);
    process.exit(1); // Exit process if DB initialization fails
  }
}

startServer();
