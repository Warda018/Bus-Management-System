# BUS STOP MANAGEMENT SYSTEM (BSMS)

---

## 📋 PROJECT OVERVIEW

The **Bus Stop Management System (BSMS)** is a comprehensive web-based application designed to streamline and manage bus transport operations. This system provides an all-in-one solution for managing buses, drivers, routes, schedules, tickets, payments, and real-time bus tracking. Built with modern web technologies, it offers role-based access control for Admin, Driver, and Passenger users.

---

## 👨‍💻 DEVELOPER INFORMATION

| Field | Details |
|-------|---------|
| **Name** | WARDA SALIUM ABDI |
| **Institution** | Mzumbe University |
| **Programme** | Bachelor of Science in Information Technology Systems (BSc ITS) |
| **Registration Number** | 14322027/T.24 |
| **Project Title** | Bus Stop Management System (BSMS) |
| **Year** | 2026 |

---

## 🚀 FEATURES

### Core Features
- ✅ User Authentication - Secure login and registration system
- ✅ Role-Based Access Control - Different permissions for Admin, Driver, and Passenger
- ✅ Dashboard Analytics - Real-time statistics with interactive charts
- ✅ Bus Management - Add, edit, delete, and search buses
- ✅ Driver Management - Manage driver information and licenses
- ✅ Route Management - Create and manage bus routes
- ✅ Schedule Management - Set departure and arrival times
- ✅ Ticket Booking - Online ticket reservation with seat selection
- ✅ Payment Integration - Multiple payment methods (Cash, M-Pesa, TigoPesa, Airtel Money, Bank)
- ✅ Live Bus Tracking - Real-time bus location updates
- ✅ Announcements - Post and view system announcements
- ✅ Reports Generation - Generate various reports (PDF/Print)
- ✅ Profile Management - Update profile and change password

### Security Features
- 🔒 Password hashing (bcrypt)
- 🔒 SQL injection prevention (Prepared Statements)
- 🔒 Session-based authentication
- 🔒 Role-based access control
- 🔒 XSS protection

---

## 📁 SYSTEM ARCHITECTURE

### File Structure

Bus-Stop-Management-System/
├── index.html # Frontend interface (Landing page + Dashboard)
├── style.css # Complete styling and responsive design
├── script.js # Client-side logic and AJAX requests
└── system.php # Backend API and database operations


### Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla JS) |
| **Backend** | PHP 7.4+ |
| **Database** | MySQL 5.7+ |
| **Libraries** | Chart.js, Font Awesome 6, Google Fonts (Inter) |
| **Server** | Apache (XAMPP/WAMP/LAMP) |

---

## 🗄️ DATABASE SCHEMA

### Database Name: `bsms_db`

### Tables Structure

| Table | Description |
|-------|-------------|
| `users` | User accounts (Admin, Driver, Passenger) |
| `bus_stops` | Bus stop locations |
| `buses` | Bus fleet information |
| `drivers` | Driver details and licenses |
| `routes` | Bus routes with origin/destination |
| `bus_assignments` | Assignment of buses to drivers and routes |
| `schedules` | Bus departure and arrival schedules |
| `bus_tracking` | Real-time bus location tracking |
| `passengers` | Passenger information |
| `tickets` | Ticket booking records |
| `payments` | Payment transactions |
| `announcements` | System announcements |
| `reports` | Generated reports log |

---

## 🔧 INSTALLATION GUIDE

### Prerequisites

1. **XAMPP** (or any local server with PHP and MySQL)
   - Download from: https://www.apachefriends.org/
   - Version: PHP 7.4+ and MySQL 5.7+

2. **Web Browser** (Chrome, Firefox, Edge recommended)

### Step-by-Step Installation

