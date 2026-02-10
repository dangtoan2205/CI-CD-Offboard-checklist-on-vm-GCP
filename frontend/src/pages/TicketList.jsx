import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './TicketList.module.css';
import { useAuth } from '../context/AuthContext';

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
  const [selectedIds, setSelectedIds] = useState(new Set());
  const { user } = useAuth();

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
      const res = await fetch(`${API_BASE}/tickets`, { credentials: 'include' });
      if (!res.ok) throw new Error('Không tải được danh sách');
      const data = await res.json();
      setTickets(data);
      setSelectedIds(new Set());
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
      const res = await fetch(`${API_BASE}/tickets/${id}/export`, { credentials: 'include' });
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

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const filteredIds = filteredTickets.map((t) => t.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = filteredIds.every((id) => next.has(id));
      if (allSelected) {
        filteredIds.forEach((id) => next.delete(id));
      } else {
        filteredIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleDelete = async (ticket) => {
    const label = `Offboard checklist - ${ticket.employee_name} ${ticket.employee_id}`;
    if (!window.confirm(`Xóa ticket này?\n${label}`)) return;
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticket.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xóa thất bại');
      await fetchTickets();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Xóa ${ids.length} ticket đã chọn?`)) return;
    try {
      const res = await fetch(`${API_BASE}/tickets/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xóa hàng loạt thất bại');
      await fetchTickets();
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
        {user && (
          <button
            type="button"
            className={styles.bulkDeleteBtn}
            onClick={handleBulkDelete}
            disabled={selectedIds.size === 0}
          >
            Xóa {selectedIds.size} ticket
          </button>
        )}
        <span className={styles.count}>{filteredTickets.length} ticket</span>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {user && (
                <th className={styles.colSelect}>
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={
                      filteredTickets.length > 0 &&
                      filteredTickets.every((t) => selectedIds.has(t.id))
                    }
                    aria-label="Chọn tất cả ticket"
                  />
                </th>
              )}
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
                <td colSpan={user ? 7 : 6} className={styles.empty}>
                  {tickets.length === 0
                    ? 'Chưa có ticket nào. Nhấn '
                    : 'Không tìm thấy ticket nào phù hợp với từ khóa tìm kiếm.'}
                  {tickets.length === 0 && (
                    <>
                      {user ? (
                        <>
                          <strong>Tạo ticket Offboard</strong>
                          {' trên header để tạo.'}
                        </>
                      ) : (
                        <>
                          <strong>Admin login</strong>
                          {' để tạo ticket mới.'}
                        </>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ) : (
              filteredTickets.map((t) => (
                <tr key={t.id}>
                  {user && (
                    <td className={styles.colSelect}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(t.id)}
                        onChange={() => toggleSelect(t.id)}
                        aria-label={`Chọn ticket ${t.employee_name}`}
                      />
                    </td>
                  )}
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
                    {user && (
                      <button
                        type="button"
                        className={styles.btnDelete}
                        onClick={() => handleDelete(t)}
                      >
                        Xóa
                      </button>
                    )}
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
