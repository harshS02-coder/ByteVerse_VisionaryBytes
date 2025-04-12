import { program } from "commander";
import chalk from "chalk";
import prompts from "prompts";
import { displayWelcome, displayCapsule } from "./ui.js";
import { Capsule } from "./capsule.js";
import { CapsuleStorage } from "./storage.js";
import { hashPassword, verifyPassword } from "./encryption.js";

console.log("Debug: Starting CLI");

program
  .version("1.0.0")
  .description("Time Capsule Terminal");

program
  .command("test")
  .description("Test the CLI")
  .action(() => {
    displayWelcome();
    console.log(chalk.green("Test command works!"));
  });

program
  .command("create <message>")
  .description("Create a capsule")
  .option("--unlock-date <date>", "Unlock date (YYYY-MM-DD)")
  .action(async (message, options) => {
    displayWelcome();
    if (!options.unlockDate) {
      console.error(chalk.red("Error: --unlock-date is required"));
      process.exit(1);
    }
    const unlockDate = new Date(options.unlockDate);
    if (isNaN(unlockDate.getTime())) {
      console.error(chalk.red("Error: Invalid date format (use YYYY-MM-DD)"));
      process.exit(1);
    }
    const { password } = await prompts({
      type: "password",
      name: "password",
      message: "Enter password:",
    });
    const { confirmPassword } = await prompts({
      type: "password",
      name: "confirmPassword",
      message: "Confirm password:",
    });
    if (password !== confirmPassword) {
      console.error(chalk.red("Error: Passwords do not match"));
      process.exit(1);
    }
    try {
      const storage = new CapsuleStorage();
      await storage.load();
      const capsule = new Capsule(
        message,
        unlockDate,
        await hashPassword(password)
      );
      await storage.addCapsule(capsule);
      console.log(chalk.green(`Capsule created! ID: ${capsule.id}`));
    } catch (e) {
      console.error(chalk.red(`Error creating capsule: ${e.message}`));
    }
  });

program
  .command("view <id>")
  .description("View a capsule")
  .action(async (id) => {
    displayWelcome();
    try {
      const storage = new CapsuleStorage();
      await storage.load();
      const capsule = storage.getCapsule(id);
      if (!capsule) {
        console.error(chalk.red("Capsule not found!"));
        return;
      }
      displayCapsule(capsule);
    } catch (e) {
      console.error(chalk.red(`Error viewing capsule: ${e.message}`));
    }
  });

program
  .command("unlock <id>")
  .description("Unlock a capsule")
  .action(async (id) => {
    displayWelcome();
    try {
      const storage = new CapsuleStorage();
      await storage.load();
      const capsule = storage.getCapsule(id);
      if (!capsule) {
        console.error(chalk.red("Capsule not found!"));
        return;
      }
      if (!capsule.isUnlockable()) {
        console.error(chalk.red("Capsule is still locked!"));
        return;
      }
      const { password } = await prompts({
        type: "password",
        name: "password",
        message: "Enter password:",
      });
      if (await verifyPassword(capsule.password, password)) {
        console.log(chalk.green("Capsule unlocked!"));
        console.log(chalk.yellow(`Message: ${capsule.message}`));
      } else {
        console.error(chalk.red("Incorrect password!"));
      }
    } catch (e) {
      console.error(chalk.red(`Error unlocking capsule: ${e.message}`));
    }
  });

program.parse();
