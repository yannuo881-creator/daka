import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App.css';

interface Log {
  id: number;
  timestamp: string;
}

const API_URL = '/api/logs';

function App() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(API_URL);
      setLogs(response.data.logs);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch logs', err);
      setError('无法获取记录，请检查服务器连接。');
    }
  };

  const handleRecord = async () => {
    setLoading(true);
    try {
      const response = await axios.post(API_URL);
      const newLog = response.data.log;
      // Add new log to the beginning of the list
      setLogs([newLog, ...logs]);
      setError(null);
    } catch (err) {
      console.error('Failed to record medication', err);
      setError('记录失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  // 检查特定日期是否有打卡记录
  const hasLogForDate = (date: Date) => {
    return logs.some(log => dayjs(log.timestamp).isSame(date, 'day'));
  };

  // 给有打卡记录的日期添加特殊的 CSS class
  const tileClassName = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      if (hasLogForDate(date)) {
        return 'react-calendar__tile--has-medication';
      }
    }
    return null;
  };

  // 获取选中日期的打卡记录
  const selectedDateLogs = logs.filter(log => dayjs(log.timestamp).isSame(selectedDate, 'day'));

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>💊 吃药打卡</h1>
        <p>记录您每天的用药情况，保持健康！</p>
      </header>

      <main className="app-main">
        <section className="action-section">
          <button 
            className={`record-button ${loading ? 'loading' : ''}`}
            onClick={handleRecord}
            disabled={loading}
          >
            {loading ? '记录中...' : '💊 记录吃药'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </section>

        <section className="calendar-section">
          <h2>打卡日历</h2>
          <div className="calendar-wrapper">
            <Calendar 
              onChange={(val) => setSelectedDate(val as Date)} 
              value={selectedDate}
              tileClassName={tileClassName}
            />
          </div>
        </section>

        <section className="history-section">
          <h2>{dayjs(selectedDate).format('YYYY年MM月DD日')} 记录</h2>
          {selectedDateLogs.length === 0 ? (
            <div className="empty-state">
              <p>这一天没有打卡记录。</p>
            </div>
          ) : (
            <ul className="log-list">
              {selectedDateLogs.map(log => {
                const date = dayjs(log.timestamp);
                return (
                  <li key={log.id} className="log-item">
                    <div className="log-time">{date.format('HH:mm:ss')}</div>
                    <div className="log-status">✅ 已服药</div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
