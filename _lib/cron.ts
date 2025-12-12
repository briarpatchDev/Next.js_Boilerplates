import cron from "node-cron";
import { randomString } from "./randomString";
import { connectToDatabase } from "./mongodb";

export default function startCronJobs() {
  if (process.env.NODE_ENV === "production") {
    console.log("cron jobs started");

    // Tabulates the past days user visits
    const updateDailyAnalytics = cron.schedule(
      `0 6 * * *`,
      //`*/5 * * * *`,
      async () => {
        console.log("Updating daily analytics");
        const db = await connectToDatabase("analytics");
        const current_metrics = db.collection("current_metrics");
        const daily_metrics = db.collection("daily_metrics");
        const today = new Date(
          new Date().toLocaleString("en-US", {
            timeZone: "America/New_York",
          })
        );
        today.setDate(today.getDate() - 1);
        const dateString = `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        // Retrieve today's metrics and resets them
        const todaysMetrics = await current_metrics.findOneAndUpdate(
          { name: "daily_visitors" },
          {
            $set: {
              daily_visitors: 0,
              new_visitors: 0,
            },
          },
          { returnDocument: "before" }
        );
        // Creates a new entry for today's data, tabulates them into the weekly metrics
        if (todaysMetrics) {
          await daily_metrics.insertOne({
            date: dateString,
            daily_visitors: todaysMetrics.daily_visitors || 0,
            new_visitors: todaysMetrics.new_visitors || 0,
          });
          await current_metrics.updateOne(
            { name: "weekly_visitors" },
            {
              $inc: {
                weekly_visitors: todaysMetrics.daily_visitors || 0,
                new_visitors: todaysMetrics.new_visitors || 0,
              },
            },
            { upsert: true }
          );
        }
        console.log("Finished updating daily analytics");
      },
      {
        timezone: "America/New_York",
      }
    );
    updateDailyAnalytics.start();

    // Tabulates the past weeks user visits
    const updateWeeklyAnalytics = cron.schedule(
      `0 7 * * 1`,
      //`*/12 * * * *`,
      async () => {
        console.log("Updating weekly analytics");
        const db = await connectToDatabase("analytics");
        const current_metrics = db.collection("current_metrics");
        const weekly_metrics = db.collection("weekly_metrics");
        const today = new Date(
          new Date().toLocaleString("en-US", {
            timeZone: "America/New_York",
          })
        );
        const date = new Date(today);
        date.setDate(date.getDate() - 7);
        const dateString = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

        // Retrieves this week's metrics and resets them
        const weeklyMetrics = await current_metrics.findOneAndUpdate(
          { name: "weekly_visitors" },
          {
            $set: {
              weekly_visitors: 0,
              new_visitors: 0,
            },
          },
          { returnDocument: "before" }
        );
        // Creates a new entry for this weeks's data, tabulates them into totals
        if (weeklyMetrics) {
          await weekly_metrics.insertOne({
            weekOf: dateString,
            weekly_visitors: weeklyMetrics.weekly_visitors || 0,
            new_visitors: weeklyMetrics.new_visitors || 0,
          });

          // Add to overall totals
          await current_metrics.updateOne(
            { name: "total_visitors" },
            {
              $inc: {
                total_visitors: weeklyMetrics.weekly_visitors || 0,
                total_new_visitors: weeklyMetrics.new_visitors || 0,
              },
            },
            { upsert: true }
          );
        }
        console.log("Finished updating weekly analytics");
      },
      {
        timezone: "America/New_York",
      }
    );
    updateWeeklyAnalytics.start();

    // Reset daily email counter
    const resetEmailCounter = cron.schedule(
      `0 5 * * *`,
      async () => {
        console.log("Reseting email counter...");
        const db = await connectToDatabase("analytics");
        const current_metrics = db.collection("current_metrics");
        await current_metrics.updateOne(
          { name: "emails_sent" },
          { $set: { emails_sent: 0 } }
        );
        console.log("Reset complete");
      },
      {
        timezone: "America/New_York",
      }
    );
    resetEmailCounter.start();

    // Sets all inactive accounts to "status: inactive" every day if they've been inactive for 48 hours
    // We could implement this system later if we wanted
    /*
    const manageInactiveAccounts = cron.schedule(
      `0 6 * * *`,
      async () => {
        console.log("Running inactive accounts cleanup...");
        const db = await connectToDatabase("accounts");
        let accounts = db.collection(`accounts`);
        const currentDate = new Date();
        const twoDaysAgo = new Date(
          currentDate.getTime() - 48 * 60 * 60 * 1000
        );
        const result = await accounts.updateMany(
          {
            status: "active",
            $or: [
              { lastActiveAt: { $lt: twoDaysAgo } },
              { lastActiveAt: { $exists: false } },
            ],
          },
          {
            $set: {
              status: "inactive",
            },
          }
        );
        console.log(
          `Marked ${result.modifiedCount} accounts as inactive at ${currentDate}`
        );
      },
      {
        timezone: "America/New_York",
      }
    );
    */
    //manageInactiveAccounts.start();
    console.log("cron jobs finished");
  }
}
