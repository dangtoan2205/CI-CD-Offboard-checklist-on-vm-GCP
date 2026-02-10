import { useEffect, useState } from 'react';
import styles from './AdminUsers.module.css';

const API_BASE = '/api';

const ROLE_OPTIONS = ['admin'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createForm, setCreateForm] = useState({
    email: '',
    name: '',
    password: '',
    role: 'admin',
    active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    email: '',
    name: '',
    password: '',
    role: 'admin',
    active: true,
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/users`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không tải được danh sách admin');
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({
      email: user.email,
      name: user.name || '',
      password: '',
      role: user.role,
      active: user.active,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ email: '', name: '', password: '', role: 'admin', active: true });
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tạo admin thất bại');
      setCreateForm({ email: '', name: '', password: '', role: 'admin', active: true });
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitEdit = async (id) => {
    setError('');
    try {
      const payload = {
        email: editForm.email,
        name: editForm.name,
        role: editForm.role,
        active: editForm.active,
      };
      if (editForm.password) payload.password = editForm.password;
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại');
      cancelEdit();
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa admin này?')) return;
    setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xóa thất bại');
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải admin...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2>Quản lý Admin</h2>
        <p>Tạo, cập nhật và xóa tài khoản admin.</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form className={styles.card} onSubmit={submitCreate}>
        <h3>Tạo admin mới</h3>
        <div className={styles.grid}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={createForm.email}
              onChange={handleCreateChange}
              required
            />
          </label>
          <label>
            Tên hiển thị
            <input
              type="text"
              name="name"
              value={createForm.name}
              onChange={handleCreateChange}
              placeholder="Admin"
            />
          </label>
          <label>
            Mật khẩu
            <input
              type="password"
              name="password"
              value={createForm.password}
              onChange={handleCreateChange}
              required
            />
          </label>
          <label>
            Vai trò
            <select name="role" value={createForm.role} onChange={handleCreateChange}>
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              name="active"
              checked={createForm.active}
              onChange={handleCreateChange}
            />
            Kích hoạt
          </label>
        </div>
        <button type="submit" className={styles.primaryBtn}>Tạo admin</button>
      </form>

      <div className={styles.card}>
        <h3>Danh sách admin</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Tên</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.empty}>Chưa có admin nào.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    {editingId === user.id ? (
                      <>
                        <td>
                          <input
                            type="email"
                            name="email"
                            value={editForm.email}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>
                          <select name="role" value={editForm.role} onChange={handleEditChange}>
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <label className={styles.checkboxInline}>
                            <input
                              type="checkbox"
                              name="active"
                              checked={editForm.active}
                              onChange={handleEditChange}
                            />
                            {editForm.active ? 'Hoạt động' : 'Tạm khóa'}
                          </label>
                        </td>
                        <td className={styles.actions}>
                          <input
                            type="password"
                            name="password"
                            value={editForm.password}
                            onChange={handleEditChange}
                            placeholder="Mật khẩu mới (nếu cần)"
                            className={styles.passwordInput}
                          />
                          <button type="button" className={styles.primaryBtn} onClick={() => submitEdit(user.id)}>
                            Lưu
                          </button>
                          <button type="button" className={styles.ghostBtn} onClick={cancelEdit}>
                            Hủy
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{user.email}</td>
                        <td>{user.name || '-'}</td>
                        <td>{user.role}</td>
                        <td>{user.active ? 'Hoạt động' : 'Tạm khóa'}</td>
                        <td className={styles.actions}>
                          <button type="button" className={styles.ghostBtn} onClick={() => startEdit(user)}>
                            Sửa
                          </button>
                          <button type="button" className={styles.dangerBtn} onClick={() => handleDelete(user.id)}>
                            Xóa
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
