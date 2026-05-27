// REPLACE THIS URL WITH YOUR GOOGLE APPS SCRIPT WEB APP URL
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxAb2TptQm4hZ3SYycNLlnU24eir0soakfTdCHUnaeF82wLlUt1oZhOXxcLDHGT8BSdtQ/exec'; 

function runCalculator() {
    let earnings = document.getElementById('earnings').value;
    let savingsTarget = earnings / 2;
    let start = new Date(document.getElementById('startDate').value);
    let end = new Date(document.getElementById('endDate').value);
    
    // Calculate days
    let days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    let dailySavings = [];
    let current = 200; 

    for (let i = 0; i < days; i++) {
        dailySavings.push(current);
        // Reset to 200 if it hits 2, otherwise subtract 2
        current = (current === 2) ? 200 : current - 2;
    }

    let total = dailySavings.reduce((a, b) => a + b, 0);
    let weeklySaves = savingsTarget - total;

    // Push to Google Sheets
    fetch(WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({
            weekNumber: 21, // You can make this dynamic via an input later
            weeklyEarnings: earnings,
            savingsTarget: savingsTarget,
            startingMoney: 200, 
            endingMoney: (current === 200 ? 2 : current + 2), 
            totalSaved: total,
            weeklySaves: weeklySaves,
            status: 'Yellow'
        })
    })
    .then(response => response.json())
    .then(data => alert("Saved to CustardCache!"))
    .catch(error => console.error('Error:', error));
}
