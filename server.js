const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 8393;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Use file-based SQLite db for persistence
const db = new sqlite3.Database('./sqlite.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT)");
});

app.get('/tasks', (req, res) => {
  db.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/tasks', (req, res) => {
  const { description } = req.body;
  db.run("INSERT INTO tasks (description) VALUES (?)", [description], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, description });
  });
});

app.delete('/tasks/:id', (req, res) => {
  db.run("DELETE FROM tasks WHERE id = ?", req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted', changes: this.changes });
  });
});

app.listen(port, () => {
  console.log(`Intern CRUD app listening on port ${port}`);
});