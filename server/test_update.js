const mongoose = require('mongoose');
const Problem = require('./models/Problem');
require('dotenv').config();

async function testUpdate() {
  await mongoose.connect(process.env.MONGO_URI);
  const problem = await Problem.findOne({ title: /Largest Element in an Array/i });
  if (problem) {
    problem.githubLink = "https://github.com/test/solution";
    await problem.save();
    console.log("Updated problem:", problem.title);
  } else {
    console.log("Problem not found");
  }
  mongoose.disconnect();
}
testUpdate();
