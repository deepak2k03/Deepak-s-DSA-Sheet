require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedDefaultTopics = require('./utils/seedDefaultTopics');
const seedDefaultVisualizers = require('./utils/seedDefaultVisualizers');
const seedThreePillarVisualizers = require('./utils/seedThreePillarVisualizers');
const { globalRateLimiter } = require('./utils/rateLimiter');

const app = express();

app.use(express.json());
app.use(cors());
app.use(globalRateLimiter);

// Lightweight health-check endpoint for UptimeRobot and deployment verification
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', version: '2.1-order-fix' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/topics', require('./routes/topics'));
app.use('/api/visualizers', require('./routes/visualizers'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
	await connectDB();
	await seedDefaultTopics();
	await seedDefaultVisualizers();
	await seedThreePillarVisualizers();

	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer().catch((error) => {
	console.error(`Failed to start server: ${error.message}`);
	process.exit(1);
});