#### STEP 1: Install XAMPP
```bash
# Download and install XAMPP from official website
# Default installation path: C:\xampp\

STEP 2: Start XAMPP Services
# Open XAMPP Control Panel
# Start Apache and MySQL services
# Ensure both show green indicators

STEP 3: Create Project Folder

# Navigate to XAMPP htdocs folder
cd C:\xampp\htdocs\

# Create project folder
mkdir Bus-Stop-Management-System

# Copy all four files into this folder:
# - index.html
# - style.css
# - script.js
# - system.php

STEP 4: Create Database


STEP 5: Run Database Schema

Copy and run this SQL in phpMyAdmin:

CREATE DATABASE bsms_db;
USE bsms_db;

-- Users Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin','Driver','Passenger') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Bus Stops Table
CREATE TABLE bus_stops (
    stop_id INT AUTO_INCREMENT PRIMARY KEY,
    stop_name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Buses Table
CREATE TABLE buses (
    bus_id INT AUTO_INCREMENT PRIMARY KEY,
    bus_number VARCHAR(50) UNIQUE NOT NULL,
    bus_name VARCHAR(100) NOT NULL,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    status ENUM('Available','On Route','Maintenance','Inactive') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Drivers Table
CREATE TABLE drivers (
    driver_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    license_number VARCHAR(100) UNIQUE NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Routes Table
CREATE TABLE routes (
    route_id INT AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    distance_km DECIMAL(10,2),
    estimated_time VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bus Assignments Table
CREATE TABLE bus_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    driver_id INT NOT NULL,
    route_id INT NOT NULL,
    assigned_date DATE NOT NULL,
    FOREIGN KEY (bus_id) REFERENCES buses(bus_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE
);



-- Schedules Table
CREATE TABLE schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    route_id INT NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    schedule_date DATE NOT NULL,
    FOREIGN KEY (bus_id) REFERENCES buses(bus_id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE
);



-- Bus Tracking Table
CREATE TABLE bus_tracking (
    tracking_id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    current_location VARCHAR(255),
    current_status ENUM('Waiting','Departed','Arrived','Delayed','Cancelled') DEFAULT 'Waiting',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(bus_id) ON DELETE CASCADE
);



-- Passengers Table
CREATE TABLE passengers (
    passenger_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Tickets Table
CREATE TABLE tickets (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    passenger_id INT NOT NULL,
    bus_id INT NOT NULL,
    route_id INT NOT NULL,
    seat_number VARCHAR(20),
    amount DECIMAL(10,2),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (passenger_id) REFERENCES passengers(passenger_id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES buses(bus_id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE
);



-- Payments Table
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Cash','M-Pesa','TigoPesa','AirtelMoney','Bank'),
    payment_status ENUM('Pending','Completed','Failed') DEFAULT 'Pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
);



-- Announcements Table
CREATE TABLE announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    posted_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by) REFERENCES users(user_id) ON DELETE SET NULL
);



-- Reports Table
CREATE TABLE reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100),
    generated_by INT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

 HOW TO USE THE SYSTEM
For All Users
1. Landing Page Navigation
Click navigation links to view different sections

Login - Access your account

Register - Create new account

2. Dashboard Access
After login, you'll see the main dashboard

Sidebar menu shows modules based on your role

Click any menu item to access that module

For Admin Users
Managing Users
Go to Users module

Click Add User to create new user

Fill in user details and select role

Click Save to add

Managing Buses
Go to Buses module

Click Add Bus to register new bus

Enter bus number, name, registration, capacity

Set status (Available/On Route/Maintenance/Inactive)

Managing Drivers
Go to Drivers module

Click Add Driver to register driver

Enter personal and license information

Managing Routes
Go to Routes module

Click Add Route

Set origin, destination, distance, estimated time

Creating Schedules
Go to Schedules module

Click Add Schedule

Select bus, route, departure/arrival time, date

Viewing Reports
Go to Reports module

Click on desired report type

Use filters to customize report

Print or save as PDF

For Driver Users
Updating Bus Location
Go to Live Tracking module

Find your assigned bus

Click Update Location

Enter current location and status

Viewing Schedules
Go to Schedules module

View your daily routes and timings

For Passenger Users
Booking Tickets
Go to Tickets module

Click Book Ticket

Select bus, route, seat number

Enter passenger details

Choose payment method

Complete booking

Viewing Tickets
Go to Tickets module

View all your booked tickets

Click View to see details

Click Cancel to cancel (if needed)

🛠️ API ENDPOINTS
Endpoint	Method	Description
?action=login	POST	User authentication
?action=register	POST	New user registration
?action=check_session	GET	Check login status
?action=logout	GET	User logout
?action=dashboard_stats	GET	Dashboard statistics
?action=landing_stats	GET	Landing page stats
?action=get_users	GET	List all users
?action=get_buses	GET	List all buses
?action=get_drivers	GET	List all drivers
?action=get_routes	GET	List all routes
?action=get_tickets	GET	List all tickets
?action=book_ticket	POST	Book new ticket
?action=get_announcements	GET	List announcements
?action=generate_report	GET	Generate report
🐛 TROUBLESHOOTING
Common Issues and Solutions
Problem	Solution
White screen / Nothing loads	Check XAMPP Apache is running; Access via http://localhost/ not file://
CSS not loading	Clear browser cache (Ctrl+Shift+R); Check file paths
Login fails	Verify database credentials; Check if admin user exists
Database connection error	Start MySQL in XAMPP; Check db credentials in system.php
404 errors	Ensure all 4 files are in correct folder; Check folder name spelling
Session not working	Restart Apache; Clear browser cookies
AJAX errors	Check browser console (F12) for specific errors
Debugging Steps
Open Browser Console (F12 → Console tab)

Check Network tab for failed requests

Enable PHP error reporting in system.php:

php
error_reporting(E_ALL);
ini_set('display_errors', 1);
📊 SYSTEM REQUIREMENTS
Minimum Requirements
Component	Requirement
CPU	1.0 GHz or higher
RAM	512 MB minimum (1 GB recommended)
Storage	100 MB free space
OS	Windows 7+, macOS 10.13+, Linux
Browser	Chrome 80+, Firefox 75+, Edge 80+
Recommended Requirements
Component	Recommendation
CPU	2.0 GHz or higher
RAM	2 GB or higher
Storage	500 MB free space
Internet	Broadband connection
Browser	Latest version of Chrome/Firefox
📝 PROJECT STATUS
Aspect	Status
Frontend Development	✅ Complete
Backend API	✅ Complete
Database Design	✅ Complete
Authentication	✅ Complete
Role-Based Access	✅ Complete
CRUD Operations	✅ Complete
Reporting	✅ Complete
Responsive Design	✅ Complete
Testing	✅ Complete
Documentation	✅ Complete
🤝 SUPPORT
For technical support or questions:

Contact Method	Details
Email	bsms@mzumbe.ac.tz
Phone	+255 123 456 789
Location	Mzumbe University, Morogoro, Tanzania
📄 LICENSE
This project is developed for academic purposes at Mzumbe University. All rights reserved.

🙏 ACKNOWLEDGMENTS
Mzumbe University - For academic support

Bachelor of Science in Information Technology Systems (BSc ITS) Programme

All project supervisors and mentors

📌 IMPORTANT NOTES
Always backup your database before making major changes

Change default admin password after first login

Use strong passwords for all user accounts

Regularly backup the entire project folder

Keep XAMPP updated to latest version for security patches

🎯 FUTURE ENHANCEMENTS
Mobile application (Android/iOS)

SMS notifications

Email confirmation for bookings

QR code tickets

GPS integration for real tracking

Multi-language support

Advanced analytics dashboard

Export to Excel/CSV

Online payment gateway integration

📁 FILE LIST
Make sure you have these 4 files in your folder:

text
1. index.html    - Main frontend file
2. style.css     - All styling
3. script.js     - JavaScript functions
4. system.php    - PHP backend API
✅ FINAL CHECKLIST BEFORE RUNNING
XAMPP installed and running (Apache + MySQL green)

Folder named Bus-Stop-Management-System in C:\xampp\htdocs\

All 4 files copied to the folder

Database bsms_db created in phpMyAdmin
All SQL tables created successfully
Admin user inserted into database
Access via http://localhost/Bus-Stop-Management-System/
Login with admin / admin123
© 2026 Bus Stop Management System | Developed by WARDA SALIUM ABDI | Mzumbe University
