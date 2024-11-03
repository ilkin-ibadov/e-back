const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
      label: {
        type: String,
        required: true,
        // enum: ["Clothing", "Technology", "Electronics", "Furniture", "Accessories", "Sports and hobbies"],
      }
    }
  );
  
  const Category = mongoose.model("Category", categorySchema);
  
  module.exports = Category;
  