<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

session_start();

// Database configuration - inalingana na database yako
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'bsms_db');

class Database {
    private $connection;
    
    public function __construct() {
        $this->connect();
    }
    
    private function connect() {
        $this->connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
        if ($this->connection->connect_error) {
            die(json_encode(['error' => 'Database connection failed: ' . $this->connection->connect_error]));
        }
        
        $this->connection->set_charset("utf8mb4");
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    public function prepare($sql) {
        return $this->connection->prepare($sql);
    }
    
    public function escapeString($string) {
        return $this->connection->real_escape_string($string);
    }
    
    public function query($sql) {
        return $this->connection->query($sql);
    }
    
    public function insertId() {
        return $this->connection->insert_id;
    }
    
    public function beginTransaction() {
        $this->connection->begin_transaction();
    }
    
    public function commit() {
        $this->connection->commit();
    }
    
    public function rollback() {
        $this->connection->rollback();
    }
}

class BSMS {
    private $db;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }
    
    // ==================== AUTHENTICATION ====================
    public function login($username, $password) {
        $stmt = $this->db->prepare("SELECT user_id, full_name, username, email, role, password FROM users WHERE username = ? OR email = ?");
        $stmt->bind_param("ss", $username, $username);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            if (password_verify($password, $row['password'])) {
                $_SESSION['user_id'] = $row['user_id'];
                $_SESSION['full_name'] = $row['full_name'];
                $_SESSION['username'] = $row['username'];
                $_SESSION['email'] = $row['email'];
                $_SESSION['role'] = $row['role'];
                
                return ['success' => true, 'user' => [
                    'user_id' => $row['user_id'],
                    'full_name' => $row['full_name'],
                    'username' => $row['username'],
                    'email' => $row['email'],
                    'role' => $row['role']
                ]];
            }
        }
        
