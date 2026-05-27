// Your Google Apps Script Web App URL
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw30tFky__0xTR87kUNMLnUz8V4Ee7GRNv6EFRwk589dckRro_cHjnm1m1tARIrx3oRiA/exec'; 

// Memory variable. Defaults to 202 so a brand new sheet calculates 202 - 2 = 200.
let lastEndingMoney = 202; 

// Fetch the last row from your spreadsheet when the page loads
window.onload = function() {
    fetch(WEB_APP_URL + "?action=getLastWeek")
    .then(response => response.json())
    .then(data => {
        if(data && data.endingMoney) {
            lastEndingMoney = data.endingMoney;
            console.log("Successfully loaded last week's ending money: " + lastEndingMoney);
        }
    })
    .catch(error => console.error('Error fetching data:', error));
};

function runCalculator() {
    let earnings = document.getElementById('earnings').value;
    let savingsTarget = earnings / 2;
    let start = new Date(document.getElementById('startDate').value);
    let end = new Date(document.getElementById('endDate').value);
    
    let days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    let dailySavings = [];
    
    // Start the math based on the spreadsheet memory
    let current = (lastEndingMoney === 2) ? 200 : lastEndingMoney - 2; 

    for (let i = 0; i < days; i++) {
        dailySavings.push(current);
        // Prepare for the next loop iteration (reset to 200 if it hits 2)
        current = (current === 2) ? 200 : current - 2;
    }

    let total = dailySavings.reduce((a, b) => a + b, 0);
    let weeklySaves = savingsTarget - total;
    
    // The starting money for this week is the first item in our array
    let startingMoneyForThisWeek = dailySavings[0];
    // The ending money is the very last item we calculated
    let endingMoneyForThisWeek = dailySavings[dailySavings.length - 1]; 

    fetch(WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({
            weekNumber: 21, // Note: You can make this dynamic later
            weeklyEarnings: earnings,
            savingsTarget: savingsTarget,
            startingMoney: startingMoneyForThisWeek, 
            endingMoney: endingMoneyForThisWeek, 
            totalSaved: total,
            weeklySaves: weeklySaves,
            status: 'Yellow'
        })
    })
    .then(response => response.json())
    .then(data => {
        alert("Saved to CustardCash! The math started at " + startingMoneyForThisWeek);
        // Update the memory for the next calculation so you don't have to refresh
        lastEndingMoney = endingMoneyForThisWeek; 
    })
    .catch(error => console.error('Error:', error));
}
