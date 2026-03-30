// script.js
$(document).ready(function () {
    // Fake market data
    let markets = [
        { symbol: "BTC/USDT", price: 68420.45, change: 2.34, volume: "1.8B", icon: "₿" },
        { symbol: "ETH/USDT", price: 2650.12, change: -1.45, volume: "920M", icon: "Ξ" },
        { symbol: "SOL/USDT", price: 152.78, change: 4.12, volume: "450M", icon: "☀️" },
        { symbol: "BNB/USDT", price: 582.90, change: 0.88, volume: "210M", icon: "🟡" },
        { symbol: "PEPE/USDT", price: 0.00001234, change: 12.67, volume: "140M", icon: "🐸" },
        { symbol: "NOT/USDT", price: 0.0089, change: -3.22, volume: "85M", icon: "🔥" }
    ];
    
    let balance = 1284.76;
    let holdings = [
        { coin: "BTC", amount: 0.018, value: 1231.57 },
        { coin: "ETH", amount: 0.45, value: 1192.55 },
        { coin: "SOL", amount: 12, value: 1833.36 }
    ];
    
    // Render markets table
    function renderMarkets() {
        let html = '';
        markets.forEach((m, i) => {
            const changeClass = m.change >= 0 ? 'text-success' : 'text-danger';
            const changeIcon = m.change >= 0 ? '↑' : '↓';
            html += `
            <tr onclick="openCoinModal(${i})" class="cursor-pointer">
                <td><span class="me-2">${m.icon}</span><strong>${m.symbol}</strong></td>
                <td class="text-end fw-bold" id="price-${i}">${m.price.toLocaleString()}</td>
                <td class="text-end ${changeClass}">${changeIcon} ${m.change.toFixed(2)}%</td>
                <td class="text-end text-muted">${m.volume}</td>
                <td class="text-end"><button onclick="event.stopImmediatePropagation();quickTrade(${i});" class="btn btn-sm btn-warning text-dark">Trade</button></td>
            </tr>`;
        });
        $('#marketsBody').html(html);
    }
    
    // Live price updater
    function updatePrices() {
        markets.forEach((m, i) => {
            const random = (Math.random() * 2 - 1) * 0.8;
            m.price = parseFloat((m.price + random).toFixed(m.price < 1 ? 8 : 2));
            m.change = parseFloat((m.change + (Math.random() * 1.2 - 0.6)).toFixed(2));
            
            const rowPrice = $(`#price-${i}`);
            if (rowPrice.length) {
                rowPrice.text(m.price.toLocaleString()).addClass('price-flash');
                setTimeout(() => rowPrice.removeClass('price-flash'), 800);
            }
        });
        renderMarkets();
        updateMiniChart();
    }
    
    // Render watchlist & trending (same data for demo)
    function renderSidebars() {
        let wl = '';
        markets.slice(0, 3).forEach(m => {
            wl += `<div class="d-flex justify-content-between mb-2"><span>${m.icon} ${m.symbol}</span><span class="text-warning">${m.price}</span></div>`;
        });
        $('#watchlistContainer').html(wl);
        
        let tr = '';
        markets.slice(3).forEach(m => {
            tr += `<div class="d-flex justify-content-between mb-2"><span>${m.icon} ${m.symbol}</span><span class="${m.change>=0?'text-success':'text-danger'}">${m.change}%</span></div>`;
        });
        $('#trendingContainer').html(tr);
        
        // Holdings
        let hl = '';
        holdings.forEach(h => {
            hl += `<div class="d-flex justify-content-between mb-2"><span>${h.coin}</span><span class="text-warning">${h.amount} ≈ $${h.value}</span></div>`;
        });
        $('#holdingsList').html(hl);
    }
    
    // Simple canvas mini chart
    function updateMiniChart() {
        const canvas = document.getElementById('miniChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = '#f0b90b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(10, 120);
        const points = [120, 95, 110, 75, 85, 65, 90, 55, 45, 30];
        for (let i = 0; i < points.length; i++) {
            ctx.lineTo(10 + i * 30, points[i]);
        }
        ctx.stroke();
        
        // Gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, 160);
        gradient.addColorStop(0, 'rgba(240, 185, 11, 0.4)');
        gradient.addColorStop(1, 'rgba(240, 185, 11, 0)');
        ctx.fillStyle = gradient;
        ctx.lineTo(310, 160);
        ctx.lineTo(10, 160);
        ctx.fill();
    }
    
    // Modal chart (line)
    let currentModalIndex = 0;
    function drawModalChart() {
        const canvas = document.getElementById('modalChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = '#f0b90b';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#f0b90b';
        
        ctx.beginPath();
        ctx.moveTo(20, 200);
        const data = [200, 170, 190, 140, 165, 110, 130, 95, 80, 65, 90, 55];
        for (let i = 0; i < data.length; i++) {
            ctx.lineTo(20 + i * (canvas.width - 40) / (data.length - 1), data[i]);
        }
        ctx.stroke();
    }
    
    // Open coin modal
    window.openCoinModal = function (index) {
        currentModalIndex = index;
        const coin = markets[index];
        $('#modalCoinTitle').html(`${coin.icon} ${coin.symbol}`);
        $('#modalPrice').text(coin.price.toLocaleString());
        const changeEl = $('#modalChange');
        changeEl.text(coin.change >= 0 ? `+${coin.change}%` : `${coin.change}%`);
        changeEl.removeClass('text-success text-danger').addClass(coin.change >= 0 ? 'text-success' : 'text-danger');
        $('#modalHighLow').html(`$${ (coin.price * 1.05).toFixed(2) } / $${ (coin.price * 0.95).toFixed(2) }`);
        
        const modal = new bootstrap.Modal(document.getElementById('coinModal'));
        modal.show();
        
        setTimeout(drawModalChart, 300);
    };
    
    // Quick trade from table
    window.quickTrade = function (index) {
        event.stopImmediatePropagation();
        openCoinModal(index);
    };
    
    // Execute trade from modal
    window.executeModalTrade = function () {
        const amount = parseFloat($('#modalOrderAmount').val()) || 100;
        const coin = markets[currentModalIndex];
        
        balance += (amount * 0.98); // small fee demo
        $('#mainBalance').text('$' + balance.toFixed(2));
        $('#topBalance').text(balance.toFixed(2));
        
        // Add fake holding
        holdings.unshift({
            coin: coin.symbol.split('/')[0],
            amount: (amount / coin.price).toFixed(4),
            value: amount
        });
        
        renderSidebars();
        
        bootstrap.Modal.getInstance(document.getElementById('coinModal')).hide();
        
        const toastHTML = `<div class="toast bg-warning text-dark position-fixed bottom-0 end-0 m-3"><div class="toast-body">✅ Trade executed successfully!</div></div>`;
        $('body').append(toastHTML);
        new bootstrap.Toast($('.toast').last()[0]).show();
        setTimeout(() => $('.toast').remove(), 3000);
    };
    
    // Simple trade execution
    window.executeTrade = function () {
        const amount = parseFloat($('#buyAmount').val()) || 100;
        balance -= amount;
        $('#mainBalance').text('$' + balance.toFixed(2));
        $('#topBalance').text(balance.toFixed(2));
        
        alert('✅ BTC purchased successfully! Portfolio updated.');
        renderSidebars();
    };
    
    // Fake deposit
    window.fakeDeposit = function () {
        balance += 500;
        $('#mainBalance').text('$' + balance.toFixed(2));
        $('#topBalance').text(balance.toFixed(2));
        bootstrap.Modal.getInstance(document.getElementById('depositModal')).hide();
        alert('✅ $500 deposited (demo)');
        renderSidebars();
    };
    
    window.showDepositModal = function () {
        new bootstrap.Modal(document.getElementById('depositModal')).show();
    };
    
    window.showWithdrawModal = function () {
        alert('💸 Withdraw demo – funds would be sent instantly (simulated)');
    };
    
    // Tab switching
    window.switchTab = function (n) {
        $('#mainTabs a').removeClass('active');
        $('#mainTabs a').eq(n).addClass('active');
        
        if (n === 1) {
            $('#marketsView').addClass('d-none');
            $('#tradeView').removeClass('d-none');
        } else {
            $('#tradeView').addClass('d-none');
            $('#marketsView').removeClass('d-none');
        }
    };
    
    // View switching for mobile
    window.switchView = function (view) {
        if (view === 'markets' || view === 'home') {
            $('#marketsView').removeClass('d-none');
            $('#tradeView').addClass('d-none');
        } else if (view === 'wallet') {
            alert('💼 Wallet view opened (demo)\n\nYour holdings are displayed in the right sidebar on desktop.');
        }
    };
    
    window.showTradeModal = function () {
        switchTab(1);
        $('html, body').animate({ scrollTop: 300 }, 300);
    };
    
    window.showNotifications = function () { alert('🛎️ 3 new price alerts:\nBTC crossed $68,000\nETH +2.3%\nSOL new ATH'); };
    window.showP2P = function () { alert('💱 P2P Trading opened – buy USDT with local currency (demo)'); };
    window.showEarn = function () { alert('📈 Earn section:\nStake BNB → 8.4% APY\nAuto-Invest activated'); };
    
    window.setOrderType = function (type) {
        $('#buyBtn').toggleClass('active', type === 'buy');
        $('#sellBtn').toggleClass('active', type === 'sell');
    };
    
    window.fakeSearch = function (e) {
        e.preventDefault();
        const q = $('#searchInput').val().trim().toUpperCase();
        if (q) {
            const found = markets.find(m => m.symbol.includes(q));
            if (found) {
                const idx = markets.indexOf(found);
                openCoinModal(idx);
            } else {
                alert('🔍 No exact match – try BTC, ETH, SOL');
            }
        }
        $('#searchInput').val('');
    };
    
    window.fakeLogout = function (e) {
        e.preventDefault();
        if (confirm('Log out of Binance demo?')) location.reload();
    };
    
    // Initial render
    renderMarkets();
    renderSidebars();
    updateMiniChart();
    
    // Live updates every 8 seconds
    setInterval(updatePrices, 8000);
    
    console.log('%c✅ Binance Web Clone ready! Built with ❤️ by SAMER SAEID – Trade safely in demo mode', 'color:#f0b90b; font-weight:bold; font-size:15px');
});
