import { useState } from 'react';
import { Link } from 'react-router-dom';
import CreateTicketModal from './CreateTicketModal';
import styles from './Header.module.css';

const API_BASE = '/api';

export default function Header() {
  const [modalOpen, setModalOpen] = useState(false);

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
        <button
          type="button"
          className={styles.createBtn}
          onClick={() => setModalOpen(true)}
        >
          + Tạo ticket Offboard
        </button>
      </div>
      <CreateTicketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
        apiBase={API_BASE}
      />
    </header>
  );
}
