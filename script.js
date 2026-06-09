// Global variables
let currentUser = null;
let currentModule = 'dashboard';
let currentPage = 1;
let itemsPerPage = 10;
let searchTerm = '';
let revenueChart = null;
let ticketsChart = null;

const API_BASE = 'system.php';

// Role-Based Permissions - Full Access Control
const rolePermissions = {
    'Admin': {
        // User Management
        canViewUsers: true,
        canCreateUser: true,
        canEditUser: true,
        canDeleteUser: true,
        
        // Bus Management
        canViewBuses: true,
        canCreateBus: true,
        canEditBus: true,
        canDeleteBus: true,
        
        // Driver Management
        canViewDrivers: true,
        canCreateDriver: true,
        canEditDriver: true,
        canDeleteDriver: true,
        
        // Route Management
        canViewRoutes: true,
        canCreateRoute: true,
        canEditRoute: true,
        canDeleteRoute: true,
        
        // Assignment Management
        canViewAssignments: true,
        canCreateAssignment: true,
        canEditAssignment: true,
        canDeleteAssignment: true,
        
        // Schedule Management
        canViewSchedules: true,
        canCreateSchedule: true,
        canEditSchedule: true,
        canDeleteSchedule: true,
        
        // Tracking
        canViewTracking: true,
        canUpdateTracking: true,
        
        // Passenger Management
        canViewPassengers: true,
        canCreatePassenger: true,
        canEditPassenger: true,
        canDeletePassenger: true,
        
        // Ticket Management
        canViewTickets: true,
        canCreateTicket: true,
        canCancelTicket: true,
        
        // Payment Management
        canViewPayments: true,
        canProcessPayment: true,
        canRefundPayment: true,
        
        // Announcements
        canViewAnnouncements: true,
        canCreateAnnouncement: true,
        canEditAnnouncement: true,
        canDeleteAnnouncement: true,
        
        // Reports
        canViewReports: true,
        canGenerateReport: true,
        canExportReport: true,
        
        // Settings
        canViewSettings: true,
        canEditSettings: true,
        
        // Dashboard
        canViewDashboard: true,
        canViewStatistics: true
    },
    
    'Driver': {
        // User Management - NO ACCESS
        canViewUsers: false,
        canCreateUser: false,
        canEditUser: false,
        canDeleteUser: false,
        
        // Bus Management - VIEW ONLY
        canViewBuses: true,
        canCreateBus: false,
        canEditBus: false,
        canDeleteBus: false,
        
        // Driver Management - VIEW OWN ONLY
        canViewDrivers: true,
        canCreateDriver: false,
        canEditDriver: false,
        canDeleteDriver: false,
        
        // Route Management - VIEW ONLY
        canViewRoutes: true,
        canCreateRoute: false,
        canEditRoute: false,
        canDeleteRoute: false,
        
        // Assignment Management - VIEW OWN
        canViewAssignments: true,
        canCreateAssignment: false,
        canEditAssignment: false,
        canDeleteAssignment: false,
        
        // Schedule Management - VIEW ONLY
        canViewSchedules: true,
        canCreateSchedule: false,
        canEditSchedule: false,
        canDeleteSchedule: false,
        
        // Tracking - CAN UPDATE OWN LOCATION
        canViewTracking: true,
        canUpdateTracking: true,
        
        // Passenger Management - NO ACCESS
        canViewPassengers: false,
        canCreatePassenger: false,
        canEditPassenger: false,
        canDeletePassenger: false,
        
        // Ticket Management - VIEW ONLY
        canViewTickets: true,
        canCreateTicket: false,
        canCancelTicket: false,
        
        // Payment Management - VIEW ONLY
        canViewPayments: true,
        canProcessPayment: false,
        canRefundPayment: false,
        
        // Announcements - VIEW ONLY
        canViewAnnouncements: true,
        canCreateAnnouncement: false,
        canEditAnnouncement: false,
        canDeleteAnnouncement: false,
        
        // Reports - LIMITED
        canViewReports: true,
        canGenerateReport: false,
        canExportReport: false,
        
        // Settings - OWN PROFILE ONLY
        canViewSettings: true,
        canEditSettings: false,
        
        // Dashboard
        canViewDashboard: true,
        canViewStatistics: true
    },
    
    'Passenger': {
        // User Management - NO ACCESS
        canViewUsers: false,
        canCreateUser: false,
        canEditUser: false,
        canDeleteUser: false,
        
        // Bus Management - VIEW ONLY
        canViewBuses: true,
        canCreateBus: false,
        canEditBus: false,
        canDeleteBus: false,
        
        // Driver Management - VIEW ONLY
        canViewDrivers: true,
        canCreateDriver: false,
        canEditDriver: false,
        canDeleteDriver: false,
        
        // Route Management - VIEW ONLY
        canViewRoutes: true,
        canCreateRoute: false,
        canEditRoute: false,
        canDeleteRoute: false,
        
        // Assignment Management - NO ACCESS
        canViewAssignments: false,
        canCreateAssignment: false,
        canEditAssignment: false,
        canDeleteAssignment: false,
        
        // Schedule Management - VIEW ONLY
        canViewSchedules: true,
        canCreateSchedule: false,
        canEditSchedule: false,
        canDeleteSchedule: false,
        
        // Tracking - VIEW ONLY
        canViewTracking: true,
        canUpdateTracking: false,
        
        // Passenger Management - SELF ONLY
        canViewPassengers: true,
        canCreatePassenger: false,
        canEditPassenger: false,
        canDeletePassenger: false,
        
        // Ticket Management - BOOK & VIEW OWN
        canViewTickets: true,
        canCreateTicket: true,
        canCancelTicket: true,
        
        // Payment Management - MAKE PAYMENTS
        canViewPayments: true,
        canProcessPayment: true,
        canRefundPayment: false,
        
        // Announcements - VIEW ONLY
        canViewAnnouncements: true,
        canCreateAnnouncement: false,
        canEditAnnouncement: false,
        canDeleteAnnouncement: false,
        
        // Reports - LIMITED
        canViewReports: true,
        canGenerateReport: false,
        canExportReport: false,
        
        // Settings - OWN PROFILE ONLY
        canViewSettings: true,
        canEditSettings: false,
        
        // Dashboard
        canViewDashboard: true,
        canViewStatistics: true
    }
};

// Permission checker functions
function hasPermission(permission) {
    if (!currentUser) return false;
    const role = currentUser.role;
    return rolePermissions[role] && rolePermissions[role][permission] === true;
}

// Module-specific permission checkers
function canView(module) {
    const permissionMap = {
        'users': 'canViewUsers',
        'buses': 'canViewBuses',
        'drivers': 'canViewDrivers',
        'routes': 'canViewRoutes',
        'assignments': 'canViewAssignments',
        'schedules': 'canViewSchedules',
        'tracking': 'canViewTracking',
        'passengers': 'canViewPassengers',
        'tickets': 'canViewTickets',
        'payments': 'canViewPayments',
        'announcements': 'canViewAnnouncements',
        'reports': 'canViewReports',
        'settings': 'canViewSettings',
        'dashboard': 'canViewDashboard'
    };
    return hasPermission(permissionMap[module]);
}

function canCreate(module) {
    const permissionMap = {
        'users': 'canCreateUser',
        'buses': 'canCreateBus',
        'drivers': 'canCreateDriver',
        'routes': 'canCreateRoute',
        'assignments': 'canCreateAssignment',
        'schedules': 'canCreateSchedule',
        'passengers': 'canCreatePassenger',
        'tickets': 'canCreateTicket',
        'announcements': 'canCreateAnnouncement'
    };
    return hasPermission(permissionMap[module]);
}

