const express = require('express');
const Review = require('../models/Review');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const reviews = await Review.getAll(page);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, rating, review } = req.body;
    const id = await Review.create(name, email, rating, review);
    res.status(201).json({ id, message: 'Review created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating review' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, rating, review } = req.body;
    const result = await Review.update(id, name, rating, review, email);
    if (result) {
      res.json({ message: 'Review updated successfully' });
    } else {
      res.status(404).json({ message: 'Review not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating review' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const result = await Review.delete(id, email);
    if (result) {
      res.json({ message: 'Review deleted successfully' });
    } else {
      res.status(404).json({ message: 'Review not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review' });
  }
});

module.exports = router;