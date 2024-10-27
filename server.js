require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./Routes/userRoutes");
const authRoutes = require("./Routes/authRoutes");
const productRoutes = require("./Routes/productRoutes");
const orderRoutes = require("./Routes/orderRoutes");
const basketRoutes = require("./Routes/basketRoutes");
const formidable = require("formidable");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require('path');
const bodyParser = require("body-parser");

const PRODUCTDB_URL = process.env.CONNECTION_STRING;
const cluster = require("cluster");
const os = require("os");
const parsefile = require("./fileparser");
const app = express();
const cpuNum = os.cpus().length;
const port = 5001;
app.use(bodyParser.json());
// in latest body-parser use like below.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

if (cluster.isMaster) {
  for (let i = 0; i < cpuNum; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker) => {
    console.log(`worker with pid ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  app.listen(port, () => {
    console.log(`Server running on ${process.pid} @${port}`);
  });
}

mongoose
  .connect(PRODUCTDB_URL)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas", err));

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/baskets", basketRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));
