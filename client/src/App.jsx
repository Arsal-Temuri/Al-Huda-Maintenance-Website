import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SubmitRequest from './pages/SubmitRequest';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import History from './pages/History';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<SubmitRequest />} />
        <Route path='/login' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/history' element={<History />} />
      </Routes>
    </Router>
  );
}

export default App;
