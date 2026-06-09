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
      setLogs([newLog, ...logs]);
      setError(null);
    } catch (err) {
      console.error('Failed to record medication', err);
      setError('记录失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  const hasLogForDate = (date: Date) => {
    return logs.some(log => dayjs(log.timestamp.replace("T", " ")).isSame(date, 'day'));
  };

  const tileClassName = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      if (hasLogForDate(date)) {
        return 'react-calendar__tile--has-medication';
      }
    }
    return null;
  };

  const selectedDateLogs = logs.filter(log => dayjs(log.timestamp.replace("T", " ")).isSame(selectedDate, 'day'));
  const todayLogsCount = logs.filter(log => dayjs(log.timestamp.replace("T", " ")).isSame(dayjs(), 'day')).length;

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand-info">
          <h1>达卡健康 <span>DAKA HEALTH</span></h1>
        </div>
        <div className="slogan">准时达卡，健康到家</div>
      </header>

      <main className="app-main">
        <section className="dashboard-summary">
          <div className="progress-header">
            <h3>今日打卡进度</h3>
            <div className="progress-count">
              {todayLogsCount}<span>次记录</span>
            </div>
          </div>
          
          <div className="record-btn-wrapper">
            <button
              className={`record-button ${loading ? 'loading' : ''}`}
              onClick={handleRecord}
              disabled={loading}
            >
              {loading ? '同步中...' : '💊 立即记录吃药'}
            </button>
            {error && <p className="error-message">{error}</p>}
          </div>
        </section>

        <section className="calendar-section">
          <h2>打卡日历</h2>
          <div className="calendar-wrapper">
            <Calendar
              onChange={(val) => setSelectedDate(val as Date)}
              value={selectedDate}
              tileClassName={tileClassName}
              locale="zh-CN"
            />
          </div>
        </section>

        <section className="history-section">
          <h2>
            {dayjs(selectedDate).format('YYYY年MM月DD日')}
            <span>打卡流水记录</span>
          </h2>
          {selectedDateLogs.length === 0 ? (
            <div className="empty-state">
              <p>暂无用药数据</p>
            </div>
          ) : (
            <ul className="log-list">
              {selectedDateLogs.map(log => {
                const date = dayjs(log.timestamp.replace("T", " "));
                return (
                  <li key={log.id} className="log-item">
                    <div className="log-time">{date.format('HH:mm')}</div>
                    <div className="log-status">已服药</div>
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
