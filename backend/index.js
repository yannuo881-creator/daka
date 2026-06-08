const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 获取所有打卡记录
app.get('/api/logs', (req, res) => {
  const sql = 'SELECT * FROM logs ORDER BY timestamp DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ logs: rows });
  });
});

// 记录吃药打卡
app.post('/api/logs', (req, res) => {
  const sql = 'INSERT INTO logs DEFAULT VALUES';
  db.run(sql, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // 获取刚插入的记录
    db.get('SELECT * FROM logs WHERE id = ?', [this.lastID], (err, row) => {
       if (err) {
         return res.status(500).json({ error: err.message });
       }
       res.status(201).json({ log: row });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
