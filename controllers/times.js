import cron from "node-cron";

////////////////one month////////////////
cron.schedule(
  "0 1 1 * *",
  async () => {
   
  },
  {
    scheduled: true,
    timezone: "Asia/Tbilisi", // Set your timezone here, e.g., 'America/New_York'
  }
);

////////////////one day////////////////
cron.schedule(
  "0 1 * * *",
  async () => {
    
  },
  {
    scheduled: true,
    timezone: "Asia/Tbilisi", // Set your timezone here, e.g., 'America/New_York'
  }
);


