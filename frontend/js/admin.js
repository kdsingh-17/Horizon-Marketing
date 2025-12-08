// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.token = 'Bearer admin123'; // Simple auth for demo
        this.currentPage = 1;
        this.currentStatus = '';
        this.currentSearch = '';
        this.currentLeadId = null;
        
        this.init();
    }
    
    init() {
        // Check if user is on admin page
        if (!window.location.pathname.includes('admin.html')) return;
        
        // Load dashboard data
        this.loadDashboard();
        this.loadLeadsTable();
        
        // Setup event listeners
        document.getElementById('refreshBtn')?.addEventListener('click', () => this.loadDashboard());
        document.getElementById('searchLeads')?.addEventListener('input', (e) => this.handleSearch(e));
        document.getElementById('statusFilter')?.addEventListener('change', (e) => this.handleFilter(e));
        document.getElementById('prevPage')?.addEventListener('click', () => this.changePage(-1));
        document.getElementById('nextPage')?.addEventListener('click', () => this.changePage(1));
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
        
        // Modal events
        document.getElementById('saveStatus')?.addEventListener('click', () => this.updateLeadStatus());
        document.getElementById('cancelStatus')?.addEventListener('click', () => this.hideModal());
        
        // Click outside modal to close
        document.getElementById('statusModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'statusModal') this.hideModal();
        });
    }
    
    async loadDashboard() {
        try {
            const response = await fetch('http://localhost:5000/api/admin/stats', {
                headers: { 'Authorization': this.token }
            });
            
            const data = await response.json();
            
            if (data.success) {
    // Update stats cards
    document.getElementById('totalLeads').textContent = data.data.totalLeads;
    document.getElementById('newLeads').textContent = data.data.newLeads;
    document.getElementById('contactedLeads').textContent = data.data.contactedLeads;
    document.getElementById('convertedLeads').textContent = data.data.convertedLeads;
    
    // Update service chart
    this.updateServiceChart(data.data.serviceStats);
    
    // Update recent leads
    this.updateRecentLeads(data.data.recentLeads);
    
} else {
    console.error('Failed to load dashboard:', data.message);
}
} catch (error) {
console.error('Dashboard load error:', error);
}
}

updateServiceChart(serviceStats) {
const ctx = document.getElementById('serviceChart').getContext('2d');
if (this.serviceChart) this.serviceChart.destroy();

const labels = serviceStats.map(item => {
    const services = {
        'seo': 'Local SEO',
        'advertising': 'Advertising',
        'social': 'Social Media',
        'content': 'Content',
        'email': 'Email Marketing',
        'analytics': 'Analytics',
        'package': 'Custom Package'
    };
    return services[item._id] || item._id;
});

const data = serviceStats.map(item => item.count);

this.serviceChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: labels,
        datasets: [{
            data: data,
            backgroundColor: [
                '#3a86ff', '#8338ec', '#ff006e', '#ffbe0b',
                '#06d6a0', '#118ab2', '#ef476f'
            ]
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    }
});
}

updateRecentLeads(recentLeads) {
const container = document.getElementById('recentLeads');
if (!recentLeads.length) {
    container.innerHTML = '<p>No recent leads</p>';
    return;
}

let html = '';
recentLeads.forEach(lead => {
    const date = new Date(lead.createdAt).toLocaleDateString();
    const statusBadge = `<span class="status-badge status-${lead.status}">${lead.status}</span>`;
    
    html += `
        <div style="padding: 10px; border-bottom: 1px solid #eee;">
            <div style="display: flex; justify-content: space-between;">
                <strong>${lead.firstName} ${lead.lastName}</strong>
                ${statusBadge}
            </div>
            <div style="color: #666; font-size: 0.9em;">
                ${lead.businessName} • ${lead.serviceInterest}
            </div>
            <div style="color: #999; font-size: 0.8em;">
                ${date}
            </div>
        </div>
    `;
});

container.innerHTML = html;
}

