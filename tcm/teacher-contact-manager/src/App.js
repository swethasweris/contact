import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import AddContact from './components/AddContact';
import ViewContacts from './components/ViewContacts';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/register" />} />  {/* Default route */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/add-contact" element={<AddContact />} />
          <Route path="/view-contacts" element={<ViewContacts />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
