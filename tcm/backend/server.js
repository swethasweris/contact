const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/TeacherContactsDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Teacher schema and model
const teacherSchema = new mongoose.Schema({
  username: String,
  password: String
});
const Teacher = mongoose.model('Teacher', teacherSchema);

// Student schema and model
const studentSchema = new mongoose.Schema({
  name: String,
  rollNo: String,
  phoneNo: String,
  yearOfStudy: Number,
  department: String,
  cgpa: Number, // New field for CGPA
  idCard: String, // New field for ID card image URL
  lastUpdated: { type: Date, default: Date.now }
});
const Student = mongoose.model('Student', studentSchema);

// Configure storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // directory where the files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // unique filename
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Only images and PDFs are allowed');
    }
  }
});

// Register route
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newTeacher = new Teacher({ username, password: hashedPassword });
    await newTeacher.save();
    res.json({ message: 'Teacher registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering teacher', error });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const teacher = await Teacher.findOne({ username });
    if (!teacher || !(await bcrypt.compare(password, teacher.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: teacher._id }, 'your_jwt_secret');
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });
  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) return res.status(500).json({ message: 'Failed to authenticate token' });
    req.teacherId = decoded.id;
    next();
  });
};

// Add contact route
app.post('/add-contact', verifyToken, upload.single('idCard'), async (req, res) => {
  try {
    const { name, rollNo, phoneNo, yearOfStudy, department, cgpa } = req.body;
    const idCard = req.file ? req.file.path : ''; // Get the file path
    const newStudent = new Student({
      name, rollNo, phoneNo, yearOfStudy, department, cgpa, idCard
    });
    await newStudent.save();
    res.json({ message: 'Contact added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding contact', error });
  }
});

// View contacts route
app.get('/view-contacts', verifyToken, async (req, res) => {
  try {
    const students = await Student.find().sort({ cgpa: -1 }); // Sort by CGPA descending
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts', error });
  }
});

// Edit contact route
app.put('/edit-contact/:id', verifyToken, async (req, res) => {
  try {
    const { name, rollNo, phoneNo, department, cgpa } = req.body; // Exclude yearOfStudy
    const student = await Student.findById(req.params.id);
    student.name = name;
    student.rollNo = rollNo;
    student.phoneNo = phoneNo;
    student.department = department;
    student.cgpa = cgpa; // Update CGPA
    await student.save();
    res.json({ message: 'Contact updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating contact', error });
  }
});

// Delete contact route
app.delete('/delete-contact/:id', verifyToken, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact', error });
  }
});

// Auto-update student year of study
const updateStudentYears = async () => {
  const students = await Student.find();
  const currentDate = new Date();

  students.forEach(async (student) => {
    const lastUpdated = new Date(student.lastUpdated);
    const differenceInYears = (currentDate - lastUpdated) / (1000 * 60 * 60 * 24 * 365);

    // Check if the student is eligible for year increment and that the year is less than 4
    if (differenceInYears >= 1 && student.yearOfStudy < 4) {
      student.yearOfStudy += Math.floor(differenceInYears);

      // Ensure that yearOfStudy doesn't go beyond 4
      if (student.yearOfStudy > 4) {
        student.yearOfStudy = 4;
      }

      student.lastUpdated = currentDate;
      await student.save();
    }
  });
};

// Schedule the update function to run daily
setInterval(updateStudentYears, 24 * 60 * 60 * 1000); // Runs daily

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(5000, () => console.log('Server running on port 5000'));
