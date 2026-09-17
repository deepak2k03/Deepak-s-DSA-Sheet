const mongoose = require('mongoose');
const Problem = require('./models/Problem');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const problems = await Problem.find({ githubLink: { $exists: true, $ne: '' } });
  console.log("Problems with githubLink:", problems.length);
  if (problems.length > 0) {
    console.log(problems[0].title, problems[0].githubLink);
  }
  mongoose.disconnect();
}
check();
