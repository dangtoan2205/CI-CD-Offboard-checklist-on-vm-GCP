import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './TicketDetail.module.css';

const API_BASE = '/api';

const STATUS_OPTIONS = ['Chưa thực hiện', 'Đang thực hiện', 'Hoàn thành'];
const STATUS_CLASS = {
  'Chưa thực hiện': styles.statusPending,
  'Đang thực hiện': styles.statusProgress,
  'Hoàn thành': styles.statusDone,
};

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', completed_at: '', evidence_note: '' });
  const [editingTicketInfo, setEditingTicketInfo] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    employee_name: '',
    employee_id: '',
    email: '',
    position: '',
    manager: '',
    last_working_day: '',
    status: 'Chưa thực hiện',
  });

  const fetchTicket = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/tickets/${id}`);
      if (!res.ok) throw new Error('Không tải được ticket');
      const data = await res.json();
      setTicket(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const startEdit = (item) => {
    setEditingItem(item.id);
    setEditForm({
      status: item.status || 'Chưa thực hiện',
      completed_at: formatDate(item.completed_at),
      evidence_note: item.evidence_note || '',
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
  };

  const saveItem = async () => {
    if (!editingItem) return;
    try {
      const res = await fetch(`${API_BASE}/tickets/${id}/checklist/${editingItem}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editForm.status,
          completed_at: editForm.completed_at || null,
          evidence_note: editForm.evidence_note || null,
        }),
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      await fetchTicket();
      setEditingItem(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDownload = async () => {
    if (!ticket) return;
    try {
      const res = await fetch(`${API_BASE}/tickets/${id}/export`);
      if (!res.ok) throw new Error('Export thất bại');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Offboard checklist - ${ticket.employee_name} ${ticket.employee_id}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

  const startEditTicketInfo = () => {
    setTicketForm({
      employee_name: ticket.employee_name || '',
      employee_id: ticket.employee_id || '',
      email: ticket.email || '',
      position: ticket.position || '',
      manager: ticket.manager || '',
      last_working_day: ticket.last_working_day ? formatDate(ticket.last_working_day) : '',
      status: ticket.status || 'Chưa thực hiện',
    });
    setEditingTicketInfo(true);
  };

  const cancelEditTicketInfo = () => {
    setEditingTicketInfo(false);
  };

  const saveTicketInfo = async () => {
    try {
      const payload = {
        ...ticketForm,
        last_working_day: ticketForm.last_working_day || null,
      };
      const res = await fetch(`${API_BASE}/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Cập nhật thông tin thất bại');
      await fetchTicket();
      setEditingTicketInfo(false);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!ticket) return null;

  const groupedChecklist = (ticket.checklist || []).reduce((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className={styles.wrapper}>
      <div className={styles.breadcrumb}>
        <Link to="/">Danh sách</Link>
        <span>/</span>
        <span>Offboard checklist - {ticket.employee_name} {ticket.employee_id}</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Thông tin nhân viên</h2>
          <div className={styles.headerActions}>
            {editingTicketInfo ? (
              <>
                <button type="button" className={styles.btnSaveInfo} onClick={saveTicketInfo}>
                  Lưu
                </button>
                <button type="button" className={styles.btnCancelInfo} onClick={cancelEditTicketInfo}>
                  Hủy
                </button>
                <button type="button" className={styles.downloadBtn} onClick={handleDownload}>
                  Tải file Excel .xlsx
                </button>
              </>
            ) : (
              <>
                <button type="button" className={styles.btnEditInfo} onClick={startEditTicketInfo}>
                  Sửa
                </button>
                <button type="button" className={styles.downloadBtn} onClick={handleDownload}>
                  Tải file Excel .xlsx
                </button>
              </>
            )}
          </div>
        </div>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Họ và tên</span>
            {editingTicketInfo ? (
              <input
                type="text"
                value={ticketForm.employee_name}
                onChange={(e) => setTicketForm((f) => ({ ...f, employee_name: e.target.value }))}
                className={styles.infoInput}
              />
            ) : (
              <span>{ticket.employee_name}</span>
            )}
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>ID</span>
            {editingTicketInfo ? (
              <input
                type="text"
                value={ticketForm.employee_id}
                onChange={(e) => setTicketForm((f) => ({ ...f, employee_id: e.target.value }))}
                className={styles.infoInput}
              />
            ) : (
              <span>{ticket.employee_id}</span>
            )}
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email</span>
            {editingTicketInfo ? (
              <input
                type="email"
                value={ticketForm.email}
                onChange={(e) => setTicketForm((f) => ({ ...f, email: e.target.value }))}
                className={styles.infoInput}
              />
            ) : (
              <span>{ticket.email}</span>
            )}
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Vị trí</span>
            {editingTicketInfo ? (
              <input
                type="text"
                value={ticketForm.position}
                onChange={(e) => setTicketForm((f) => ({ ...f, position: e.target.value }))}
                className={styles.infoInput}
              />
            ) : (
              <span>{ticket.position || '—'}</span>
            )}
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Manager</span>
            {editingTicketInfo ? (
              <input
                type="text"
                value={ticketForm.manager}
                onChange={(e) => setTicketForm((f) => ({ ...f, manager: e.target.value }))}
                className={styles.infoInput}
              />
            ) : (
              <span>{ticket.manager || '—'}</span>
            )}
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Ngày làm việc cuối cùng</span>
            {editingTicketInfo ? (
              <input
                type="date"
                value={ticketForm.last_working_day}
                onChange={(e) => setTicketForm((f) => ({ ...f, last_working_day: e.target.value }))}
                className={styles.infoInput}
              />
            ) : (
              <span>{ticket.last_working_day ? new Date(ticket.last_working_day).toLocaleDateString('vi-VN') : '—'}</span>
            )}
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Trạng thái ticket</span>
            {editingTicketInfo ? (
              <select
                value={ticketForm.status}
                onChange={(e) => setTicketForm((f) => ({ ...f, status: e.target.value }))}
                className={styles.infoInput}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <span className={STATUS_CLASS[ticket.status] || styles.statusPending}>{ticket.status}</span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Checklist offboard</h2>
        <p className={styles.sectionDesc}>
          Cập nhật trạng thái, ngày hoàn tất và ghi chú cho từng hạng mục. Trạng thái có thể tự cập nhật khi điền Ngày hoàn tất và Evidence / Ghi chú.
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Hạng mục</th>
                <th>Công việc</th>
                <th className={styles.statusCol}>Trạng thái</th>
                <th>Ngày hoàn tất</th>
                <th>Evidence / Ghi chú</th>
                <th className={styles.colAction}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedChecklist).map(([category, items]) =>
                items.map((item, idx) => (
                  <tr key={item.id}>
                    {idx === 0 && (
                      <td rowSpan={items.length} className={styles.categoryCell}>
                        {category}
                      </td>
                    )}
                    <td className={styles.taskCell}>{item.task}</td>
                    {editingItem === item.id ? (
                      <>
                        <td className={styles.statusCell}>
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                            className={styles.input}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="date"
                            value={editForm.completed_at}
                            onChange={(e) => setEditForm((f) => ({ ...f, completed_at: e.target.value }))}
                            className={styles.input}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={editForm.evidence_note}
                            onChange={(e) => setEditForm((f) => ({ ...f, evidence_note: e.target.value }))}
                            placeholder="Ghi chú / Evidence"
                            className={styles.input}
                          />
                        </td>
                        <td className={styles.colAction}>
                          <div className={styles.actionGroup}>
                            <button type="button" className={styles.btnSave} onClick={saveItem}>Lưu</button>
                            <button type="button" className={styles.btnCancel} onClick={cancelEdit}>Hủy</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className={styles.statusCell}>
                          <span className={STATUS_CLASS[item.status] || styles.statusPending}>
                            {item.status}
                          </span>
                        </td>
                        <td>{item.completed_at ? new Date(item.completed_at).toLocaleDateString('vi-VN') : '—'}</td>
                        <td className={styles.noteCell}>{item.evidence_note || '—'}</td>
                        <td className={styles.colAction}>
                          <button type="button" className={styles.btnEdit} onClick={() => startEdit(item)}>
                            Sửa
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
