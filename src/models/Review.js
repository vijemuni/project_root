const db = require('../config/database');

class Review {
  static async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      'SELECT * FROM review ORDER BY id DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows;
  }

  static async create(name, email, rating, review) {
    const [result] = await db.query(
      'INSERT INTO review (name, email, rating, review) VALUES (?, ?, ?, ?)',
      [name, email, rating, review]
    );
    return result.insertId;
  }

  static async update(id, name, rating, review, email) {
    const [result] = await db.query(
      'UPDATE review SET name = ?, rating = ?, review = ? WHERE id = ? AND email = ?',
      [name, rating, review, id, email]
    );
    return result.affectedRows;
  }

  static async delete(id, email) {
    const [result] = await db.query(
      'DELETE FROM review WHERE id = ? AND email = ?',
      [id, email]
    );
    return result.affectedRows;
  }
}

module.exports = Review;