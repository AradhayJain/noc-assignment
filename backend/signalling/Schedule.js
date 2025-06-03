import cron from "node-cron";
import { generateDataAndUpload } from "./generateSignal.js";
import { processSignals } from "./processSignal.js";

cron.schedule("*/10 * * * *", async () => {
  console.log("⏳ Running scheduled job at", new Date().toLocaleString());

  try {
    await generateDataAndUpload();

    setTimeout(async () => {
      await processSignals();
      console.log("Signals processed successfully at", new Date().toLocaleString());
    }, 6000);
  } catch (error) {
    console.error("Error during scheduled job:", error);
  }
});

console.log("🕒 Cron job scheduled to run every 20 minutes.");
