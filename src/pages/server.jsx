const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // sesuaikan
  database: "test_tec", // sesuai file .sql kamu
});

// Endpoint untuk tambah exam
app.post("/api/exams", (req, res) => {
  const { title, schedule } = req.body;
  const query = "INSERT INTO exams (title, schedule) VALUES (?, ?)";
  db.query(query, [title, schedule], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(200).json({ message: "Exam added successfully", id: result.insertId });
  });
});

// Endpoint untuk ambil semua exams
app.get("/api/exams", (req, res) => {
  db.query("SELECT * FROM exams", (err, results) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(results);
  });
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