function canEdit(module) {
    const permissionMap = {
        'users': 'canEditUser',
        'buses': 'canEditBus',
        'drivers': 'canEditDriver',
        'routes': 'canEditRoute',
        'assignments': 'canEditAssignment',
        'schedules': 'canEditSchedule',
        'passengers': 'canEditPassenger',
        'announcements': 'canEditAnnouncement',
        'settings': 'canEditSettings'
    };
    return hasPermission(permissionMap[module]);
}

function canDelete(module) {
    const permissionMap = {
        'users': 'canDeleteUser',
        'buses': 'canDeleteBus',
        'drivers': 'canDeleteDriver',
        'routes': 'canDeleteRoute',
        'assignments': 'canDeleteAssignment',
        'schedules': 'canDeleteSchedule',
        'passengers': 'canDeletePassenger',
        'announcements': 'canDeleteAnnouncement'
    };
    return hasPermission(permissionMap[module]);
}

// Get modules based on role
function getModulesByRole() {
    const role = currentUser?.role || 'Passenger';
    const allModules = [
        { module: 'dashboard', name: 'Dashboard', icon: 'fa-tachometer-alt', viewPerm: 'canViewDashboard' },
        { module: 'users', name: 'Users', icon: 'fa-users', viewPerm: 'canViewUsers' },
        { module: 'busStops', name: 'Bus Stops', icon: 'fa-map-marker-alt', viewPerm: 'canViewBuses' },
        { module: 'buses', name: 'Buses', icon: 'fa-bus', viewPerm: 'canViewBuses' },
        { module: 'drivers', name: 'Drivers', icon: 'fa-id-card', viewPerm: 'canViewDrivers' },
        { module: 'routes', name: 'Routes', icon: 'fa-road', viewPerm: 'canViewRoutes' },
        { module: 'assignments', name: 'Assignments', icon: 'fa-exchange-alt', viewPerm: 'canViewAssignments' },
        { module: 'schedules', name: 'Schedules', icon: 'fa-calendar-alt', viewPerm: 'canViewSchedules' },
        { module: 'tracking', name: 'Live Tracking', icon: 'fa-map-marked-alt', viewPerm: 'canViewTracking' },
        { module: 'passengers', name: 'Passengers', icon: 'fa-user-friends', viewPerm: 'canViewPassengers' },
        { module: 'tickets', name: 'Tickets', icon: 'fa-ticket-alt', viewPerm: 'canViewTickets' },
        { module: 'payments', name: 'Payments', icon: 'fa-credit-card', viewPerm: 'canViewPayments' },
        { module: 'announcements', name: 'Announcements', icon: 'fa-bullhorn', viewPerm: 'canViewAnnouncements' },
        { module: 'reports', name: 'Reports', icon: 'fa-chart-line', viewPerm: 'canViewReports' },
        { module: 'settings', name: 'Settings', icon: 'fa-cog', viewPerm: 'canViewSettings' }
    ];
    
    return allModules.filter(module => hasPermission(module.viewPerm));
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    loadLandingStats();
    setupEventListeners();
    checkSession();
});

function setupEventListeners() {
    // Landing page navigation
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            const element = document.getElementById(section);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

function updateSidebarBasedOnRole() {
    const sidebarNav = document.querySelector('.sidebar-nav-premium');
    if (!sidebarNav) return;
    
    const modules = getModulesByRole();
    
    let navHtml = '';
    modules.forEach(item => {
        navHtml += `
            <a href="#" data-module="${item.module}" class="nav-item-premium">
                <i class="fas ${item.icon}"></i>
                <span>${item.name}</span>
            </a>
        `;
    });
    
    // Add logout button for everyone
    navHtml += `<a href="#" onclick="logout()" class="nav-item-premium logout"><i class="fas fa-sign-out-alt"></i><span>Logout</span></a>`;
    
    sidebarNav.innerHTML = navHtml;
    
    // Re-attach event listeners
    document.querySelectorAll('[data-module]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const module = link.dataset.module;
            currentModule = module;
            if (canView(module)) {
                loadModule(module);
            } else {
                showAlert('You do not have permission to access this module', 'error');
            }
            
            // Update active state
            document.querySelectorAll('[data-module]').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            updatePageTitle(module);
        });
    });
}

function updatePageTitle(module) {
    const titles = {
        'dashboard': { title: 'Dashboard', desc: 'Welcome back! Here\'s what\'s happening today.' },
        'users': { title: 'User Management', desc: 'Manage system users and their roles.' },
        'busStops': { title: 'Bus Stops', desc: 'Manage bus stops and locations.' },
        'buses': { title: 'Bus Management', desc: 'Manage your bus fleet.' },
        'drivers': { title: 'Driver Management', desc: 'Manage driver information.' },
        'routes': { title: 'Route Management', desc: 'Manage bus routes.' },
        'assignments': { title: 'Bus Assignments', desc: 'Assign buses to drivers and routes.' },
        'schedules': { title: 'Schedule Management', desc: 'Manage bus schedules.' },
        'tracking': { title: 'Live Tracking', desc: 'Track buses in real-time.' },
        'passengers': { title: 'Passenger Management', desc: 'Manage passenger records.' },
        'tickets': { title: 'Ticket Management', desc: 'Manage ticket bookings.' },
        'payments': { title: 'Payment Management', desc: 'Track all payments.' },
        'announcements': { title: 'Announcements', desc: 'Post and manage announcements.' },
        'reports': { title: 'Reports & Analytics', desc: 'Generate detailed reports.' },
        'settings': { title: 'System Settings', desc: 'Configure system preferences.' }
    };
    
    const info = titles[module] || titles['dashboard'];
    document.getElementById('currentPageTitle').innerText = info.title;
    document.getElementById('currentPageDesc').innerText = info.desc;
}

async function checkSession() {
    try {
        const response = await fetch(`${API_BASE}?action=check_session`);
        const data = await response.json();
        
        if (data.logged_in) {
            currentUser = data.user;
            showDashboard();
            updateSidebarBasedOnRole();
            loadModule('dashboard');
            updatePageTitle('dashboard');
            
            // Show role-specific welcome message
            let roleMessage = '';
            if (currentUser.role === 'Admin') {
                roleMessage = 'You have full access to manage the system.';
            } else if (currentUser.role === 'Driver') {
                roleMessage = 'You can view schedules and update your bus location.';
            } else {
                roleMessage = 'You can book tickets and view your travel history.';
            }
            showAlert(`Welcome ${currentUser.full_name} (${currentUser.role})! ${roleMessage}`, 'success');
        } else {
            showLandingPage();
        }
    } catch (error) {
        console.error('Session check error:', error);
        showLandingPage();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            closeLoginModal();
            showDashboard();
            updateSidebarBasedOnRole();
            loadModule('dashboard');
            updatePageTitle('dashboard');
        } else {
            showAlert(data.message || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match!', 'error');
        return;
    }
    
    const userData = {
        full_name: document.getElementById('regFullName').value,
        username: document.getElementById('regUsername').value,
        email: document.getElementById('regEmail').value,
        password: password,
        role: document.getElementById('regRole').value
    };
    
    try {
        const response = await fetch(`${API_BASE}?action=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Registration successful! Please login.', 'success');
            closeRegisterModal();
            showLoginModal();
        } else {
            showAlert(data.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    }
}

function logout() {
    fetch(`${API_BASE}?action=logout`)
        .then(() => {
            currentUser = null;
            showLandingPage();
            showAlert('Logged out successfully', 'success');
        });
}

function showLandingPage() {
    document.getElementById('landingPage').style.display = 'block';
    document.getElementById('dashboardView').style.display = 'none';
    loadLandingStats();
}

function showDashboard() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('dashboardView').style.display = 'flex';
    
    if (currentUser) {
        document.getElementById('sidebarUserName').innerText = currentUser.full_name;
        document.getElementById('sidebarUserRole').innerText = currentUser.role;
        document.getElementById('currentUserDisplay').innerHTML = `${currentUser.full_name} (${currentUser.role})`;
        
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.full_name)}&background=3498db&color=fff`;
        document.querySelectorAll('.sidebar-user img, .user-dropdown img').forEach(img => {
            img.src = avatarUrl;
        });
    }
}

function showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('loginForm').reset();
}

function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'flex';
}

