/**
 * Analytics Dashboard - Frontend Controller
 * Manages charts, metrics, and data visualization
 */

class AnalyticsDashboard {
    constructor(options = {}) {
        this.apiEndpoint = options.apiEndpoint || '/admin/api/analytics/dashboard';
        this.refreshInterval = options.refreshInterval || 300000; // 5 minutes
        this.charts = {};
        this.data = null;
        this.init();
    }

    init() {
        console.log('📊 Initializing Analytics Dashboard...');
        this.bindEvents();
        this.loadDashboardData();
        this.setupAutoRefresh();
    }

    bindEvents() {
        // Date range selector
        const dateRange = document.getElementById('dateRange');
        if (dateRange) {
            dateRange.addEventListener('change', () => {
                this.loadDashboardData();
            });
        }
    }

    async loadDashboardData() {
        const loading = document.getElementById('loadingOverlay');
        if (loading) loading.style.display = 'flex';

        try {
            const days = document.getElementById('dateRange')?.value || 30;
            const response = await fetch(`${this.apiEndpoint}?days=${days}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            this.data = await response.json();
            console.log('📊 Analytics data loaded:', this.data);

            this.updateMetrics();
            this.updateCharts();
            this.updateTables();
            this.updateFunnel();

        } catch (error) {
            console.error('❌ Error loading analytics data:', error);
            this.showError('Erro ao carregar dados de analytics. Verifique se as tabelas SQL foram criadas.');
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    updateMetrics() {
        if (!this.data || !this.data.stats) {
            console.warn('⚠️  No stats data available');
            return;
        }

        const { stats } = this.data;

        // Total Sessions
        this.setMetric('totalSessions', stats.totalSessions || 0);
        this.setChange('sessionsChange', stats.sessionsChange || 0);

        // Unique Visitors
        this.setMetric('uniqueVisitors', stats.uniqueVisitors || 0);
        this.setChange('visitorsChange', stats.visitorsChange || 0);

        // Page Views
        this.setMetric('pageViews', stats.pageViews || 0);
        this.setChange('pageViewsChange', stats.pageViewsChange || 0);

        // WhatsApp Clicks
        this.setMetric('whatsappClicks', stats.whatsappClicks || 0);
        this.setChange('whatsappChange', stats.whatsappChange || 0);
    }

    setMetric(elementId, value) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = this.formatNumber(value);
        }
    }

    setChange(elementId, percentage) {
        const el = document.getElementById(elementId);
        if (el) {
            const isPositive = percentage >= 0;
            el.textContent = `${Math.abs(percentage).toFixed(1)}% vs período anterior`;
            el.className = `metric-change ${isPositive ? 'positive' : 'negative'}`;
        }
    }

    updateCharts() {
        if (!this.data) return;

        this.updateTrafficChart();
        this.updateDeviceChart();
        this.updateSourceChart();
    }

    updateTrafficChart() {
        const canvas = document.getElementById('trafficChart');
        if (!canvas) return;

        // Destroy existing chart
        if (this.charts.traffic) {
            this.charts.traffic.destroy();
        }

        const ctx = canvas.getContext('2d');
        const { traffic = [] } = this.data;

        // Generate sample data if empty
        const labels = traffic.length > 0 
            ? traffic.map(d => new Date(d.date).toLocaleDateString('pt-PT', { month: 'short', day: 'numeric' }))
            : this.generateDateLabels(30);

        const sessions = traffic.length > 0
            ? traffic.map(d => d.sessions)
            : this.generateSampleData(30, 10, 100);

        const pageViews = traffic.length > 0
            ? traffic.map(d => d.pageViews)
            : this.generateSampleData(30, 20, 200);

        this.charts.traffic = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Sessões',
                        data: sessions,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Page Views',
                        data: pageViews,
                        borderColor: '#4facfe',
                        backgroundColor: 'rgba(79, 172, 254, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateDeviceChart() {
        const canvas = document.getElementById('deviceChart');
        if (!canvas) return;

        if (this.charts.device) {
            this.charts.device.destroy();
        }

        const ctx = canvas.getContext('2d');
        const { devices = {} } = this.data;

        const hasData = devices.desktop || devices.mobile || devices.tablet;
        const data = hasData 
            ? [devices.desktop || 0, devices.mobile || 0, devices.tablet || 0]
            : [45, 40, 15]; // Sample data

        this.charts.device = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Desktop', 'Mobile', 'Tablet'],
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#667eea',
                        '#f093fb',
                        '#4facfe'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateSourceChart() {
        const canvas = document.getElementById('sourceChart');
        if (!canvas) return;

        if (this.charts.source) {
            this.charts.source.destroy();
        }

        const ctx = canvas.getContext('2d');
        const { sources = {} } = this.data;

        const labels = Object.keys(sources).length > 0
            ? Object.keys(sources)
            : ['Direct', 'Social', 'Search', 'Referral'];

        const data = Object.keys(sources).length > 0
            ? Object.values(sources)
            : [40, 30, 20, 10]; // Sample data

        this.charts.source = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sessões',
                    data: data,
                    backgroundColor: [
                        '#667eea',
                        '#f093fb',
                        '#4facfe',
                        '#43e97b'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateTables() {
        this.updateTopPagesTable();
        this.updateTopProductsTable();
    }

    updateTopPagesTable() {
        const tbody = document.getElementById('topPagesTable');
        if (!tbody) return;

        const { topPages = [] } = this.data;

        if (topPages.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="loading">Sem dados disponíveis</td></tr>';
            return;
        }

        tbody.innerHTML = topPages.map(page => `
            <tr>
                <td>${this.escapeHtml(page.path)}</td>
                <td><strong>${this.formatNumber(page.views)}</strong></td>
                <td>${this.formatDuration(page.avgTime)}</td>
            </tr>
        `).join('');
    }

    updateTopProductsTable() {
        const tbody = document.getElementById('topProductsTable');
        if (!tbody) return;

        const { topProducts = [] } = this.data;

        if (topProducts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="loading">Sem dados disponíveis</td></tr>';
            return;
        }

        tbody.innerHTML = topProducts.map(product => `
            <tr>
                <td>${this.escapeHtml(product.name)}</td>
                <td><strong>${this.formatNumber(product.views)}</strong></td>
                <td>${this.formatNumber(product.whatsappClicks)}</td>
            </tr>
        `).join('');
    }

    updateFunnel() {
        const container = document.getElementById('conversionFunnel');
        if (!container) return;

        const { funnel = {} } = this.data;

        const stages = [
            { label: 'Visitas', value: funnel.sessions || 1000, percentage: 100 },
            { label: 'Produtos Visualizados', value: funnel.productViews || 450, percentage: 45 },
            { label: 'WhatsApp Clicado', value: funnel.whatsappClicks || 120, percentage: 12 },
            { label: 'Conversões', value: funnel.conversions || 45, percentage: 4.5 }
        ];

        container.innerHTML = stages.map((stage, index) => {
            const width = (stage.percentage / 100) * 100;
            return `
                <div class="funnel-stage">
                    <div class="funnel-bar" style="width: ${width}%">
                        <span class="funnel-label">${stage.label}</span>
                        <span class="funnel-value">${this.formatNumber(stage.value)}</span>
                    </div>
                    <span class="funnel-percentage">${stage.percentage.toFixed(1)}%</span>
                </div>
            `;
        }).join('');
    }

    setupAutoRefresh() {
        if (this.refreshInterval > 0) {
            setInterval(() => {
                console.log('🔄 Auto-refreshing analytics data...');
                this.loadDashboardData();
            }, this.refreshInterval);
        }
    }

    async exportReport() {
        console.log('📥 Exporting analytics report...');
        
        try {
            const days = document.getElementById('dateRange')?.value || 30;
            const response = await fetch(`/admin/api/analytics/export/dashboard?days=${days}&format=csv`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            console.log('✅ Report exported successfully');
        } catch (error) {
            console.error('❌ Export error:', error);
            alert('Erro ao exportar relatório. Por favor, tente novamente.');
        }
    }

    // Utility methods
    formatNumber(num) {
        return new Intl.NumberFormat('pt-PT').format(num || 0);
    }

    formatDuration(seconds) {
        if (!seconds) return '0s';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    generateDateLabels(days) {
        const labels = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('pt-PT', { month: 'short', day: 'numeric' }));
        }
        return labels;
    }

    generateSampleData(length, min, max) {
        return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    }

    showError(message) {
        alert(message);
    }
}

// Export for global access
window.AnalyticsDashboard = AnalyticsDashboard;

