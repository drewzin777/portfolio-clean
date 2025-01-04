let waterProgressChartInstance = null;

// Event listeners for view buttons
document.getElementById('viewWeekly').addEventListener('click', function () {
    updateMultiDayWaterProgressChart(7); // 7-day view
});
document.getElementById('viewMonthly').addEventListener('click', function () {
    updateMultiDayWaterProgressChart(30); // 1-month view
});

document.getElementById('logWater').addEventListener('click', function () {
    const waterAmount = parseInt(document.getElementById('waterAmount').value);
    const waterDate = document.getElementById('waterDate').value || moment().format('YYYY-MM-DD');

    console.log("Water Amount:", waterAmount);  // Debugging
    console.log("Water Date:", waterDate);      // Debugging

    if (!isNaN(waterAmount) && waterAmount > 0) {
        const entry = {
            amount: waterAmount,
            timestamp: waterDate + " " + moment().format('HH:mm:ss') // Add time to date
        };

        let waterEntries = Lockr.get('waterEntries') || [];
        waterEntries.push(entry);
        Lockr.set('waterEntries', waterEntries);

        // Update the last water intake time for the reminder
        Lockr.set('lastWaterIntake', moment().format('YYYY-MM-DD HH:mm:ss'));
        console.log("Stored Water Entries:", Lockr.get('waterEntries'));

        // Update daily total after logging
        updateDailyTotal();

        // Update chart
        updateMultiDayWaterProgressChart(7);

        // Restart or start the reminder check after logging water
        startReminderCheck();
    } else {
        alert('Please enter a valid water amount.');
    }
});

// Function to update daily total in the UI
function updateDailyTotal() {
    let waterEntries = Lockr.get('waterEntries') || [];
    const today = moment().format('YYYY-MM-DD');

    // Calculate total water intake for today
    const todayTotal = waterEntries
        .filter(entry => entry.timestamp.startsWith(today))
        .reduce((total, entry) => total + entry.amount, 0);

    // Update the UI with today's total
    document.getElementById('dailyTotal').textContent = `Total: ${todayTotal} ml`;

    console.log("Today's Total Water Intake:", todayTotal);
}

// Function to check if it's time for a water reminder
function checkWaterReminder() {
    console.log("Checking for water reminder...");
    const lastWaterIntake = Lockr.get('lastWaterIntake');
    if (lastWaterIntake) {
        const lastIntakeMoment = moment(lastWaterIntake, 'YYYY-MM-DD HH:mm:ss');
        const now = moment();

        // Check if 2 hours (or any desired time) have passed since last water intake
        const duration = moment.duration(now.diff(lastIntakeMoment));

        if (duration.asHours() >= 2) { // Set to 2 hours (this can be changed)
            alert("It's time to drink more water!");
            console.log("Reminder triggered!");
        }
    } else {
        console.log("No water intake logged yet.");
    }
}

//Event listener for set Reminder button
document.getElementById('setReminder').addEventListener('click', function() {
    const reminderInterval = parseInt(document.getElementById('reminderInterval').value);

    if (!isNaN(reminderInterval) && reminderInterval > 0) {
        console.log("Reminder set for every " + reminderInterval + " minutes.");

        //Start /update the reminder for interval check
        startReminderCheck(reminderInterval);

        //Clear the input field after setting the reminder
        document.getElementById('reminderInterval').value = '';
    } else {
        alert('Please enter a valid reminder interval');
    }
});

// Function to start reminder checks 
let reminderInterval = null;
function startReminderCheck(intervalMinutes = 30) {
    if (reminderInterval) {
        clearInterval(reminderInterval);
    }
    
    // Start checking for reminders every interval minutes (adjustable)
    reminderInterval = setInterval(checkWaterReminder, intervalMinutes * 60 * 1000); // 60 min interval
}

// Function to calculate water totals for multiple days and map to weekdays or dates
function calculateMultiDayTotal(days = 7) {
    let waterEntries = Lockr.get('waterEntries') || [];
    let startDate = moment().subtract(days - 1, 'days'); // Calculate start date based on number of days

    const dailyTotals = [];

    for (let i = 0; i < days; i++) {
        const date = startDate.format('YYYY-MM-DD');
        const dailyTotal = waterEntries
            .filter(entry => entry.timestamp.startsWith(date))
            .reduce((total, entry) => total + entry.amount, 0); // Sum up amounts for that day

        const label = days === 7 ? startDate.format('ddd') : startDate.format('MMM D'); // Get the weekday for 7-day, date for 30-day

        dailyTotals.push({
            label,
            total: dailyTotal
        });

        startDate = startDate.add(1, 'days'); // Move to next day
    }

    return dailyTotals;
}

// Function to update charts for multiple days with either 7-day or 1-month view
function updateMultiDayWaterProgressChart(days = 7) {
    const ctx = document.getElementById('waterProgressChart').getContext('2d');
    const dailyTotals = calculateMultiDayTotal(days);

    const labels = dailyTotals.map(entry => entry.label);
    const data = dailyTotals.map(entry => entry.total); // Water intake totals for each day

    // Create a gradient for the "water filling" effect
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(54, 162, 235, 0.8)'); // Darker blue
    gradient.addColorStop(1, 'rgba(54, 162, 235, 0.2)'); // Light blue

    // Clear the previous chart
    if (waterProgressChartInstance) {
        waterProgressChartInstance.destroy();
    }

    // Create the chart for multiple days
    waterProgressChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,   // Use dates as labels
            datasets: [{
                label: 'Water Intake (ml)',
                data: data, // Use daily totals as data
                backgroundColor: gradient, // Apply the gradient for water-filling effect
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: Lockr.get('dailyGoal') || 3700 // Set the max value to the daily goal
                }
            },
            plugins: {
                // Custom animations to make it look like the bar is filling
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                }
            }
        }
    });
}

// Reset Button
document.getElementById('resetWater').addEventListener('click', function () {
    const today = moment().format('YYYY-MM-DD');

   //Retrieve all water entries
   let waterEntries = Lockr.get('waterEntries') || [];

   //Filter out only today's entries
   waterEntries = waterEntries.filter(entry => !entry.timestamp.startsWith(today));

   //Save the updated entries back to storage
   Lockr.set('waterEntries', waterEntries);

    // Reset the UI
    document.getElementById('dailyTotal').textContent = 'Total: 0 ml';

   //Update the chart
    updateDailyTotal();
    updateMultiDayWaterProgressChart(7); // Refresh the 7 day view

    alert('Water intake has been reset for today.');
});

// Initialize daily totals and chart on page load
window.onload = function() {
    const waterEntries = Lockr.get('waterEntries') || [];
    if (waterEntries.length === 0) {
        console.log("No water entries found. Start loggingh your water intake!");
    } else {
        console.log("Loaded water entries:", waterEntries);
    }

    updateMultiDayWaterProgressChart(7);    // Initialize chart with 7-day view by default
    updateDailyTotal();                     // Update the daily total on page load
};