async loadLeadsTable() {
try {
    const url = `http://localhost:5000/api/admin/leads?page=${this.currentPage}&limit=10&status=${this.currentStatus}&search=${this.currentSearch}`;
    const response = await fetch(url, {
        headers: { 'Authorization': this.token }
    });
    
    const data = await response.json();
    
    if (data.success) {
        this.updateLeadsTable(data.data, data.pagination);
    }
} catch (error) {
    console.error('Leads load error:', error);
}
}

updateLeadsTable(leads, pagination) {
const tbody = document.getElementById('leadsTableBody');
if (!leads.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="padding: 20px; text-align: center;">No leads found</td></tr>';
    return;
}

let html = '';
leads.forEach(lead => {
    const date = new Date(lead.createdAt).toLocaleDateString();
    const statusClass = `status-${lead.status}`;
    const statusText = lead.status.charAt(0).toUpperCase() + lead.status.slice(1);
    
    html += `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px;">
                <strong>${lead.firstName} ${lead.lastName}</strong><br>
                <small style="color: #666;">${lead.email}</small>
            </td>
            <td style="padding: 12px;">${lead.businessName}</td>
            <td style="padding: 12px;">${lead.serviceInterest}</td>
            <td style="padding: 12px;">${date}</td>
            <td style="padding: 12px;">
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
            <td style="padding: 12px;">
                <button class="btn-status" data-id="${lead._id}" style="padding: 5px 10px; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                    Update
                </button>
            </td>
        </tr>
    `;
});

tbody.innerHTML = html;

// Add status update button listeners
document.querySelectorAll('.btn-status').forEach(btn => {
    btn.addEventListener('click', (e) => this.showStatusModal(e.target.dataset.id));
});

// Update pagination
this.updatePagination(pagination);
}

updatePagination(pagination) {
const info = document.getElementById('paginationInfo');
const prevBtn = document.getElementById('prevPage');
const nextBtn = document.getElementById('nextPage');

info.textContent = `Showing ${((pagination.page - 1) * pagination.limit) + 1} to ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} leads`;

prevBtn.disabled = pagination.page === 1;
nextBtn.disabled = pagination.page === pagination.pages;

// Update page event listeners
prevBtn.onclick = () => this.changePage(-1);
nextBtn.onclick = () => this.changePage(1);
}

changePage(direction) {
this.currentPage += direction;
this.loadLeadsTable();
}

handleSearch(e) {
this.currentSearch = e.target.value;
this.currentPage = 1;
setTimeout(() => this.loadLeadsTable(), 300); // Debounce
}

handleFilter(e) {
this.currentStatus = e.target.value;
this.currentPage = 1;
this.loadLeadsTable();
}

showStatusModal(leadId) {
this.currentLeadId = leadId;
document.getElementById('statusModal').style.display = 'flex';
// You could pre-fill current status here
}

hideModal() {
document.getElementById('statusModal').style.display = 'none';
this.currentLeadId = null;
}

async updateLeadStatus() {
try {
    const status = document.getElementById('updateStatus').value;
    const notes = document.getElementById('updateNotes').value;
    
    const response = await fetch(`http://localhost:5000/api/admin/leads/${this.currentLeadId}`, {
        method: 'PUT',
        headers: {
            'Authorization': this.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, notes })
    });
    
    const data = await response.json();
    
    if (data.success) {
        alert('Status updated successfully!');
        this.hideModal();
        this.loadDashboard();
        this.loadLeadsTable();
    } else {
        alert('Failed to update status: ' + data.message);
    }
} catch (error) {
    alert('Error updating status');
    console.error(error);
}
}

logout() {
if (confirm('Are you sure you want to logout?')) {
    window.location.href = 'index.html';
}
}
}

// Add some CSS for status badges
const style = document.createElement('style');
style.textContent = `
.status-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: 600;
}
.status-new { background: #ff006e; color: white; }
.status-contacted { background: #8338ec; color: white; }
.status-converted { background: #06d6a0; color: white; }
.status-archived { background: #6c757d; color: white; }
`;
document.head.appendChild(style);

// Initialize dashboard when DOM loads
document.addEventListener('DOMContentLoaded', () => {
new AdminDashboard();
});