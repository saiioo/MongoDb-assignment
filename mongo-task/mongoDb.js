const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const port = 3000;

// Connect to the MongoDB database
const url = 'mongodb://localhost:27017';
const dbName = 'mydb';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
let db;
client.connect((err) => {
  if (err) {
    console.log('MongoDB Connection Error:', err);
  } else {
    console.log('MongoDB Connected');
    db = client.db(dbName);
  }
});

// Define the model for a binary tree node
class Node {
  constructor(value, left=null, right=null) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

// Define an API endpoint for performing a breadth-first search on the binary tree
app.get('/search/:value', async (req, res) => {
  const rootNode = await db.collection('nodes').findOne({ value: parseInt(req.params.value) });
  const queue = [rootNode];

  while (queue.length > 0) {
    const node = queue.shift();
    if (node.value === parseInt(req.params.value)) {
      res.send(node);
      return;
    }
    if (node.left) queue.push(await db.collection('nodes').findOne({ _id: node.left }));
    if (node.right) queue.push(await db.collection('nodes').findOne({ _id: node.right }));
  }

  res.send('Node not found');
});

// Start the Express server
app.listen(port, () => console.log(`Server listening on port ${port}`));

// Create the binary tree and store it in the MongoDB database
const rootNode = new Node(1, new Node(2, new Node(4), new Node(5)), new Node(3, new Node(6), new Node(7)));
const nodeDocs = [];
traverseTree(rootNode, null, nodeDocs);
db.collection('nodes').insertMany(nodeDocs, (err, result) => {
  if (err) {
    console.log('Error inserting nodes into database:', err);
  } else {
    console.log('Nodes inserted into database');
  }
});

// Helper function to traverse the binary tree and create MongoDB documents for each node
function traverseTree(node, parent, nodeDocs) {
  if (node === null) {
    return;
  }

  const doc = { value: node.value };
  if (parent) {
    doc.parent = parent;
  }

  nodeDocs.push(doc);
  const nodeId = doc._id;

  traverseTree(node.left, nodeId, nodeDocs);
  traverseTree(node.right, nodeId, nodeDocs);
}