function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
    document.getElementById('registerForm').reset();
}

function closeModal() {
    document.getElementById('genericModal').style.display = 'none';
}

function showModal(title, content) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('genericModal').style.display = 'flex';
}

function toggleSidebar() {
    const sidebar = document.querySelector('.dashboard-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

async function loadModule(module) {
    if (!canView(module)) {
        document.getElementById('dynamicContent').innerHTML = `
            <div class="alert-premium alert-error">
                <i class="fas fa-lock"></i> You do not have permission to access this module.
                <br><small>Contact administrator for access.</small>
            </div>
        `;
        return;
    }
    
    currentPage = 1;
    searchTerm = '';
    
    const contentArea = document.getElementById('dynamicContent');
    contentArea.innerHTML = '<div class="loading-premium"><i class="fas fa-spinner"></i> Loading...</div>';
    
    try {
        switch(module) {
            case 'dashboard':
                await loadDashboard();
                break;
            case 'users':
                await loadUsers();
                break;
            case 'buses':
                await loadBuses();
                break;
            case 'drivers':
                await loadDrivers();
                break;
            case 'routes':
                await loadRoutes();
                break;
            case 'tracking':
                await loadTracking();
                break;
            case 'tickets':
                await loadTickets();
                break;
            case 'payments':
                await loadPayments();
                break;
            case 'announcements':
                await loadAnnouncements();
                break;
            case 'reports':
                await loadReports();
                break;
            case 'settings':
                await loadSettings();
                break;
            default:
                contentArea.innerHTML = '<div class="alert-premium alert-info">Module coming soon...</div>';
        }
    } catch (error) {
        contentArea.innerHTML = `<div class="alert-premium alert-error">Error loading module: ${error.message}</div>`;
    }
}

// Dashboard Content
async function loadDashboard() {
    const response = await fetch(`${API_BASE}?action=dashboard_stats`);
    const stats = await response.json();
    
    const html = `
        <div class="dashboard-stats-grid">
            <div class="stat-card-premium"><div class="stat-info"><h3>Total Buses</h3><div class="stat-number-large">${stats.total_buses || 0}</div></div><div class="stat-icon-large"><i class="fas fa-bus"></i></div></div>
            <div class="stat-card-premium"><div class="stat-info"><h3>Total Drivers</h3><div class="stat-number-large">${stats.total_drivers || 0}</div></div><div class="stat-icon-large"><i class="fas fa-id-card"></i></div></div>
            <div class="stat-card-premium"><div class="stat-info"><h3>Total Routes</h3><div class="stat-number-large">${stats.total_routes || 0}</div></div><div class="stat-icon-large"><i class="fas fa-road"></i></div></div>
            <div class="stat-card-premium"><div class="stat-info"><h3>Total Passengers</h3><div class="stat-number-large">${stats.total_passengers || 0}</div></div><div class="stat-icon-large"><i class="fas fa-users"></i></div></div>
            <div class="stat-card-premium"><div class="stat-info"><h3>Tickets Sold</h3><div class="stat-number-large">${stats.total_tickets || 0}</div></div><div class="stat-icon-large"><i class="fas fa-ticket-alt"></i></div></div>
            <div class="stat-card-premium"><div class="stat-info"><h3>Total Revenue</h3><div class="stat-number-large">TZS ${(stats.total_revenue || 0).toLocaleString()}</div></div><div class="stat-icon-large"><i class="fas fa-money-bill-wave"></i></div></div>
        </div>
        <div class="charts-row-premium">
            <div class="chart-card"><h3>Revenue Overview</h3><canvas id="revenueChart"></canvas></div>
            <div class="chart-card"><h3>Tickets Sold</h3><canvas id="ticketsChart"></canvas></div>
        </div>
    `;
    
    document.getElementById('dynamicContent').innerHTML = html;
    
    if (stats.chart_data) {
        const ctx1 = document.getElementById('revenueChart')?.getContext('2d');
        if (ctx1) {
            new Chart(ctx1, {
                type: 'line',
                data: { labels: stats.chart_data.labels, datasets: [{ label: 'Revenue (TZS)', data: stats.chart_data.revenue, borderColor: '#4361ee', tension: 0.4 }] },
                options: { responsive: true }
            });
        }
        const ctx2 = document.getElementById('ticketsChart')?.getContext('2d');
        if (ctx2) {
            new Chart(ctx2, {
                type: 'bar',
                data: { labels: stats.chart_data.labels, datasets: [{ label: 'Tickets Sold', data: stats.chart_data.tickets, backgroundColor: '#10b981', borderRadius: 5 }] },
                options: { responsive: true }
            });
        }
    }
}

// Users Management (Admin Only)
async function loadUsers() {
    if (!hasPermission('canViewUsers')) {
        document.getElementById('dynamicContent').innerHTML = '<div class="alert-premium alert-error">You do not have permission to view users.</div>';
        return;
    }
    
    const response = await fetch(`${API_BASE}?action=get_users&page=${currentPage}&search=${searchTerm}`);
    const data = await response.json();
    
    let html = `
        <div class="module-header">
            <div class="module-title"><i class="fas fa-users"></i> User Management</div>
            ${hasPermission('canCreateUser') ? '<button class="btn-add-premium" onclick="showAddUserModal()"><i class="fas fa-plus"></i> Add User</button>' : ''}
        </div>
        <div class="search-bar-premium">
            <div class="search-input"><i class="fas fa-search"></i><input type="text" id="searchInput" placeholder="Search users..."></div>
            <button class="btn-add-premium" onclick="searchTable()">Search</button>
        </div>
        <div class="table-container">
            <table class="data-table-premium">
                <thead><tr><th>ID</th><th>Full Name</th><th>Username</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>`;
    
    data.users.forEach(user => {
        html += `<tr>
            <td>${user.user_id}</td>
            <td>${escapeHtml(user.full_name)}</td>
            <td>${escapeHtml(user.username)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td><span class="status-badge">${user.role}</span></td>
            <td>
                ${hasPermission('canEditUser') ? `<button class="btn-edit-premium" onclick="editUser(${user.user_id})"><i class="fas fa-edit"></i></button>` : ''}
                ${hasPermission('canDeleteUser') && user.user_id !== currentUser?.user_id ? `<button class="btn-delete-premium" onclick="deleteUser(${user.user_id})"><i class="fas fa-trash"></i></button>` : ''}
            </td>
        </tr>`;
    });
    
    html += `</tbody></table></div>${generatePagination(data.total_pages, data.current_page)}`;
    document.getElementById('dynamicContent').innerHTML = html;
}

// Buses Management
async function loadBuses() {
    if (!hasPermission('canViewBuses')) {
        document.getElementById('dynamicContent').innerHTML = '<div class="alert-premium alert-error">You do not have permission to view buses.</div>';
        return;
    }
    
    const response = await fetch(`${API_BASE}?action=get_buses&page=${currentPage}&search=${searchTerm}`);
    const data = await response.json();
    
    let html = `
        <div class="module-header">
            <div class="module-title"><i class="fas fa-bus"></i> Bus Management</div>
            ${hasPermission('canCreateBus') ? '<button class="btn-add-premium" onclick="showAddBusModal()"><i class="fas fa-plus"></i> Add Bus</button>' : ''}
        </div>
        <div class="search-bar-premium">
            <div class="search-input"><i class="fas fa-search"></i><input type="text" id="searchInput" placeholder="Search buses..."></div>
            <button class="btn-add-premium" onclick="searchTable()">Search</button>
        </div>
        <div class="table-container">
            <table class="data-table-premium">
                <thead><tr><th>ID</th><th>Bus Number</th><th>Bus Name</th><th>Registration</th><th>Capacity</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>`;
    
    data.buses.forEach(bus => {
        html += `<tr>
            <td>${bus.bus_id}</td>
            <td>${escapeHtml(bus.bus_number)}</td>
            <td>${escapeHtml(bus.bus_name)}</td>
            <td>${escapeHtml(bus.registration_number)}</td>
            <td>${bus.capacity}</td>
            <td><span class="status-badge status-${bus.status.toLowerCase().replace(' ', '-')}">${bus.status}</span></td>
            <td>
                ${hasPermission('canEditBus') ? `<button class="btn-edit-premium" onclick="editBus(${bus.bus_id})"><i class="fas fa-edit"></i></button>` : ''}
                ${hasPermission('canDeleteBus') ? `<button class="btn-delete-premium" onclick="deleteBus(${bus.bus_id})"><i class="fas fa-trash"></i></button>` : ''}
            </td>
        </tr>`;
    });
    
    html += `</tbody></table></div>${generatePagination(data.total_pages, data.current_page)}`;
    document.getElementById('dynamicContent').innerHTML = html;
}

// Drivers Management
async function loadDrivers() {
    if (!hasPermission('canViewDrivers')) {
        document.getElementById('dynamicContent').innerHTML = '<div class="alert-premium alert-error">You do not have permission to view drivers.</div>';
        return;
    }
    
    const response = await fetch(`${API_BASE}?action=get_drivers&page=${currentPage}&search=${searchTerm}`);
    const data = await response.json();
    
    let html = `
        <div class="module-header">
            <div class="module-title"><i class="fas fa-id-card"></i> Driver Management</div>
            ${hasPermission('canCreateDriver') ? '<button class="btn-add-premium" onclick="showAddDriverModal()"><i class="fas fa-plus"></i> Add Driver</button>' : ''}
        </div>
        <div class="search-bar-premium">
            <div class="search-input"><i class="fas fa-search"></i><input type="text" id="searchInput" placeholder="Search drivers..."></div>
            <button class="btn-add-premium" onclick="searchTable()">Search</button>
        </div>
        <div class="table-container">
            <table class="data-table-premium">
                <thead><tr><th>ID</th><th>Full Name</th><th>Phone</th><th>Email</th><th>License Number</th><th>Actions</th></tr></thead>
                <tbody>`;
    
    data.drivers.forEach(driver => {
        html += `<tr>
            <td>${driver.driver_id}</td>
            <td>${escapeHtml(driver.full_name)}</td>
            <td>${escapeHtml(driver.phone)}</td>
            <td>${escapeHtml(driver.email)}</td>
            <td>${escapeHtml(driver.license_number)}</td>
            <td>
                ${hasPermission('canEditDriver') ? `<button class="btn-edit-premium" onclick="editDriver(${driver.driver_id})"><i class="fas fa-edit"></i></button>` : ''}
                ${hasPermission('canDeleteDriver') ? `<button class="btn-delete-premium" onclick="deleteDriver(${driver.driver_id})"><i class="fas fa-trash"></i></button>` : ''}
            </td>
        </tr>`;
    });
    
    html += `</tbody><table></div>${generatePagination(data.total_pages, data.current_page)}`;
    document.getElementById('dynamicContent').innerHTML = html;
}

// Routes Management
async function loadRoutes() {
    if (!hasPermission('canViewRoutes')) {
        document.getElementById('dynamicContent').innerHTML = '<div class="alert-premium alert-error">You do not have permission to view routes.</div>';
        return;
    }
    
    const response = await fetch(`${API_BASE}?action=get_routes&page=${currentPage}&search=${searchTerm}`);
    const data = await response.json();
    
    let html = `
        <div class="module-header">
            <div class="module-title"><i class="fas fa-road"></i> Route Management</div>
            ${hasPermission('canCreateRoute') ? '<button class="btn-add-premium" onclick="showAddRouteModal()"><i class="fas fa-plus"></i> Add Route</button>' : ''}
        </div>
        <div class="search-bar-premium">
            <div class="search-input"><i class="fas fa-search"></i><input type="text" id="searchInput" placeholder="Search routes..."></div>
            <button class="btn-add-premium" onclick="searchTable()">Search</button>
        </div>
        <div class="table-container">
            <table class="data-table-premium">
                <thead><tr><th>ID</th><th>Route Name</th><th>Origin</th><th>Destination</th><th>Distance (km)</th><th>Est. Time</th><th>Actions</th></tr></thead>
                <tbody>`;
    
    data.routes.forEach(route => {
        html += `<tr>
            <td>${route.route_id}</td>
            <td>${escapeHtml(route.route_name)}</td>
            <td>${escapeHtml(route.origin)}</td>
            <td>${escapeHtml(route.destination)}</td>
            <td>${route.distance_km}</td>
            <td>${route.estimated_time}</td>
            <td>
                ${hasPermission('canEditRoute') ? `<button class="btn-edit-premium" onclick="editRoute(${route.route_id})"><i class="fas fa-edit"></i></button>` : ''}
                ${hasPermission('canDeleteRoute') ? `<button class="btn-delete-premium" onclick="deleteRoute(${route.route_id})"><i class="fas fa-trash"></i></button>` : ''}
            </td>
        </tr>`;
    });
    
    html += `</tbody></table></div>${generatePagination(data.total_pages, data.current_page)}`;
    document.getElementById('dynamicContent').innerHTML = html;
}

// Tracking Module
async function loadTracking() {
    if (!hasPermission('canViewTracking')) {
        document.getElementById('dynamicContent').innerHTML = '<div class="alert-premium alert-error">You do not have permission to view tracking.</div>';
        return;
    }
    
    const response = await fetch(`${API_BASE}?action=get_tracking`);
    const data = await response.json();
    
    let html = `
        <div class="module-header">
            <div class="module-title"><i class="fas fa-map-marked-alt"></i> Live Bus Tracking</div>
            <button class="btn-add-premium" onclick="refreshTracking()"><i class="fas fa-sync-alt"></i> Refresh</button>
        </div>
        <div class="tracking-grid">
            <div class="alert-premium alert-info">Tracking data will appear here. ${hasPermission('canUpdateTracking') ? 'Drivers can update their location.' : ''}</div>
        </div>
    `;
    
    if (data.tracking && data.tracking.length > 0) {
        html = `<div class="module-header"><div class="module-title"><i class="fas fa-map-marked-alt"></i> Live Bus Tracking</div><button class="btn-add-premium" onclick="refreshTracking()"><i class="fas fa-sync-alt"></i> Refresh</button></div>
        <div class="tracking-grid">`;
        
        data.tracking.forEach(track => {
            html += `
                <div class="tracking-card">
                    <div class="tracking-header"><i class="fas fa-bus"></i><h3>${escapeHtml(track.bus_number)} - ${escapeHtml(track.bus_name)}</h3></div>
                    <div class="tracking-body">
                        <p><i class="fas fa-map-marker-alt"></i> Location: ${escapeHtml(track.current_location || 'Not available')}</p>
                        <p><i class="fas fa-info-circle"></i> Status: <span class="status-badge status-${track.current_status.toLowerCase()}">${track.current_status}</span></p>
                        <p><i class="fas fa-clock"></i> Last Update: ${new Date(track.updated_at).toLocaleString()}</p>
                        ${hasPermission('canUpdateTracking') ? `<button class="btn-edit-premium" onclick="updateLocation(${track.bus_id})"><i class="fas fa-location-dot"></i> Update Location</button>` : ''}
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }
    
    document.getElementById('dynamicContent').innerHTML = html;
}

// Tickets Module
async function loadTickets() {
    if (!hasPermission('canViewTickets')) {
        document.getElementById('dynamicContent').innerHTML = '<div class="alert-premium alert-error">You do not have permission to view tickets.</div>';
        return;
    }
    
    const response = await fetch(`${API_BASE}?action=get_tickets&page=${currentPage}&search=${searchTerm}`);
    const data = await response.json();
    
    let html = `
        <div class="module-header">
            <div class="module-title"><i class="fas fa-ticket-alt"></i> Ticket Management</div>
            ${hasPermission('canCreateTicket') ? '<button class="btn-add-premium" onclick="showBookTicketModal()"><i class="fas fa-plus"></i> Book Ticket</button>' : ''}
        </div>
        <div class="search-bar-premium">
            <div class="search-input"><i class="fas fa-search"></i><input type="text" id="searchInput" placeholder="Search tickets..."></div>
            <button class="btn-add-premium" onclick="searchTable()">Search</button>
        </div>
        <div class="table-container">
            <table class="data-table-premium">
                <thead><tr><th>ID</th><th>Passenger</th><th>Bus</th><th>Route</th><th>Seat</th><th>Amount</th><th>Booking Date</th><th>Actions</th></tr></thead>
                <tbody>`;
    
    data.tickets.forEach(ticket => {
        html += `<tr>
            <td>${ticket.ticket_id}</td>
            <td>${escapeHtml(ticket.passenger_name)}</td>
            <td>${escapeHtml(ticket.bus_number)}</td>
            <td>${escapeHtml(ticket.route_name)}</td>
            <td>${escapeHtml(ticket.seat_number)}</td>
            <td>TZS ${ticket.amount.toLocaleString()}</td>
            <td>${new Date(ticket.booking_date).toLocaleString()}</td>
            <td>
                <button class="btn-view" onclick="viewTicket(${ticket.ticket_id})"><i class="fas fa-eye"></i></button>
                ${hasPermission('canCancelTicket') ? `<button class="btn-delete-premium" onclick="cancelTicket(${ticket.ticket_id})"><i class="fas fa-times"></i></button>` : ''}
            </td>
        </tr>`;
    });
    
    html += `</tbody></td></div>${generatePagination(data.total_pages, data.current_page)}`;
    document.getElementById('dynamicContent').innerHTML = html;
}

// Payments Module
async function loadPayments() {
    if (!hasPermission('canViewPayments')) {
        document.getElementById('dynamicContent').innerHTML = '<div class="alert-premium alert-error">You do not have permission to view payments.</div>';
        return;
    }
    
    const response = await fetch(`${API_BASE}?action=get_payments&page=${currentPage}&search=${searchTerm}`);
    const data = await response.json();
    
    let html = `
        <div class="module-header">
            <div class="module-title"><i class="fas fa-credit-card"></i> Payment Management</div>
        </div>
        <div class="table-container">
            <table class="data-table-premium">
                <thead><tr><th>ID</th><th>Ticket ID</th><th>Amount</th><th>Payment Method</th><th>Status</th><th>Payment Date</th></tr></thead>
                <tbody>`;
    
    data.payments.forEach(payment => {
        html += `<tr>
            <td>${payment.payment_id}</td>
            <td>${payment.ticket_id}</td>
            <td>TZS ${payment.amount.toLocaleString()}</td>
            <td>${escapeHtml(payment.payment_method)}</td>
            <td><span class="status-badge status-${payment.payment_status.toLowerCase()}">${payment.payment_status}</span></td>
            <td>${new Date(payment.payment_date).toLocaleString()}</td>
        </tr>`;
    });
    
    html += `</tbody></table></div>${generatePagination(data.total_pages, data.current_page)}`;
    document.getElementById('dynamicContent').innerHTML = html;
}

// Announcements Module
async function loadAnnouncements() {
    if (!hasPermission('canViewAnnouncements')) {
        document.getElementById('dynamicContent').innerHTML = '<div class="alert-premium alert-error">You do not have permission to view announcements.</div>';
        return;
    }
    
    const response = await fetch(`${API_BASE}?action=get_announcements`);
    const data = await response.json();
    
    let html = `
        <div class="module-header">
            <div class="module-title"><i class="fas fa-bullhorn"></i> Announcements</div>
            ${hasPermission('canCreateAnnouncement') ? '<button class="btn-add-premium" onclick="showAddAnnouncementModal()"><i class="fas fa-plus"></i> Add Announcement</button>' : ''}
        </div>
        <div class="announcements-list">
            ${data.announcements.map(a => `
                <div class="announcement-card">
                    <div class="announcement-header">
                        <h3>${escapeHtml(a.title)}</h3>
                        <small>Posted by: ${escapeHtml(a.posted_by_name || 'System')} on ${new Date(a.created_at).toLocaleString()}</small>
                    </div>
                    <div class="announcement-body"><p>${escapeHtml(a.message)}</p></div>
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('dynamicContent').innerHTML = html;
}

// Reports Module
async function loadReports() {
    if (!hasPermission('canViewReports')) {
        document.getElementById('dynamicContent').innerHTML = '<div class="alert-premium alert-error">You do not have permission to view reports.</div>';
        return;
    }
    
    const html = `
        <div class="module-header">
            <div class="module-title"><i class="fas fa-chart-line"></i> Reports & Analytics</div>
        </div>
        <div class="reports-container">
            <div class="report-buttons">
                <button class="report-btn" onclick="generateReport('buses')"><i class="fas fa-bus"></i> Buses Report</button>
                <button class="report-btn" onclick="generateReport('drivers')"><i class="fas fa-id-card"></i> Drivers Report</button>
                <button class="report-btn" onclick="generateReport('routes')"><i class="fas fa-road"></i> Routes Report</button>
                <button class="report-btn" onclick="generateReport('tickets')"><i class="fas fa-ticket-alt"></i> Tickets Report</button>
                <button class="report-btn" onclick="generateReport('payments')"><i class="fas fa-credit-card"></i> Payments Report</button>
                <button class="report-btn" onclick="generateReport('revenue')"><i class="fas fa-chart-line"></i> Revenue Report</button>
            </div>
        </div>
    `;
    
    document.getElementById('dynamicContent').innerHTML = html;
}

// Settings Module
async function loadSettings() {
    if (!hasPermission('canViewSettings')) {
        document.getElementById('dynamicContent').innerHTML = '<div class="alert-premium alert-error">You do not have permission to view settings.</div>';
        return;
    }
    
    const html = `
        <div class="module-header">
            <div class="module-title"><i class="fas fa-cog"></i> System Settings</div>
        </div>
        <div class="settings-container">
            <div class="settings-section">
                <h3>Profile Information</h3>
                <div class="profile-info">
                    <p><strong>Name:</strong> ${currentUser?.full_name}</p>
                    <p><strong>Username:</strong> ${currentUser?.username}</p>
                    <p><strong>Email:</strong> ${currentUser?.email}</p>
                    <p><strong>Role:</strong> ${currentUser?.role}</p>
                </div>
                <button class="btn-add-premium" onclick="changePassword()"><i class="fas fa-key"></i> Change Password</button>
            </div>
        </div>
    `;
    
    document.getElementById('dynamicContent').innerHTML = html;
}

// Helper Functions
async function loadLandingStats() {
    try {
        const response = await fetch(`${API_BASE}?action=landing_stats`);
        const stats = await response.json();
        document.getElementById('heroStatBuses').innerText = stats.active_buses || 0;
        document.getElementById('heroStatDrivers').innerText = stats.total_drivers || 0;
        document.getElementById('heroStatRoutes').innerText = stats.total_routes || 0;
        document.getElementById('heroStatCustomers').innerText = stats.total_passengers || 0;
        document.getElementById('statTotalBuses').innerText = stats.total_buses || 0;
        document.getElementById('statTotalDrivers').innerText = stats.total_drivers || 0;
        document.getElementById('statTotalRoutes').innerText = stats.total_routes || 0;
        document.getElementById('statTotalPassengers').innerText = stats.total_passengers || 0;
        document.getElementById('statTotalTickets').innerText = stats.total_tickets || 0;
        document.getElementById('statTotalRevenue').innerText = stats.total_revenue ? `TZS ${stats.total_revenue.toLocaleString()}` : 'TZS 0';
    } catch (error) { console.error(error); }
}

function generatePagination(totalPages, currentPage) {
    if (totalPages <= 1) return '';
    let html = '<div class="pagination-premium">';
    for (let i = 1; i <= Math.min(totalPages, 10); i++) {
        html += `<button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
    html += '</div>';
    return html;
}

function changePage(page) { currentPage = page; loadModule(currentModule); }
function searchTable() { const input = document.getElementById('searchInput'); if(input) { searchTerm = input.value; currentPage = 1; loadModule(currentModule); } }
function refreshTracking() { loadModule('tracking'); }

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-premium alert-${type}`;
    alertDiv.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function generateReport(type) {
    if (!hasPermission('canGenerateReport')) {
        showAlert('You do not have permission to generate reports', 'error');
        return;
    }
    window.open(`${API_BASE}?action=generate_report&type=${type}`, '_blank');
}

function changePassword() {
    showModal('Change Password', `
        <form id="changePasswordForm" onsubmit="updatePassword(event)">
            <div class="form-group"><label>Current Password</label><input type="password" id="currentPwd" required></div>
            <div class="form-group"><label>New Password</label><input type="password" id="newPwd" required></div>
            <div class="form-group"><label>Confirm Password</label><input type="password" id="confirmPwd" required></div>
            <button type="submit" class="btn-login-modal">Update Password</button>
        </form>
    `);
}

async function updatePassword(event) {
    event.preventDefault();
    const newPwd = document.getElementById('newPwd').value;
    const confirmPwd = document.getElementById('confirmPwd').value;
    
    if (newPwd !== confirmPwd) {
        showAlert('Passwords do not match!', 'error');
        return;
    }
    
    const response = await fetch(`${API_BASE}?action=change_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            current_password: document.getElementById('currentPwd').value,
            new_password: newPwd
        })
    });
    const data = await response.json();
    if (data.success) {
        showAlert('Password changed successfully!', 'success');
        closeModal();
    } else {
        showAlert(data.message, 'error');
    }
}

function updateLocation(busId) {
    showModal('Update Bus Location', `
        <form id="locationForm" onsubmit="saveLocation(event, ${busId})">
            <div class="form-group"><label>Current Location</label><input type="text" id="location" placeholder="Enter current location" required></div>
            <div class="form-group"><label>Status</label><select id="status"><option value="Waiting">Waiting</option><option value="Departed">Departed</option><option value="Arrived">Arrived</option><option value="Delayed">Delayed</option></select></div>
            <button type="submit" class="btn-login-modal">Update Location</button>
        </form>
    `);
}

async function saveLocation(event, busId) {
    event.preventDefault();
    const response = await fetch(`${API_BASE}?action=update_tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            bus_id: busId,
            location: document.getElementById('location').value,
            status: document.getElementById('status').value
        })
    });
    const data = await response.json();
    if (data.success) {
        showAlert('Location updated successfully!', 'success');
        closeModal();
        loadModule('tracking');
    } else {
        showAlert(data.message, 'error');
    }
}

function viewTicket(id) {
    showModal('Ticket Details', `<div class="alert-premium alert-info">Loading ticket details...</div>`);
    // Fetch and display ticket details
}

function cancelTicket(id) {
    if (confirm('Are you sure you want to cancel this ticket?')) {
        fetch(`${API_BASE}?action=cancel_ticket&id=${id}`, { method: 'POST' })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    showAlert('Ticket cancelled successfully!', 'success');
                    loadModule('tickets');
                } else {
                    showAlert(data.message, 'error');
                }
            });
    }
}

// CRUD Functions for Users
async function showAddUserModal() {
    const html = `
        <form id="addUserForm" onsubmit="addUser(event)">
            <div class="form-group"><label>Full Name *</label><input type="text" id="fullName" required></div>
            <div class="form-group"><label>Username *</label><input type="text" id="username" required></div>
            <div class="form-group"><label>Email *</label><input type="email" id="email" required></div>
            <div class="form-group"><label>Password *</label><input type="password" id="password" required></div>
            <div class="form-group"><label>Role *</label><select id="role"><option value="Passenger">Passenger</option><option value="Driver">Driver</option><option value="Admin">Admin</option></select></div>
            <button type="submit" class="btn-login-modal">Add User</button>
        </form>
    `;
    showModal('Add New User', html);
}

async function addUser(event) {
    event.preventDefault();
    const userData = {
        full_name: document.getElementById('fullName').value,
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value
    };
    
    const response = await fetch(`${API_BASE}?action=add_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (data.success) {
        showAlert('User added successfully!', 'success');
        closeModal();
        loadModule('users');
    } else {
        showAlert(data.message, 'error');
    }
}

async function editUser(id) {
    const response = await fetch(`${API_BASE}?action=get_user&id=${id}`);
    const user = await response.json();
    
    const html = `
        <form id="editUserForm" onsubmit="updateUser(event, ${id})">
            <div class="form-group"><label>Full Name *</label><input type="text" id="fullName" value="${escapeHtml(user.full_name)}" required></div>
            <div class="form-group"><label>Username *</label><input type="text" id="username" value="${escapeHtml(user.username)}" required></div>
            <div class="form-group"><label>Email *</label><input type="email" id="email" value="${escapeHtml(user.email)}" required></div>
            <div class="form-group"><label>Role *</label><select id="role"><option value="Passenger" ${user.role === 'Passenger' ? 'selected' : ''}>Passenger</option><option value="Driver" ${user.role === 'Driver' ? 'selected' : ''}>Driver</option><option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option></select></div>
            <button type="submit" class="btn-login-modal">Update User</button>
        </form>
    `;
    showModal('Edit User', html);
}

async function updateUser(event, id) {
    event.preventDefault();
    const userData = {
        user_id: id,
        full_name: document.getElementById('fullName').value,
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value
    };
    
    const response = await fetch(`${API_BASE}?action=update_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (data.success) {
        showAlert('User updated successfully!', 'success');
        closeModal();
        loadModule('users');
    } else {
        showAlert(data.message, 'error');
    }
}

async function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        const response = await fetch(`${API_BASE}?action=delete_user&id=${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
            showAlert('User deleted successfully!', 'success');
            loadModule('users');
        } else {
            showAlert(data.message, 'error');
        }
    }
}

// CRUD Functions for Buses
async function showAddBusModal() {
    const html = `
        <form id="addBusForm" onsubmit="addBus(event)">
            <div class="form-group"><label>Bus Number *</label><input type="text" id="busNumber" required></div>
            <div class="form-group"><label>Bus Name *</label><input type="text" id="busName" required></div>
            <div class="form-group"><label>Registration Number *</label><input type="text" id="registrationNumber" required></div>
            <div class="form-group"><label>Capacity *</label><input type="number" id="capacity" required></div>
            <div class="form-group"><label>Status</label><select id="busStatus"><option value="Available">Available</option><option value="On Route">On Route</option><option value="Maintenance">Maintenance</option><option value="Inactive">Inactive</option></select></div>
            <button type="submit" class="btn-login-modal">Add Bus</button>
        </form>
    `;
    showModal('Add New Bus', html);
}

async function addBus(event) {
    event.preventDefault();
    const busData = {
        bus_number: document.getElementById('busNumber').value,
        bus_name: document.getElementById('busName').value,
        registration_number: document.getElementById('registrationNumber').value,
        capacity: parseInt(document.getElementById('capacity').value),
        status: document.getElementById('busStatus').value
    };
    
    const response = await fetch(`${API_BASE}?action=add_bus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(busData)
    });
    const data = await response.json();
    if (data.success) {
        showAlert('Bus added successfully!', 'success');
        closeModal();
        loadModule('buses');
    } else {
        showAlert(data.message, 'error');
    }
}

async function editBus(id) {
    const response = await fetch(`${API_BASE}?action=get_bus&id=${id}`);
    const bus = await response.json();
    
    const html = `
        <form id="editBusForm" onsubmit="updateBus(event, ${id})">
            <div class="form-group"><label>Bus Number *</label><input type="text" id="busNumber" value="${escapeHtml(bus.bus_number)}" required></div>
            <div class="form-group"><label>Bus Name *</label><input type="text" id="busName" value="${escapeHtml(bus.bus_name)}" required></div>
            <div class="form-group"><label>Registration Number *</label><input type="text" id="registrationNumber" value="${escapeHtml(bus.registration_number)}" required></div>
            <div class="form-group"><label>Capacity *</label><input type="number" id="capacity" value="${bus.capacity}" required></div>
            <div class="form-group"><label>Status</label><select id="busStatus"><option value="Available" ${bus.status === 'Available' ? 'selected' : ''}>Available</option><option value="On Route" ${bus.status === 'On Route' ? 'selected' : ''}>On Route</option><option value="Maintenance" ${bus.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option><option value="Inactive" ${bus.status === 'Inactive' ? 'selected' : ''}>Inactive</option></select></div>
            <button type="submit" class="btn-login-modal">Update Bus</button>
        </form>
    `;
    showModal('Edit Bus', html);
}

async function updateBus(event, id) {
    event.preventDefault();
    const busData = {
        bus_id: id,
        bus_number: document.getElementById('busNumber').value,
        bus_name: document.getElementById('busName').value,
        registration_number: document.getElementById('registrationNumber').value,
        capacity: parseInt(document.getElementById('capacity').value),
        status: document.getElementById('busStatus').value
    };
    
    const response = await fetch(`${API_BASE}?action=update_bus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(busData)
    });
    const data = await response.json();
    if (data.success) {
        showAlert('Bus updated successfully!', 'success');
        closeModal();
        loadModule('buses');
    } else {
        showAlert(data.message, 'error');
    }
}

async function deleteBus(id) {
    if (confirm('Are you sure you want to delete this bus?')) {
        const response = await fetch(`${API_BASE}?action=delete_bus&id=${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
            showAlert('Bus deleted successfully!', 'success');
            loadModule('buses');
        } else {
            showAlert(data.message, 'error');
        }
    }
}

// Driver CRUD functions
async function showAddDriverModal() {
    const html = `
        <form id="addDriverForm" onsubmit="addDriver(event)">
            <div class="form-group"><label>Full Name *</label><input type="text" id="fullName" required></div>
            <div class="form-group"><label>Phone *</label><input type="tel" id="phone" required></div>
            <div class="form-group"><label>Email</label><input type="email" id="email"></div>
            <div class="form-group"><label>License Number *</label><input type="text" id="licenseNumber" required></div>
            <div class="form-group"><label>Address</label><textarea id="address" rows="3"></textarea></div>
            <button type="submit" class="btn-login-modal">Add Driver</button>
        </form>
    `;
    showModal('Add New Driver', html);
}

async function addDriver(event) {
    event.preventDefault();
    const driverData = {
        full_name: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        license_number: document.getElementById('licenseNumber').value,
        address: document.getElementById('address').value
    };
    
    const response = await fetch(`${API_BASE}?action=add_driver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData)
    });
    const data = await response.json();
    if (data.success) {
        showAlert('Driver added successfully!', 'success');
        closeModal();
        loadModule('drivers');
    } else {
        showAlert(data.message, 'error');
    }
}

async function editDriver(id) {
    const response = await fetch(`${API_BASE}?action=get_driver&id=${id}`);
    const driver = await response.json();
    
    const html = `
        <form id="editDriverForm" onsubmit="updateDriver(event, ${id})">
            <div class="form-group"><label>Full Name *</label><input type="text" id="fullName" value="${escapeHtml(driver.full_name)}" required></div>
            <div class="form-group"><label>Phone *</label><input type="tel" id="phone" value="${escapeHtml(driver.phone)}" required></div>
            <div class="form-group"><label>Email</label><input type="email" id="email" value="${escapeHtml(driver.email)}"></div>
            <div class="form-group"><label>License Number *</label><input type="text" id="licenseNumber" value="${escapeHtml(driver.license_number)}" required></div>
            <div class="form-group"><label>Address</label><textarea id="address" rows="3">${escapeHtml(driver.address)}</textarea></div>
            <button type="submit" class="btn-login-modal">Update Driver</button>
        </form>
    `;
    showModal('Edit Driver', html);
}

async function updateDriver(event, id) {
    event.preventDefault();
    const driverData = {
        driver_id: id,
        full_name: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        license_number: document.getElementById('licenseNumber').value,
        address: document.getElementById('address').value
    };
    
    const response = await fetch(`${API_BASE}?action=update_driver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData)
    });
    const data = await response.json();
    if (data.success) {
        showAlert('Driver updated successfully!', 'success');
        closeModal();
        loadModule('drivers');
    } else {
        showAlert(data.message, 'error');
    }
}

async function deleteDriver(id) {
    if (confirm('Are you sure you want to delete this driver?')) {
        const response = await fetch(`${API_BASE}?action=delete_driver&id=${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
            showAlert('Driver deleted successfully!', 'success');
            loadModule('drivers');
        } else {
            showAlert(data.message, 'error');
        }
    }
}

// Route CRUD functions
async function showAddRouteModal() {
    const html = `
        <form id="addRouteForm" onsubmit="addRoute(event)">
            <div class="form-group"><label>Route Name *</label><input type="text" id="routeName" required></div>
            <div class="form-group"><label>Origin *</label><input type="text" id="origin" required></div>
            <div class="form-group"><label>Destination *</label><input type="text" id="destination" required></div>
            <div class="form-group"><label>Distance (km)</label><input type="number" id="distance" step="0.01"></div>
            <div class="form-group"><label>Estimated Time</label><input type="text" id="estimatedTime" placeholder="e.g., 2 hours 30 minutes"></div>
            <button type="submit" class="btn-login-modal">Add Route</button>
        </form>
    `;
    showModal('Add New Route', html);
}

async function addRoute(event) {
    event.preventDefault();
    const routeData = {
        route_name: document.getElementById('routeName').value,
        origin: document.getElementById('origin').value,
        destination: document.getElementById('destination').value,
        distance_km: parseFloat(document.getElementById('distance').value) || null,
        estimated_time: document.getElementById('estimatedTime').value
    };
    
    const response = await fetch(`${API_BASE}?action=add_route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeData)
    });
    const data = await response.json();
    if (data.success) {
        showAlert('Route added successfully!', 'success');
        closeModal();
        loadModule('routes');
    } else {
        showAlert(data.message, 'error');
    }
}

async function editRoute(id) {
    const response = await fetch(`${API_BASE}?action=get_route&id=${id}`);
    const route = await response.json();
    
    const html = `
        <form id="editRouteForm" onsubmit="updateRoute(event, ${id})">
            <div class="form-group"><label>Route Name *</label><input type="text" id="routeName" value="${escapeHtml(route.route_name)}" required></div>
            <div class="form-group"><label>Origin *</label><input type="text" id="origin" value="${escapeHtml(route.origin)}" required></div>
            <div class="form-group"><label>Destination *</label><input type="text" id="destination" value="${escapeHtml(route.destination)}" required></div>
            <div class="form-group"><label>Distance (km)</label><input type="number" id="distance" step="0.01" value="${route.distance_km}"></div>
            <div class="form-group"><label>Estimated Time</label><input type="text" id="estimatedTime" value="${escapeHtml(route.estimated_time)}"></div>
            <button type="submit" class="btn-login-modal">Update Route</button>
        </form>
    `;
    showModal('Edit Route', html);
}

async function updateRoute(event, id) {
    event.preventDefault();
    const routeData = {
        route_id: id,
        route_name: document.getElementById('routeName').value,
        origin: document.getElementById('origin').value,
        destination: document.getElementById('destination').value,
        distance_km: parseFloat(document.getElementById('distance').value) || null,
        estimated_time: document.getElementById('estimatedTime').value
    };
    
    const response = await fetch(`${API_BASE}?action=update_route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeData)
    });
    const data = await response.json();
    if (data.success) {
        showAlert('Route updated successfully!', 'success');
        closeModal();
        loadModule('routes');
    } else {
        showAlert(data.message, 'error');
    }
}

