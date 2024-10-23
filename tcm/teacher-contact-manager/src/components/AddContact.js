import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddContact = () => {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [department, setDepartment] = useState('');
  const [cgpa, setCgpa] = useState(''); // New field for CGPA
  const [idCard, setIdCard] = useState(null); // File upload for ID card
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setIdCard(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('rollNo', rollNo);
    formData.append('phoneNo', phoneNo);
    formData.append('yearOfStudy', yearOfStudy);
    formData.append('department', department);
    formData.append('cgpa', cgpa);
    formData.append('idCard', idCard); // Appending file to FormData
    
    try {
      const response = await axios.post('http://localhost:5000/add-contact', formData, {
        headers: {
          Authorization: token,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Error adding contact');
    }
  };

  const handleViewContacts = () => {
    navigate('/view-contacts');
  };

  return (
    <div>
      <h2>Add Student Contact</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Roll No</label>
          <input type="text" value={rollNo} onChange={(e) => setRollNo(e.target.value)} required />
        </div>
        <div>
          <label>Phone No</label>
          <input type="text" value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)} required />
        </div>
        <div>
          <label>Year of Study</label>
          <input type="number" value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)} required />
        </div>
        <div>
          <label>Department</label>
          <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} required />
        </div>
        <div>
          <label>CGPA</label> {/* New field for CGPA */}
          <input type="text" value={cgpa} onChange={(e) => setCgpa(e.target.value)} required />
        </div>
        <div>
          <label>Upload ID Card</label> {/* File upload for ID card */}
          <input type="file" onChange={handleFileChange} accept="image/*" required />
        </div>
        <button type="submit">Add Contact</button>
      </form>
      {message && <p>{message}</p>}
      
      <button onClick={handleViewContacts}>View Contacts</button>
    </div>
  );
};

export default AddContact;
