// REPLACE WITH YOUR ACTUAL GOOGLE APPS SCRIPT URL
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzNwX8OOT43kM54xLp6hnMrhtabiu3aZ335GBOrzJp9LBhCuQ1YHp6vnc9edQgkG3kd0w/exec'; 

let lastEndingMoney = 202; 
let completedDates = []; // Cloud memory for your calendar

window.onload = function() {
    // 1. Fetch the math starting point
    fetch(WEB_APP_URL + "?action=getLastWeek")
    .then(res => res.json())
    .then(data => { if(data && data.endingMoney) lastEndingMoney = data.endingMoney; })
    .catch(err => console.error('Error fetching money:', err));

    // 2. Fetch your saved green days from the cloud
    fetch(WEB_APP_URL + "?action=getCalendar")
    .then(res => res.json())
    .then(dates => { 
        completedDates = dates; 
        console.log("Loaded green dates from cloud:", completedDates);
    })
    .catch(err => console.error('Error fetching calendar:', err));
};

function runCalculator() {
    let earnings = document.getElementById('earnings').value;
    let savingsTarget = earnings / 2;
    let startInput = document.getElementById('startDate').value;
    let endInput = document.getElementById('endDate').value;
    
    if (!startInput || !endInput) return alert("Please select both dates!");

    let start = new Date(startInput);
    let end = new Date(endInput);
    let days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    let dailySavings = [];
    let current = (lastEndingMoney === 2) ? 200 : lastEndingMoney - 2; 
    let calendarHTML = ""; 

    for (let i = 0; i < days; i++) {
        dailySavings.push(current);
        
        let currentDay = new Date(start);
        currentDay.setDate(start.getDate() + i);
        
        let dateKey = currentDay.getFullYear() + '-' + (currentDay.getMonth() + 1) + '-' + currentDay.getDate();
        let dateDisplay = currentDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Check our cloud array instead of localStorage
        let statusClass = completedDates.includes(dateKey) ? 'status-green' : 'status-yellow';

        calendarHTML += `
            <div class="day-card ${statusClass}" onclick="toggleStatus(this, '${dateKey}')">
                <div class="day-date">${dateDisplay}</div>
                <div class="day-amt">₱${current}</div>
            </div>
        `;
        current = (current === 2) ? 200 : current - 2;
    }

    document.getElementById('calendar').innerHTML = calendarHTML;

    let total = dailySavings.reduce((a, b) => a + b, 0);
    let weeklySaves = savingsTarget - total;
    let startingMoneyForThisWeek = dailySavings[0];
    let endingMoneyForThisWeek = dailySavings[dailySavings.length - 1]; 

    fetch(WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({
            weekNumber: 21, 
            weeklyEarnings: earnings,
            savingsTarget: savingsTarget,
            startingMoney: startingMoneyForThisWeek, 
            endingMoney: endingMoneyForThisWeek, 
            totalSaved: total,
            weeklySaves: weeklySaves,
            status: 'Yellow'
        })
    })
    .then(() => {
        alert("Calculated! Tap your calendar days to turn them green.");
        lastEndingMoney = endingMoneyForThisWeek; 
    });
}

function toggleStatus(element, dateKey) {
    // 1. Optimistic UI update (feels instantly snappy on your phone)
    if (element.classList.contains('status-yellow')) {
        element.classList.remove('status-yellow');
        element.classList.add('status-green');
        completedDates.push(dateKey);
    } else {
        element.classList.remove('status-green');
        element.classList.add('status-yellow');
        completedDates = completedDates.filter(d => d !== dateKey);
    }

    // 2. Silently push the change to the Google cloud database
    fetch(WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'toggleDate',
            date: dateKey
        })
    }).catch(err => console.error('Cloud sync failed:', err));
}
