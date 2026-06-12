import axios from 'axios';

// ─── Loader callbacks (set by LoaderProvider) ─────────────────────────────────
let _showLoader = null;
let _hideLoader = null;
export const registerLoaderCallbacks = (show, hide) => { _showLoader = show; _hideLoader = hide; };

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
    timeout: 15000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    if (_showLoader) _showLoader();
    return config;
});

// Global response error handler — dispatch event so AuthContext can clear user
api.interceptors.response.use(
    (res) => {
        if (_hideLoader) _hideLoader();
        return res;
    },
    (err) => {
        if (_hideLoader) _hideLoader();
        if (err.response?.status === 401) {
            const url = err.config?.url || '';
            // Notification calls are fire-and-forget — a 401 there must not log the user out
            if (!url.includes('/notifications')) {
                localStorage.removeItem('token');
                window.dispatchEvent(new Event('auth:logout'));
            }
        }
        return Promise.reject(err);
    }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
    login:           (data)    => api.post('/auth/login', data),
    register:        (data)    => api.post('/auth/register', data),
    registerAdmin:   (data)    => api.post('/auth/admin/register', data),
    me:              ()        => api.get('/auth/me'),
    logout:          ()        => api.get('/auth/logout'),
    updateProfile:   (data)    => api.put('/auth/updateprofile', data),
    changePassword:  (data)    => api.put('/auth/changepassword', data),
    forgotPassword:  (data)    => api.post('/auth/forgotpassword', data),
    resetPassword:   (token, data) => api.put(`/auth/resetpassword/${token}`, data),
    getDepartments:  ()        => api.get('/auth/departments'),
    getHolidays:     ()        => api.get('/auth/holidays'),
};

// ─── Admin — Dashboard ────────────────────────────────────────────────────────
export const dashboardAPI = {
    getStats:        ()        => api.get('/admin/stats'),
};

// ─── Admin — Employees ────────────────────────────────────────────────────────
export const employeesAPI = {
    getAll:          ()        => api.get('/admin/employees'),
    getById:         (id)      => api.get(`/admin/employees/${id}/profile`),
    getByEmployeeId: (employeeId) => api.get(`/admin/employees/id/${encodeURIComponent(employeeId)}`),
    add:             (data)    => api.post('/admin/employees', data),
    update:          (id, data)=> api.put(`/admin/employees/${id}`, data),
    delete:          (id)      => api.delete(`/admin/employees/${id}`),
};

// ─── Admin — Departments ──────────────────────────────────────────────────────
export const departmentsAPI = {
    getAll:          ()        => api.get('/admin/departments'),
    add:             (data)    => api.post('/admin/departments', data),
    update:          (id, data)=> api.put(`/admin/departments/${id}`, data),
    delete:          (id)      => api.delete(`/admin/departments/${id}`),
};

// ─── Admin — Leaves ───────────────────────────────────────────────────────────
export const leavesAdminAPI = {
    getAll:          ()        => api.get('/admin/leaves'),
    updateStatus:    (id, data)=> api.put(`/admin/leaves/${id}`, data),
};

// ─── Admin — Attendance ───────────────────────────────────────────────────────
export const attendanceAdminAPI = {
    getToday:        ()        => api.get('/admin/attendance'),
    getAll:          ()        => api.get('/admin/attendance/all'),
    override:        (data)    => api.post('/admin/attendance/override', data),
};

// ─── Admin — Holidays ─────────────────────────────────────────────────────────
export const holidaysAPI = {
    getAll:          ()        => api.get('/admin/holidays'),
    add:             (data)    => api.post('/admin/holidays', data),
    updateStatus:    (id, data)=> api.put(`/admin/holidays/${id}`, data),
    delete:          (id)      => api.delete(`/admin/holidays/${id}`),
};

// ─── Admin — Recruitment ──────────────────────────────────────────────────────
export const recruitmentAPI = {
    getAll:          ()        => api.get('/admin/recruitment'),
    getById:         (id)      => api.get(`/admin/recruitment/${id}`),
    add:             (data)    => api.post('/admin/recruitment', data),
    update:          (id, data)=> api.put(`/admin/recruitment/${id}`, data),
    action:          (id, data)=> api.put(`/admin/recruitment/${id}/action`, data),
    delete:          (id)      => api.delete(`/admin/recruitment/${id}`),
};

export const publicRecruitmentAPI = {
    apply:           (data)    => api.post('/public/recruitment/apply', data),
};

// ─── Admin — Offer Letter ─────────────────────────────────────────────────────
export const offerLetterAPI = {
    send:            (data)    => api.post('/admin/offer-letter', data),
};

// ─── Employee — Leave ─────────────────────────────────────────────────────────
export const leaveAPI = {
    getMyLeaves:     ()        => api.get('/employee/leave'),
    apply:           (data)    => api.post('/employee/leave', data),
};

// ─── Employee — Attendance ────────────────────────────────────────────────────
export const attendanceAPI = {
    getMyAttendance: ()        => api.get('/employee/attendance'),
    markAttendance:  (data)    => api.post('/employee/attendance', data),
    checkOut:        ()        => api.put('/employee/attendance/checkout'),
    getByPlace:      (address) => api.get(`/employee/place${address ? `?address=${encodeURIComponent(address)}` : ''}`),
};

// ─── Employee — Salary ────────────────────────────────────────────────────────
export const salaryAPI = {
    getMySalary:     ()        => api.get('/employee/salary'),
};

// ─── Employee — Profile ───────────────────────────────────────────────────────
export const employeeProfileAPI = {
    get:             ()        => api.get('/employee/profile'),
    update:          (data)    => api.put('/employee/profile', data),
};

// ─── Employee — Holidays ──────────────────────────────────────────────────────
export const employeeHolidaysAPI = {
    getAll:          ()        => api.get('/employee/holidays'),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsAPI = {
    getAll:          ()        => api.get('/notifications'),
    send:            (data)    => api.post('/admin/notifications/send', data),
    markRead:        (id)      => api.put(`/notifications/${id}/read`),
    markAllRead:     ()        => api.put('/notifications/read-all'),
    deleteAll:       ()        => api.delete('/notifications'),
};

export default api;
