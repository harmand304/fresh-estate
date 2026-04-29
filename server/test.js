
import express from 'express';
const app = express();
app.listen(5000, () => console.log('Test server running'));
setInterval(() => { }, 60000); // Keepalive
