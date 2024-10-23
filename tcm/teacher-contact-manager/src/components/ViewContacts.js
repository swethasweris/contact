import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [message, setMessage] = useState('');
  const [editContactId, setEditContactId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    rollNo: '',
    phoneNo: '',
    department: ''
  });

  const fetchContacts = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/view-contacts', {
        headers: { Authorization: token }
      });
      setContacts(response.data);
    } catch (error) {
      setMessage('Error fetching contacts');
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/delete-contact/${id}`, {
        headers: { Authorization: token }
      });
      setMessage('Contact deleted');
      fetchContacts(); // Refresh the list
    } catch (error) {
      setMessage('Error deleting contact');
    }
  };

  const handleEditClick = (contact) => {
    setEditContactId(contact._id);
    setEditFormData({
      name: contact.name,
      rollNo: contact.rollNo,
      phoneNo: contact.phoneNo,
      department: contact.department
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  };

  const handleEditSubmit = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/edit-contact/${id}`, editFormData, {
        headers: { Authorization: token }
      });
      setMessage('Contact updated successfully');
      setEditContactId(null); // Close edit form after submission
      fetchContacts(); // Refresh the list
    } catch (error) {
      setMessage('Error updating contact');
    }
  };

  const rankContacts = (contacts) => {
    // Create a ranking based on CGPA
    return contacts.map((contact) => ({
      ...contact,
      rank: 0 // Initialize rank
    })).sort((a, b) => b.cgpa - a.cgpa).map((contact, index) => ({
      ...contact,
      rank: index + 1
    }));
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div>
      <h2>Student Contacts</h2>
      {contacts.length > 0 ? (
        rankContacts(contacts).map((contact) => (
          <div key={contact._id}>
            {editContactId === contact._id ? (
              // Edit form for the selected contact
              <div>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  placeholder="Name"
                />
                <input
                  type="text"
                  name="rollNo"
                  value={editFormData.rollNo}
                  onChange={handleEditChange}
                  placeholder="Roll No"
                />
                <input
                  type="text"
                  name="phoneNo"
                  value={editFormData.phoneNo}
                  onChange={handleEditChange}
                  placeholder="Phone No"
                />
                <input
                  type="text"
                  name="department"
                  value={editFormData.department}
                  onChange={handleEditChange}
                  placeholder="Department"
                />
                <button onClick={() => handleEditSubmit(contact._id)}>Save</button>
                <button onClick={() => setEditContactId(null)}>Cancel</button>
              </div>
            ) : (
              // Display contact details
              <div>
                <p>Name: {contact.name}</p>
                <p>Roll No: {contact.rollNo}</p>
                <p>Phone No: {contact.phoneNo}</p>
                <p>Year of Study: {contact.yearOfStudy}</p>
                <p>Department: {contact.department}</p>
                <p>CGPA: {contact.cgpa}</p> {/* Display CGPA */}
                <p>Rank: {contact.rank}</p> {/* Display rank */}
                {contact.idCard && ( // Display ID card if available
                  <div>
                    <p>ID Card:</p>
                    <img 
                      src={`http://localhost:5000/uploads/${contact.idCard}`} // Adjust the path as per your backend
                      alt={`${contact.name}'s ID Card`}
                      style={{ width: '100px', height: 'auto' }}
                    />
                  </div>
                )}
                <button onClick={() => handleEditClick(contact)}>Edit</button>
                <button onClick={() => handleDelete(contact._id)}>Delete</button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No contacts available.</p>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default ViewContacts;
