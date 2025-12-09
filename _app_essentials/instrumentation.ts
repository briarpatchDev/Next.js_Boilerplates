export async function register() {
  console.log("Running instrumentation.ts");
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { default: startCronJobs } = await import("./app/lib/cron");
    startCronJobs();
  }
}