async function deleteRoute(id) {
    if (confirm('Are you sure you want to delete this route?')) {
        const response = await fetch(`${API_BASE}?action=delete_route&id=${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
            showAlert('Route deleted successfully!', 'success');
            loadModule('routes');
        } else {
            showAlert(data.message, 'error');
        }
    }
}

// Book Ticket function
async function showBookTicketModal() {
    // Fetch buses and routes for selection
    const [busesRes, routesRes] = await Promise.all([
        fetch(`${API_BASE}?action=get_all_buses`),
        fetch(`${API_BASE}?action=get_all_routes`)
    ]);
    const buses = await busesRes.json();
    const routes = await routesRes.json();
    
    const html = `
        <form id="bookTicketForm" onsubmit="bookTicket(event)">
            <div class="form-group"><label>Full Name *</label><input type="text" id="passengerName" required></div>
            <div class="form-group"><label>Phone</label><input type="tel" id="phone"></div>
            <div class="form-group"><label>Email</label><input type="email" id="email"></div>
            <div class="form-group"><label>Bus *</label><select id="busId" required>${buses.map(b => `<option value="${b.bus_id}">${escapeHtml(b.bus_number)} - ${escapeHtml(b.bus_name)} (${b.capacity} seats)</option>`).join('')}</select></div>
            <div class="form-group"><label>Route *</label><select id="routeId" required>${routes.map(r => `<option value="${r.route_id}">${escapeHtml(r.route_name)} (${r.distance_km} km)</option>`).join('')}</select></div>
            <div class="form-group"><label>Seat Number</label><input type="text" id="seatNumber"></div>
            <div class="form-group"><label>Amount (TZS) *</label><input type="number" id="amount" required></div>
            <div class="form-group"><label>Payment Method *</label><select id="paymentMethod" required><option value="Cash">Cash</option><option value="M-Pesa">M-Pesa</option><option value="TigoPesa">TigoPesa</option><option value="AirtelMoney">Airtel Money</option><option value="Bank">Bank Transfer</option></select></div>
            <button type="submit" class="btn-login-modal">Book Ticket</button>
        </form>
    `;
    showModal('Book New Ticket', html);
}

async function bookTicket(event) {
    event.preventDefault();
    const ticketData = {
        passenger_name: document.getElementById('passengerName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        bus_id: document.getElementById('busId').value,
        route_id: document.getElementById('routeId').value,
        seat_number: document.getElementById('seatNumber').value,
        amount: parseFloat(document.getElementById('amount').value),
        payment_method: document.getElementById('paymentMethod').value
    };
    
    const response = await fetch(`${API_BASE}?action=book_ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
    });
    const data = await response.json();
    if (data.success) {
        showAlert(`Ticket booked successfully! Ticket ID: ${data.ticket_id}`, 'success');
        closeModal();
        loadModule('tickets');
    } else {
        showAlert(data.message, 'error');
    }
}

// Announcement function
async function showAddAnnouncementModal() {
    const html = `
        <form id="addAnnouncementForm" onsubmit="addAnnouncement(event)">
            <div class="form-group"><label>Title *</label><input type="text" id="title" required></div>
            <div class="form-group"><label>Message *</label><textarea id="message" rows="5" required></textarea></div>
            <button type="submit" class="btn-login-modal">Post Announcement</button>
        </form>
    `;
    showModal('Add Announcement', html);
}

async function addAnnouncement(event) {
    event.preventDefault();
    const announcementData = {
        title: document.getElementById('title').value,
        message: document.getElementById('message').value
    };
    
    const response = await fetch(`${API_BASE}?action=add_announcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData)
    });
    const data = await response.json();
    if (data.success) {
        showAlert('Announcement posted successfully!', 'success');
        closeModal();
        loadModule('announcements');
    } else {
        showAlert(data.message, 'error');
    }
}