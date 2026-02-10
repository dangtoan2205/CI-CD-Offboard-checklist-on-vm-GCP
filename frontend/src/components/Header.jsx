import { useState } from 'react';
import { Link } from 'react-router-dom';
import CreateTicketModal from './CreateTicketModal';
import styles from './Header.module.css';
import { useAuth } from '../context/AuthContext';

const API_BASE = '/api';

export default function Header() {
  const [modalOpen, setModalOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleCreated = () => {
    setModalOpen(false);
    window.dispatchEvent(new CustomEvent('ticket-created'));
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logoLink}>
          <h1 className={styles.logo}>Offboard Checklist</h1>
        </Link>
        <div className={styles.actions}>
          {user ? (
            <>
              <Link to="/admin/users" className={styles.navLink}>
                Quản lý Admin
              </Link>
              <button
                type="button"
                className={styles.createBtn}
                onClick={() => setModalOpen(true)}
              >
                + Tạo ticket Offboard
              </button>
              <div className={styles.userBox}>
                <span className={styles.userName}>{user?.name || user?.email}</span>
                <button type="button" className={styles.logoutBtn} onClick={logout}>
                  Đăng xuất
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className={styles.loginLink}>
              Admin đăng nhập
            </Link>
          )}
        </div>
      </div>
      {user && (
        <CreateTicketModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
          apiBase={API_BASE}
        />
      )}
    </header>
  );
}
