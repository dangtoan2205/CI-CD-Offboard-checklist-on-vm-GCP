import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './TicketList.module.css';

const API_BASE = '/api';

const STATUS_STYLE = {
  'Chưa thực hiện': styles.statusPending,
  'Đang thực hiện': styles.statusProgress,
  'Hoàn thành': styles.statusDone,
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const query = searchQuery.trim().toLowerCase();
  const filteredTickets = query
    ? tickets.filter(
        (t) =>
          (t.employee_name && t.employee_name.toLowerCase().includes(query)) ||
          (t.employee_id && String(t.employee_id).toLowerCase().includes(query))
      )
    : tickets;

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/tickets`);
      if (!res.ok) throw new Error('Không tải được danh sách');
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    const handler = () => fetchTickets();
    window.addEventListener('ticket-created', handler);
    return () => window.removeEventListener('ticket-created', handler);
  }, []);

  const handleDownload = async (id, name, employeeId) => {
    try {
      const res = await fetch(`${API_BASE}/tickets/${id}/export`);
      if (!res.ok) throw new Error('Export thất bại');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Offboard checklist - ${name} ${employeeId}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loading}>Đang tải danh sách...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <h2 className={styles.title}>Danh sách ticket Offboard</h2>
        <div className={styles.searchWrap}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm theo họ tên hoặc ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Tìm kiếm theo họ tên hoặc ID"
          />
        </div>
        <span className={styles.count}>{filteredTickets.length} ticket</span>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Ngày tạo</th>
              <th>Người tạo</th>
              <th>Trạng thái</th>
              <th>Thời gian hoàn thành</th>
              <th className={styles.colActions}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  {tickets.length === 0
                    ? 'Chưa có ticket nào. Nhấn '
                    : 'Không tìm thấy ticket nào phù hợp với từ khóa tìm kiếm.'}
                  {tickets.length === 0 && (
                    <>
                      <strong>Tạo ticket Offboard</strong>
                      {' trên header để tạo.'}
                    </>
                  )}
                </td>
              </tr>
            ) : (
              filteredTickets.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link to={`/ticket/${t.id}`} className={styles.ticketName}>
                      Offboard checklist - {t.employee_name} {t.employee_id}
                    </Link>
                  </td>
                  <td>{formatDate(t.created_at)}</td>
                  <td>{t.created_by || '—'}</td>
                  <td>
                    <span className={STATUS_STYLE[t.status] || styles.statusPending}>
                      {t.status}
                    </span>
                  </td>
                  <td>{formatDateTime(t.completed_at)}</td>
                  <td className={styles.colActions}>
                    <Link to={`/ticket/${t.id}`} className={styles.btnDetail}>
                      Xem chi tiết
                    </Link>
                    <button
                      type="button"
                      className={styles.btnDownload}
                      onClick={() => handleDownload(t.id, t.employee_name, t.employee_id)}
                    >
                      Tải .xlsx
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
