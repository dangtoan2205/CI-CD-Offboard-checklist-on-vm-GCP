import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TicketList />} />
          <Route path="ticket/:id" element={<TicketDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
