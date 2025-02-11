import express from 'express';
import cron from 'node-cron';

// ...existing code...

// Add this to keep the process alive
const app = express();
const port = process.env.PORT || 3000;

// Your existing cron setup
cron.schedule('* * * * *', async () => {
    // ...your existing cron logic...
});

app.listen(port, () => {
    console.log(`Cron service running on port ${port}`);
});
