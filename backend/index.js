const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 格式化时间戳，确保其包含Z，让前端知道这是UTC时间
const formatLog = (row) => {
  if (row && row.timestamp && !row.timestamp.endsWith('Z')) {
    row.timestamp = row.timestamp.replace(' ', 'T') + 'Z';
  }
  return row;
};

// 获取所有打卡记录
app.get('/api/logs', (req, res) => {
  const sql = 'SELECT * FROM logs ORDER BY timestamp DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const formattedRows = rows.map(formatLog);
    res.json({ logs: formattedRows });
  });
});

// 记录吃药打卡
app.post('/api/logs', (req, res) => {
  const now = new Date().toISOString();
  const sql = 'INSERT INTO logs (timestamp) VALUES (?)';
  db.run(sql, [now], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // 获取刚插入的记录
    db.get('SELECT * FROM logs WHERE id = ?', [this.lastID], (err, row) => {
       if (err) {
         return res.status(500).json({ error: err.message });
       }
       res.status(201).json({ log: formatLog(row) });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
