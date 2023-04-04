const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Define the Mongoose schema for a binary tree node
const nodeSchema = new mongoose.Schema({
  value: Number,
  left: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' },
  right: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' },
});

// Create the Mongoose model for a binary tree node
const Node = mongoose.model('Node', nodeSchema);

// Connect to the MongoDB database
const connectionString = 'mongodb://localhost:27017/mydb';
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch((err) => {
    console.log('MongoDB Connection Error:', err);
  });

// Define an API endpoint for performing a breadth-first search on the binary tree
app.get('/search/:value', async (req, res) => {
  const rootNode = await Node.findOne({ value: req.params.value }).populate('left right');
  const queue = [rootNode];

  while (queue.length > 0) {
    const node = queue.shift();
    if (node.value === req.params.value) {
      res.send(node);
      return;
    }
    if (node.left) queue.push(await Node.findById(node.left._id).populate('left right'));
    if (node.right) queue.push(await Node.findById(node.right._id).populate('left right'));
  }

  res.send('Node not found');
});

// Start the Express server
app.listen(port, () => console.log(`Server listening on port ${port}`));