        return ['success' => false, 'message' => 'Invalid username or password'];
    }
    
    public function register($data) {
        // Check if username or email already exists
        $checkStmt = $this->db->prepare("SELECT user_id FROM users WHERE username = ? OR email = ?");
        $checkStmt->bind_param("ss", $data['username'], $data['email']);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            return ['success' => false, 'message' => 'Username or email already exists'];
        }
        
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $stmt = $this->db->prepare("INSERT INTO users (full_name, username, email, password, role) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $data['full_name'], $data['username'], $data['email'], $hashedPassword, $data['role']);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Registration successful! Please login.'];
        }
        
        return ['success' => false, 'message' => 'Registration failed: ' . $this->db->error];
    }
    
    public function checkSession() {
        if (isset($_SESSION['user_id'])) {
            return ['logged_in' => true, 'user' => [
                'user_id' => $_SESSION['user_id'],
                'full_name' => $_SESSION['full_name'],
                'username' => $_SESSION['username'],
                'email' => $_SESSION['email'],
                'role' => $_SESSION['role']
            ]];
        }
        return ['logged_in' => false];
    }
    
    public function logout() {
        session_destroy();
        return ['success' => true];
    }
    
    // ==================== DASHBOARD STATISTICS ====================
    public function getDashboardStats() {
        $stats = [];
        
        // Total buses
        $result = $this->db->query("SELECT COUNT(*) as count FROM buses");
        $stats['total_buses'] = $result->fetch_assoc()['count'];
        
        // Total drivers
        $result = $this->db->query("SELECT COUNT(*) as count FROM drivers");
        $stats['total_drivers'] = $result->fetch_assoc()['count'];
        
        // Total routes
        $result = $this->db->query("SELECT COUNT(*) as count FROM routes");
        $stats['total_routes'] = $result->fetch_assoc()['count'];
        
        // Total schedules
        $result = $this->db->query("SELECT COUNT(*) as count FROM schedules");
        $stats['total_schedules'] = $result->fetch_assoc()['count'];
        
        // Total passengers
        $result = $this->db->query("SELECT COUNT(*) as count FROM passengers");
        $stats['total_passengers'] = $result->fetch_assoc()['count'];
        
        // Total tickets
        $result = $this->db->query("SELECT COUNT(*) as count FROM tickets");
        $stats['total_tickets'] = $result->fetch_assoc()['count'];
        
        // Total revenue
        $result = $this->db->query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'Completed'");
        $stats['total_revenue'] = $result->fetch_assoc()['total'];
        
        // Active buses
        $result = $this->db->query("SELECT COUNT(*) as count FROM buses WHERE status = 'Available'");
        $stats['active_buses'] = $result->fetch_assoc()['count'];
        
        // Chart data for last 7 days
        $chartData = ['labels' => [], 'revenue' => [], 'tickets' => []];
        for ($i = 6; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $chartData['labels'][] = date('M d', strtotime($date));
            
            // Revenue
            $stmt = $this->db->prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE DATE(payment_date) = ? AND payment_status = 'Completed'");
            $stmt->bind_param("s", $date);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $chartData['revenue'][] = $row['total'] ?? 0;
            
            // Tickets
            $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM tickets WHERE DATE(booking_date) = ?");
            $stmt->bind_param("s", $date);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $chartData['tickets'][] = $row['count'] ?? 0;
        }
        
        $stats['chart_data'] = $chartData;
        
        return $stats;
    }
    
    public function getLandingStats() {
        $stats = [];
        
        $result = $this->db->query("SELECT COUNT(*) as count FROM buses WHERE status = 'Available'");
        $stats['active_buses'] = $result->fetch_assoc()['count'];
        
        $result = $this->db->query("SELECT COUNT(*) as count FROM drivers");
        $stats['total_drivers'] = $result->fetch_assoc()['count'];
        
        $result = $this->db->query("SELECT COUNT(*) as count FROM routes");
        $stats['total_routes'] = $result->fetch_assoc()['count'];
        
        $result = $this->db->query("SELECT COUNT(*) as count FROM passengers");
        $stats['total_passengers'] = $result->fetch_assoc()['count'];
        
        $result = $this->db->query("SELECT COUNT(*) as count FROM tickets");
        $stats['total_tickets'] = $result->fetch_assoc()['count'];
        
        $result = $this->db->query("SELECT COUNT(*) as count FROM tickets WHERE DATE(booking_date) = CURDATE()");
        $stats['today_tickets'] = $result->fetch_assoc()['count'];
        
        $result = $this->db->query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'Completed'");
        $stats['total_revenue'] = $result->fetch_assoc()['total'];
        
        return $stats;
    }
    
    public function getRecentActivities() {
        $activities = [];
        
        // Recent tickets
        $ticketsQuery = "SELECT t.ticket_id, p.full_name as passenger, b.bus_number, t.amount, t.booking_date as date 
                         FROM tickets t 
                         JOIN passengers p ON t.passenger_id = p.passenger_id 
                         JOIN buses b ON t.bus_id = b.bus_id 
                         ORDER BY t.booking_date DESC LIMIT 5";
        $result = $this->db->query($ticketsQuery);
        while ($row = $result->fetch_assoc()) {
            $row['icon'] = 'fa-ticket-alt';
            $row['message'] = "New ticket booked by {$row['passenger']} for bus {$row['bus_number']} - TZS " . number_format($row['amount']);
            $activities[] = $row;
        }
        
        // Recent payments
        $paymentsQuery = "SELECT p.payment_id, p.amount, p.payment_method, p.payment_date as date, p.payment_status
                          FROM payments p 
                          ORDER BY p.payment_date DESC LIMIT 5";
        $result = $this->db->query($paymentsQuery);
        while ($row = $result->fetch_assoc()) {
            $row['icon'] = 'fa-credit-card';
            $row['message'] = "Payment of TZS " . number_format($row['amount']) . " via {$row['payment_method']} - {$row['payment_status']}";
            $activities[] = $row;
        }
        
        // Sort by date
        usort($activities, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
        
        return array_slice($activities, 0, 10);
    }
    
    // ==================== USER MANAGEMENT ====================
    public function getUsers($page = 1, $search = '') {
        $limit = 10;
        $offset = ($page - 1) * $limit;
        
        $searchCondition = $search ? "WHERE full_name LIKE '%$search%' OR username LIKE '%$search%' OR email LIKE '%$search%'" : "";
        
        $countResult = $this->db->query("SELECT COUNT(*) as total FROM users $searchCondition");
        $total = $countResult->fetch_assoc()['total'];
        
        $query = "SELECT user_id, full_name, username, email, role, created_at FROM users $searchCondition ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
        $result = $this->db->query($query);
        
        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        
        return [
            'users' => $users,
            'total_pages' => ceil($total / $limit),
            'current_page' => $page,
            'total' => $total
        ];
    }
    
    public function getUser($id) {
        $stmt = $this->db->prepare("SELECT user_id, full_name, username, email, role FROM users WHERE user_id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
    
    public function addUser($data) {
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'Admin') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $stmt = $this->db->prepare("INSERT INTO users (full_name, username, email, password, role) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $data['full_name'], $data['username'], $data['email'], $hashedPassword, $data['role']);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'User added successfully'];
        }
        
        return ['success' => false, 'message' => 'Failed to add user: ' . $this->db->error];
    }
    
    public function updateUser($data) {
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'Admin') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        $stmt = $this->db->prepare("UPDATE users SET full_name = ?, username = ?, email = ?, role = ? WHERE user_id = ?");
        $stmt->bind_param("ssssi", $data['full_name'], $data['username'], $data['email'], $data['role'], $data['user_id']);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'User updated successfully'];
        }
        
        return ['success' => false, 'message' => 'Failed to update user'];
    }
    
    public function deleteUser($id) {
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'Admin') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        if ($id == $_SESSION['user_id']) {
            return ['success' => false, 'message' => 'Cannot delete your own account'];
        }
        
        $stmt = $this->db->prepare("DELETE FROM users WHERE user_id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'User deleted successfully'];
        }
        
        return ['success' => false, 'message' => 'Failed to delete user'];
    }
    
    // ==================== BUS MANAGEMENT ====================
    public function getAllBuses() {
        $result = $this->db->query("SELECT bus_id, bus_number, bus_name, capacity, status FROM buses ORDER BY bus_number");
        $buses = [];
        while ($row = $result->fetch_assoc()) {
            $buses[] = $row;
        }
        return $buses;
    }
    
    public function getBuses($page = 1, $search = '') {
        $limit = 10;
        $offset = ($page - 1) * $limit;
        
        $searchCondition = $search ? "WHERE bus_number LIKE '%$search%' OR bus_name LIKE '%$search%' OR registration_number LIKE '%$search%'" : "";
        
        $countResult = $this->db->query("SELECT COUNT(*) as total FROM buses $searchCondition");
        $total = $countResult->fetch_assoc()['total'];
        
        $query = "SELECT * FROM buses $searchCondition ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
        $result = $this->db->query($query);
        
        $buses = [];
        while ($row = $result->fetch_assoc()) {
            $buses[] = $row;
        }
        
        return [
            'buses' => $buses,
            'total_pages' => ceil($total / $limit),
            'current_page' => $page,
            'total' => $total
        ];
    }
    
    public function getBus($id) {
        $stmt = $this->db->prepare("SELECT * FROM buses WHERE bus_id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
    
    public function addBus($data) {
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'Admin') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        $stmt = $this->db->prepare("INSERT INTO buses (bus_number, bus_name, registration_number, capacity, status) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssis", $data['bus_number'], $data['bus_name'], $data['registration_number'], $data['capacity'], $data['status']);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Bus added successfully'];
        }
        
        return ['success' => false, 'message' => 'Failed to add bus: ' . $this->db->error];
    }
    
    public function updateBus($data) {
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'Admin') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        $stmt = $this->db->prepare("UPDATE buses SET bus_number = ?, bus_name = ?, registration_number = ?, capacity = ?, status = ? WHERE bus_id = ?");
        $stmt->bind_param("sssisi", $data['bus_number'], $data['bus_name'], $data['registration_number'], $data['capacity'], $data['status'], $data['bus_id']);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Bus updated successfully'];
        }
        
        return ['success' => false, 'message' => 'Failed to update bus'];
    }
    
    public function deleteBus($id) {
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'Admin') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        $stmt = $this->db->prepare("DELETE FROM buses WHERE bus_id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Bus deleted successfully'];
        }
        
        return ['success' => false, 'message' => 'Failed to delete bus'];
    }
    
    // ==================== DRIVER MANAGEMENT ====================
    public function getAllDrivers() {
        $result = $this->db->query("SELECT driver_id, full_name, phone, license_number FROM drivers ORDER BY full_name");
        $drivers = [];
        while ($row = $result->fetch_assoc()) {
            $drivers[] = $row;
        }
        return $drivers;
    }
    
    public function getDrivers($page = 1, $search = '') {
        $limit = 10;
        $offset = ($page - 1) * $limit;
        
        $searchCondition = $search ? "WHERE full_name LIKE '%$search%' OR phone LIKE '%$search%' OR license_number LIKE '%$search%'" : "";
        
        $countResult = $this->db->query("SELECT COUNT(*) as total FROM drivers $searchCondition");
        $total = $countResult->fetch_assoc()['total'];
        
        $query = "SELECT * FROM drivers $searchCondition ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
        $result = $this->db->query($query);
        
        $drivers = [];
        while ($row = $result->fetch_assoc()) {
            $drivers[] = $row;
        }
        
        return [
            'drivers' => $drivers,
            'total_pages' => ceil($total / $limit),
            'current_page' => $page,
            'total' => $total
        ];
    }
    
    public function getDriver($id) {
        $stmt = $this->db->prepare("SELECT * FROM drivers WHERE driver_id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
    
    public function addDriver($data) {
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'Admin') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        $stmt = $this->db->prepare("INSERT INTO drivers (full_name, phone, email, license_number, address) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $data['full_name'], $data['phone'], $data['email'], $data['license_number'], $data['address']);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Driver added successfully'];
        }
        
        return ['success' => false, 'message' => 'Failed to add driver'];
    }
    
    public function updateDriver($data) {
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'Admin') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        $stmt = $this->db->prepare("UPDATE drivers SET full_name = ?, phone = ?, email = ?, license_number = ?, address = ? WHERE driver_id = ?");
        $stmt->bind_param("sssssi", $data['full_name'], $data['phone'], $data['email'], $data['license_number'], $data['address'], $data['driver_id']);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Driver updated successfully'];
        }
        
        return ['success' => false, 'message' => 'Failed to update driver'];
    }
    
    public function deleteDriver($id) {
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'Admin') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        $stmt = $this->db->prepare("DELETE FROM drivers WHERE driver_id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Driver deleted successfully'];
        }
        
        return ['success' => false, 'message' => 'Failed to delete driver'];
    }
    
    // ==================== ROUTE MANAGEMENT ====================
    public function getAllRoutes() {
        $result = $this->db->query("SELECT route_id, route_name, origin, destination, distance_km FROM routes ORDER BY route_name");
        $routes = [];
        while ($row = $result->fetch_assoc()) {
            $routes[] = $row;
        }
        return $routes;
    }
    
    public function getRoutes($page = 1, $search = '') {
        $limit = 10;
        $offset = ($page - 1) * $limit;
        
        $searchCondition = $search ? "WHERE route_name LIKE '%$search%' OR origin LIKE '%$search%' OR destination LIKE '%$search%'" : "";
        
        $countResult = $this->db->query("SELECT COUNT(*) as total FROM routes $searchCondition");
        $total = $countResult->fetch_assoc()['total'];
        
        $query = "SELECT * FROM routes $searchCondition ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
        $result = $this->db->query($query);
        
        $routes = [];
        while ($row = $result->fetch_assoc()) {
            $routes[] = $row;
        }
        
        return [
            'routes' => $routes,
            'total_pages' => ceil($total / $limit),
            'current_page' => $page,
            'total' => $total
        ];
    }
    
    public function getRoute($id) {
        $stmt = $this->db->prepare("SELECT * FROM routes WHERE route_id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
    
    public function addRoute($data) {
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'Admin') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        $stmt = $this->db->prepare("INSERT INTO routes (route_name, origin, destination, distance_km, estimated_time) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssds", $data['route_name'], $data['origin'], $data['destination'], $data['distance_km'], $data['estimated_time']);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Route added successfully'];
        }
        
        return ['success' => false, 'message' => 'Failed to add route'];
    }
    
    public function updateRoute($data) {
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'Admin') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        $stmt = $this->db->prepare("UPDATE routes SET route_name = ?, origin = ?, destination = ?, distance_km = ?, estimated_time = ? WHERE route_id = ?");
        $stmt->bind_param("sssdsi", $data['route_name'], $data['origin'], $data['destination'], $data['distance_km'], $data['estimated_time'], $data['route_id']);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Route updated successfully'];
        }
        
        return ['success' => false, 'message' => 'Failed to update route'];
    }
    
    public function deleteRoute($id) {
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'Admin') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        $stmt = $this->db->prepare("DELETE FROM routes WHERE route_id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Route deleted successfully'];
        }
        
        return ['success' => false, 'message' => 'Failed to delete route'];
    }
    
    // ==================== BUS ASSIGNMENTS ====================
    public function getAssignments($page = 1, $search = '') {
        $limit = 10;
        $offset = ($page - 1) * $limit;
        
        $query = "SELECT a.*, b.bus_number, b.bus_name, d.full_name as driver_name, r.route_name 
                  FROM bus_assignments a 
                  JOIN buses b ON a.bus_id = b.bus_id 
                  JOIN drivers d ON a.driver_id = d.driver_id 
                  JOIN routes r ON a.route_id = r.route_id 
                  ORDER BY a.assigned_date DESC LIMIT $limit OFFSET $offset";
        
        $result = $this->db->query($query);
        
        $assignments = [];
        while ($row = $result->fetch_assoc()) {
            $assignments[] = $row;
        }
        
        $countResult = $this->db->query("SELECT COUNT(*) as total FROM bus_assignments");
        $total = $countResult->fetch_assoc()['total'];
        
        return [
            'assignments' => $assignments,
            'total_pages' => ceil($total / $limit),
            'current_page' => $page,
            'total' => $total
        ];
    }
    
    // ==================== SCHEDULES ====================
    public function getSchedules($page = 1, $search = '') {
        $limit = 10;
        $offset = ($page - 1) * $limit;
        
        $query = "SELECT s.*, b.bus_number, b.bus_name, r.route_name 
                  FROM schedules s 
                  JOIN buses b ON s.bus_id = b.bus_id 
                  JOIN routes r ON s.route_id = r.route_id 
                  ORDER BY s.schedule_date DESC, s.departure_time LIMIT $limit OFFSET $offset";
        
        $result = $this->db->query($query);
        
        $schedules = [];
        while ($row = $result->fetch_assoc()) {
            $schedules[] = $row;
        }
        
        $countResult = $this->db->query("SELECT COUNT(*) as total FROM schedules");
        $total = $countResult->fetch_assoc()['total'];
        
        return [
            'schedules' => $schedules,
            'total_pages' => ceil($total / $limit),
            'current_page' => $page,
            'total' => $total
        ];
    }
    
    // ==================== BUS TRACKING ====================
    public function getTracking() {
        $query = "SELECT t.*, b.bus_number, b.bus_name 
                  FROM bus_tracking t 
                  JOIN buses b ON t.bus_id = b.bus_id 
                  ORDER BY t.updated_at DESC";
        
        $result = $this->db->query($query);
        
        $tracking = [];
        while ($row = $result->fetch_assoc()) {
            $tracking[] = $row;
        }
        
        return ['tracking' => $tracking];
    }
    
    // ==================== PASSENGERS ====================
    public function getAllPassengers() {
        $result = $this->db->query("SELECT passenger_id, full_name, phone, email FROM passengers ORDER BY full_name");
        $passengers = [];
        while ($row = $result->fetch_assoc()) {
            $passengers[] = $row;
        }
        return $passengers;
    }
    
    public function getPassengers($page = 1, $search = '') {
        $limit = 10;
        $offset = ($page - 1) * $limit;
        
        $searchCondition = $search ? "WHERE full_name LIKE '%$search%' OR phone LIKE '%$search%' OR email LIKE '%$search%'" : "";
        
        $countResult = $this->db->query("SELECT COUNT(*) as total FROM passengers $searchCondition");
        $total = $countResult->fetch_assoc()['total'];
        
        $query = "SELECT * FROM passengers $searchCondition ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
        $result = $this->db->query($query);
        
        $passengers = [];
        while ($row = $result->fetch_assoc()) {
            $passengers[] = $row;
        }
        
        return [
            'passengers' => $passengers,
            'total_pages' => ceil($total / $limit),
            'current_page' => $page,
            'total' => $total
        ];
    }
    
    // ==================== TICKETS ====================
    public function getTickets($page = 1, $search = '') {
        $limit = 10;
        $offset = ($page - 1) * $limit;
        
        $query = "SELECT t.*, p.full_name as passenger_name, p.phone, p.email, b.bus_number, b.bus_name, r.route_name, r.origin, r.destination
                  FROM tickets t 
                  JOIN passengers p ON t.passenger_id = p.passenger_id 
                  JOIN buses b ON t.bus_id = b.bus_id 
                  JOIN routes r ON t.route_id = r.route_id
                  ORDER BY t.booking_date DESC LIMIT $limit OFFSET $offset";
        
        $result = $this->db->query($query);
        
        $tickets = [];
        while ($row = $result->fetch_assoc()) {
            $tickets[] = $row;
        }
        
        $countResult = $this->db->query("SELECT COUNT(*) as total FROM tickets");
        $total = $countResult->fetch_assoc()['total'];
        
        return [
            'tickets' => $tickets,
            'total_pages' => ceil($total / $limit),
            'current_page' => $page,
            'total' => $total
        ];
    }
    
    public function getTicket($id) {
        $stmt = $this->db->prepare("SELECT t.*, p.full_name as passenger_name, p.phone, p.email, b.bus_number, b.bus_name, r.route_name, r.origin, r.destination
                                    FROM tickets t 
                                    JOIN passengers p ON t.passenger_id = p.passenger_id 
                                    JOIN buses b ON t.bus_id = b.bus_id 
                                    JOIN routes r ON t.route_id = r.route_id
                                    WHERE t.ticket_id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
    
    public function bookTicket($data) {
        $this->db->begin_transaction();
        
        try {
            // Check if passenger exists, if not create one
            if (!empty($data['passenger_id'])) {
                $passengerId = $data['passenger_id'];
            } else {
                $stmt = $this->db->prepare("INSERT INTO passengers (full_name, phone, email) VALUES (?, ?, ?)");
                $stmt->bind_param("sss", $data['passenger_name'], $data['phone'], $data['email']);
                $stmt->execute();
                $passengerId = $this->db->insert_id;
            }
            
            // Create ticket
            $stmt = $this->db->prepare("INSERT INTO tickets (passenger_id, bus_id, route_id, seat_number, amount) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("iiisd", $passengerId, $data['bus_id'], $data['route_id'], $data['seat_number'], $data['amount']);
            $stmt->execute();
            $ticketId = $this->db->insert_id;
            
            // Create payment
            $stmt = $this->db->prepare("INSERT INTO payments (ticket_id, amount, payment_method, payment_status) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("idss", $ticketId, $data['amount'], $data['payment_method'], 'Completed');
            $stmt->execute();
            
            $this->db->commit();
            return ['success' => true, 'message' => 'Ticket booked successfully', 'ticket_id' => $ticketId];
            
        } catch (Exception $e) {
            $this->db->rollback();
            return ['success' => false, 'message' => 'Failed to book ticket: ' . $e->getMessage()];
        }
    }
    
    public function cancelTicket($id) {
        $stmt = $this->db->prepare("DELETE FROM tickets WHERE ticket_id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Ticket cancelled successfully'];
        }
        
        return ['success' => false, 'message' => 'Failed to cancel ticket'];
    }
    
    // ==================== PAYMENTS ====================
    public function getPayments($page = 1, $search = '') {
        $limit = 10;
        $offset = ($page - 1) * $limit;
        
        $query = "SELECT p.*, t.amount as ticket_amount 
                  FROM payments p 
                  JOIN tickets t ON p.ticket_id = t.ticket_id 
                  ORDER BY p.payment_date DESC 
                  LIMIT $limit OFFSET $offset";
        
        $result = $this->db->query($query);
        
        $payments = [];
        while ($row = $result->fetch_assoc()) {
            $payments[] = $row;
        }
        
        $countResult = $this->db->query("SELECT COUNT(*) as total FROM payments");
        $total = $countResult->fetch_assoc()['total'];
        
        return [
            'payments' => $payments,
            'total_pages' => ceil($total / $limit),
            'current_page' => $page,
            'total' => $total
        ];
    }
    
    // ==================== ANNOUNCEMENTS ====================
    public function getAnnouncements() {
        $query = "SELECT a.*, u.full_name as posted_by_name 
                  FROM announcements a 
                  LEFT JOIN users u ON a.posted_by = u.user_id 
                  ORDER BY a.created_at DESC";
        
        $result = $this->db->query($query);
        
        $announcements = [];
        while ($row = $result->fetch_assoc()) {
            $announcements[] = $row;
        }
        
        return ['announcements' => $announcements];
    }
    
    public function addAnnouncement($data) {
        if (!isset($_SESSION['user_id'])) {
            return ['success' => false, 'message' => 'Unauthorized'];
        }
        
        $stmt = $this->db->prepare("INSERT INTO announcements (title, message, posted_by) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $data['title'], $data['message'], $_SESSION['user_id']);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Announcement added successfully'];
        }
        
        return ['success' => false, 'message' => 'Failed to add announcement'];
    }
    
    // ==================== PROFILE & SETTINGS ====================
    public function updateProfile($data) {
        if (!isset($_SESSION['user_id'])) {
            return ['success' => false, 'message' => 'Not logged in'];
        }
        
        $stmt = $this->db->prepare("UPDATE users SET full_name = ?, email = ? WHERE user_id = ?");
        $stmt->bind_param("ssi", $data['full_name'], $data['email'], $_SESSION['user_id']);
        
        if ($stmt->execute()) {
            $_SESSION['full_name'] = $data['full_name'];
            $_SESSION['email'] = $data['email'];
            return ['success' => true, 'message' => 'Profile updated successfully'];
        }
        
        return ['success' => false, 'message' => 'Failed to update profile'];
    }
    
    public function changePassword($currentPassword, $newPassword) {
        if (!isset($_SESSION['user_id'])) {
            return ['success' => false, 'message' => 'Not logged in'];
        }
        
        // Verify current password
        $stmt = $this->db->prepare("SELECT password FROM users WHERE user_id = ?");
        $stmt->bind_param("i", $_SESSION['user_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        
        if (!password_verify($currentPassword, $user['password'])) {
            return ['success' => false, 'message' => 'Current password is incorrect'];
        }
        
        // Update password
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $this->db->prepare("UPDATE users SET password = ? WHERE user_id = ?");
        $stmt->bind_param("si", $hashedPassword, $_SESSION['user_id']);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Password changed successfully'];
        }
        
        return ['success' => false, 'message' => 'Failed to change password'];
    }
    
    // ==================== BUS STOPS ====================
    public function getBusStops($page = 1, $search = '') {
        $limit = 10;
        $offset = ($page - 1) * $limit;
        
        $searchCondition = $search ? "WHERE stop_name LIKE '%$search%' OR location LIKE '%$search%'" : "";
        
        $countResult = $this->db->query("SELECT COUNT(*) as total FROM bus_stops $searchCondition");
        $total = $countResult->fetch_assoc()['total'];
        
        $query = "SELECT * FROM bus_stops $searchCondition ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
        $result = $this->db->query($query);
        
        $busStops = [];
        while ($row = $result->fetch_assoc()) {
            $busStops[] = $row;
        }
        
        return [
            'busStops' => $busStops,
            'total_pages' => ceil($total / $limit),
            'current_page' => $page,
            'total' => $total
        ];
    }
}

// ==================== API ROUTES ====================
$bsms = new BSMS();
$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'check_session':
        echo json_encode($bsms->checkSession());
        break;
        
    case 'login':
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode($bsms->login($data['username'], $data['password']));
        break;
        
    case 'register':
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode($bsms->register($data));
        break;
        
    case 'logout':
        echo json_encode($bsms->logout());
        break;
        
    case 'dashboard_stats':
        echo json_encode($bsms->getDashboardStats());
        break;
        
    case 'landing_stats':
        echo json_encode($bsms->getLandingStats());
        break;
        
    case 'recent_activities':
        echo json_encode($bsms->getRecentActivities());
        break;
        
    // User endpoints
    case 'get_users':
        $page = $_GET['page'] ?? 1;
        $search = $_GET['search'] ?? '';
        echo json_encode($bsms->getUsers($page, $search));
        break;
        
    case 'get_user':
        $id = $_GET['id'] ?? 0;
        echo json_encode($bsms->getUser($id));
        break;
        
    case 'add_user':
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode($bsms->addUser($data));
        break;
        
    case 'update_user':
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode($bsms->updateUser($data));
        break;
        
    case 'delete_user':
        $id = $_GET['id'] ?? 0;
        echo json_encode($bsms->deleteUser($id));
        break;
        
    // Bus endpoints
    case 'get_all_buses':
        echo json_encode($bsms->getAllBuses());
        break;
        
    case 'get_buses':
        $page = $_GET['page'] ?? 1;
        $search = $_GET['search'] ?? '';
        echo json_encode($bsms->getBuses($page, $search));
        break;
        
    case 'get_bus':
        $id = $_GET['id'] ?? 0;
        echo json_encode($bsms->getBus($id));
        break;
        
    case 'add_bus':
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode($bsms->addBus($data));
        break;
        
    case 'update_bus':
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode($bsms->updateBus($data));
        break;
        
    case 'delete_bus':
        $id = $_GET['id'] ?? 0;
        echo json_encode($bsms->deleteBus($id));
        break;
        
    // Driver endpoints
    case 'get_all_drivers':
        echo json_encode($bsms->getAllDrivers());
        break;
        
    case 'get_drivers':
        $page = $_GET['page'] ?? 1;
        $search = $_GET['search'] ?? '';
        echo json_encode($bsms->getDrivers($page, $search));
        break;
        
    case 'get_driver':
        $id = $_GET['id'] ?? 0;
        echo json_encode($bsms->getDriver($id));
        break;
        
    case 'add_driver':
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode($bsms->addDriver($data));
        break;
        
    case 'update_driver':
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode($bsms->updateDriver($data));
        break;
        
    case 'delete_driver':
        $id = $_GET['id'] ?? 0;
        echo json_encode($bsms->deleteDriver($id));
        break;
        
    // Route endpoints
    case 'get_all_routes':
        echo json_encode($bsms->getAllRoutes());
        break;
        
    case 'get_routes':
        $page = $_GET['page'] ?? 1;
        $search = $_GET['search'] ?? '';
        echo json_encode($bsms->getRoutes($page, $search));
        break;
        
    case 'get_route':
        $id = $_GET['id'] ?? 0;
        echo json_encode($bsms->getRoute($id));
        break;
        
    case 'add_route':
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode($bsms->addRoute($data));
        break;
        
    case 'update_route':
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode($bsms->updateRoute($data));
        break;
        
    case 'delete_route':
        $id = $_GET['id'] ?? 0;
        echo json_encode($bsms->deleteRoute($id));
        break;
        
    // Assignment endpoints
    case 'get_assignments':
        $page = $_GET['page'] ?? 1;
        $search = $_GET['search'] ?? '';
        echo json_encode($bsms->getAssignments($page, $search));
        break;
        
    // Schedule endpoints
    case 'get_schedules':
        $page = $_GET['page'] ?? 1;
        $search = $_GET['search'] ?? '';
        echo json_encode($bsms->getSchedules($page, $search));
        break;
        
    // Tracking endpoints
    case 'get_tracking':
        echo json_encode($bsms->getTracking());
        break;
        
    // Passenger endpoints
    case 'get_all_passengers':
        echo json_encode($bsms->getAllPassengers());
        break;
        
    case 'get_passengers':
        $page = $_GET['page'] ?? 1;
        $search = $_GET['search'] ?? '';
        echo json_encode($bsms->getPassengers($page, $search));
        break;
        
    // Ticket endpoints
    case 'get_tickets':
        $page = $_GET['page'] ?? 1;
        $search = $_GET['search'] ?? '';
        echo json_encode($bsms->getTickets($page, $search));
        break;
        
    case 'get_ticket':
        $id = $_GET['id'] ?? 0;
        echo json_encode($bsms->getTicket($id));
        break;
        
    case 'book_ticket':
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode($bsms->bookTicket($data));
        break;
        
    case 'cancel_ticket':
        $id = $_GET['id'] ?? 0;
        echo json_encode($bsms->cancelTicket($id));
        break;
        
    // Payment endpoints
    case 'get_payments':
        $page = $_GET['page'] ?? 1;
        $search = $_GET['search'] ?? '';
        echo json_encode($bsms->getPayments($page, $search));
        break;
        
    // Announcement endpoints
    case 'get_announcements':
        echo json_encode($bsms->getAnnouncements());
        break;
        
    case 'add_announcement':
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode($bsms->addAnnouncement($data));
        break;
        
    // Profile endpoints
    case 'update_profile':
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode($bsms->updateProfile($data));
        break;
        
    case 'change_password':
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode($bsms->changePassword($data['current_password'], $data['new_password']));
        break;
        
    // Bus Stops endpoints
    case 'get_bus_stops':
        $page = $_GET['page'] ?? 1;
        $search = $_GET['search'] ?? '';
        echo json_encode($bsms->getBusStops($page, $search));
        break;
        
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}
?>