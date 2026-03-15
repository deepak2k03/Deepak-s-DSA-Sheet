require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedDefaultTopics = require('./utils/seedDefaultTopics');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/topics', require('./routes/topics'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
	await connectDB();
	await seedDefaultTopics();

	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer().catch((error) => {
	console.error(`Failed to start server: ${error.message}`);
	process.exit(1);
});