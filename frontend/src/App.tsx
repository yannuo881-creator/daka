import { useEffect, useMemo, useState } from 'react';
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
const DAILY_TARGET = 4;

const medicines = [
  { name: '晨间处方', dose: '2 粒', time: '08:30', status: '已打卡', tone: 'success' },
  { name: '午后维持', dose: '1 片', time: '13:00', status: '待提醒', tone: 'warning' },
  { name: '晚间护理', dose: '5 ml', time: '20:30', status: '未开始', tone: 'neutral' },
];

function parseLogTime(timestamp: string) {
  return dayjs(timestamp.replace('T', ' '));
}

function DakaLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-lockup ${compact ? 'brand-lockup--compact' : ''}`} aria-label="达卡健康">
      <div className="brand-mark" aria-hidden="true">
        <span className="brand-mark__tick brand-mark__tick--one" />
        <span className="brand-mark__tick brand-mark__tick--two" />
        <span className="brand-mark__leaf" />
        <span className="brand-mark__check" />
      </div>
      <div>
        <strong>达卡健康</strong>
        {!compact && <span>daka.aisms.sbs</span>}
      </div>
    </div>
  );
}

function App() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    axios
      .get(API_URL)
      .then((response) => {
        setLogs(response.data.logs);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch logs', err);
        setError('无法获取记录，请检查服务器连接。');
      });
  }, []);

  const handleRecord = async () => {
    setLoading(true);
    try {
      const response = await axios.post(API_URL);
      const newLog = response.data.log;
      setLogs((currentLogs) => [newLog, ...currentLogs]);
      setError(null);
    } catch (err) {
      console.error('Failed to record medication', err);
      setError('记录失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  const hasLogForDate = (date: Date) => {
    return logs.some((log) => parseLogTime(log.timestamp).isSame(date, 'day'));
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    if (hasLogForDate(date)) return 'react-calendar__tile--has-medication';
    if (dayjs(date).isBefore(dayjs(), 'day')) return 'react-calendar__tile--missed';
    return null;
  };

  const selectedDateLogs = useMemo(
    () => logs.filter((log) => parseLogTime(log.timestamp).isSame(selectedDate, 'day')),
    [logs, selectedDate],
  );

  const todayLogsCount = useMemo(
    () => logs.filter((log) => parseLogTime(log.timestamp).isSame(dayjs(), 'day')).length,
    [logs],
  );

  const progressPercent = Math.min((todayLogsCount / DAILY_TARGET) * 100, 100);

  return (
    <div className="app-shell">
      <header className="topbar">
        <DakaLogo />
        <nav className="topbar__nav" aria-label="主要模块">
          <a href="#today">今日</a>
          <a href="#calendar">日历</a>
          <a href="#history">流水</a>
        </nav>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__copy">
            <div className="eyebrow">准时达卡，健康到家</div>
            <h1 id="hero-title">把每一次服药，都稳稳记在今天。</h1>
            <p>
              达卡健康用温和的提醒、清晰的时间记录和大单元格日历，帮助患者与家人减少漏服焦虑。
            </p>
            <div className="hero__actions">
              <button className="primary-action" onClick={handleRecord} disabled={loading}>
                <span className="button-icon" aria-hidden="true" />
                {loading ? '同步中' : '开始打卡'}
              </button>
              <span className="hero__domain">daka.aisms.sbs</span>
            </div>
          </div>
          <div className="hero__visual" aria-hidden="true">
            <img src="/images/daka-hero.png" alt="" />
          </div>
        </section>

        <section className="workspace" aria-label="达卡健康工作台">
          <aside className="today-panel" id="today">
            <div className="section-label">今日进度</div>
            <div className="progress-card">
              <div className="progress-card__count">
                <strong>{todayLogsCount}</strong>
                <span>/{DAILY_TARGET} 次</span>
              </div>
              <div className="progress-track" aria-label={`今日已完成 ${todayLogsCount} 次`}>
                <span style={{ width: `${progressPercent}%` }} />
              </div>
              <p>数字记录会优先突出，方便患者和照护人快速确认今日状态。</p>
            </div>

            <div className="medicine-stack" aria-label="药箱卡片">
              {medicines.map((medicine) => (
                <article className="medicine-card" key={medicine.name}>
                  <div>
                    <h2>{medicine.name}</h2>
                    <span>{medicine.dose}</span>
                  </div>
                  <div className="medicine-card__meta">
                    <strong>{medicine.time}</strong>
                    <em className={`status-pill status-pill--${medicine.tone}`}>{medicine.status}</em>
                  </div>
                </article>
              ))}
            </div>

            <button className="record-button" onClick={handleRecord} disabled={loading}>
              {loading ? '正在同步记录' : '立即记录吃药'}
            </button>
            {error && <p className="error-message">{error}</p>}
          </aside>

          <section className="calendar-panel" id="calendar">
            <div className="panel-heading">
              <div>
                <div className="section-label">打卡日历</div>
                <h2>用大格子看清每一天</h2>
              </div>
              <div className="calendar-legend">
                <span className="legend-success">已服</span>
                <span className="legend-warning">漏服</span>
              </div>
            </div>
            <Calendar
              onChange={(val) => setSelectedDate(val as Date)}
              value={selectedDate}
              tileClassName={tileClassName}
              locale="zh-CN"
            />
          </section>

          <section className="history-panel" id="history">
            <div className="panel-heading">
              <div>
                <div className="section-label">流水记录</div>
                <h2>{dayjs(selectedDate).format('YYYY年MM月DD日')}</h2>
              </div>
              <DakaLogo compact />
            </div>

            {selectedDateLogs.length === 0 ? (
              <div className="empty-state">
                <strong>暂无用药数据</strong>
                <span>选择其他日期或完成一次打卡后，这里会显示具体时间。</span>
              </div>
            ) : (
              <ul className="log-list">
                {selectedDateLogs.map((log) => {
                  const date = parseLogTime(log.timestamp);
                  return (
                    <li key={log.id} className="log-item">
                      <div className="log-time">{date.format('HH:mm')}</div>
                      <div>
                        <strong>已服药</strong>
                        <span>{date.format('YYYY-MM-DD')}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;
