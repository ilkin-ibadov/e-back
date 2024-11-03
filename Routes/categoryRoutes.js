const express = require("express");
const router = express.Router();
const { authenticateAccessToken } = require("../middleware/authenticateAccessToken");
const { isAdmin } = require("../middleware/isAdmin");
const Category = require("../models/categoryModel");

// Get all categories
router.get("/", authenticateAccessToken, isAdmin, async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ categories });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get category by ID
router.get("/category/:id", authenticateAccessToken, isAdmin, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        res.json({ category });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new category
router.post("/add", authenticateAccessToken, isAdmin, async (req, res) => {
    try {
        const { label } = req.body;
        const category = new Category({ label });
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update category by ID
router.put("/update/:id", authenticateAccessToken, isAdmin, async (req, res) => {
    try {
        const categoryUpdated = await Category.findByIdAndUpdate(req.params.id, {
            label: req.body.label,
        }, { new: true, runValidators: true });

        categoryUpdated ? res.status(200).json({message: "Category updated successfully"}) :  res.status(400).json({message: "Error while updating category"})
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete category by ID
router.delete("/delete/:id", authenticateAccessToken, isAdmin, async (req, res) => {
    try {
        const categoryDeleted = await Category.findByIdAndDelete(req.params.id);

        categoryDeleted ? res.status(200).json({ message: "Category deleted successfully" }) : res.status(200).json({ message: "Error while deleting category" })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;