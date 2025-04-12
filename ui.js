import chalk from "chalk";
import figlet from "figlet";

export function displayWelcome() {
  console.log(
    chalk.magenta.bold(
      figlet.textSync("Time Capsule", { font: "Slant" })
    )
  );
  console.log(chalk.cyan("Preserve your memories for the future!"));
}

export function displayCapsule(capsule) {
  const status = capsule.isUnlockable()
    ? chalk.green("Unlockable")
    : chalk.red("Locked");
  console.log(chalk.green("┌─ Capsule Status ─┐"));
  console.log(chalk.bold(`ID: ${capsule.id}`));
  console.log(`Status: ${status}`);
  console.log(`Unlock Date: ${capsule.unlockDate}`);
  console.log(chalk.green("└─────────────────┘"));
}
