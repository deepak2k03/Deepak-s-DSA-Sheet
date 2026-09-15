require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('./models/Problem');
const Topic = require('./models/Topic');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const problemResult = await Problem.updateMany(
    { order: { $exists: false } },
    { $set: { order: 0 } }
  );
  console.log('Fixed problems:', problemResult);

  const topicResult = await Topic.updateMany(
    { order: { $exists: false } },
    { $set: { order: 0 } }
  );
  console.log('Fixed topics:', topicResult);

  mongoose.disconnect();
}

fix();
