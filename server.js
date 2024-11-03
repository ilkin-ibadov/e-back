require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const basketRoutes = require("./routes/basketRoutes");
const categoryRoutes = require("./routes/categoryRoutes")
const path = require('path');
const bodyParser = require("body-parser");

const PRODUCTDB_URL = process.env.CONNECTION_STRING;
const cluster = require("cluster");
const os = require("os");
const app = express();
const cpuNum = os.cpus().length;
const port = 5001;
app.use(bodyParser.json());
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
app.use("/categories", categoryRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')));
