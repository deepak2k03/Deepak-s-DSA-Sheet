require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('./models/Problem');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  let p1_lean = await Problem.findById(2).select('title id order').lean();
  console.log("Before save order in DB (lean):", p1_lean.order);

  const p1 = await Problem.findById(2);
  console.log("Mongoose doc order:", p1.order);
  p1.title = p1.title + " (edited)";
  await p1.save();
  
  p1_lean = await Problem.findById(2).select('title id order').lean();
  console.log("After save order in DB (lean):", p1_lean.order);

  // Restore
  const p1_after = await Problem.findById(2);
  p1_after.title = p1_after.title.replace(" (edited)", "");
  await p1_after.save();

  mongoose.disconnect();
}

test();
