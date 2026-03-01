// app.js - Main application logic

// Global variables
let cityGraph;
let fareCalculator;
let mapRenderer;
let promoHandler;

/**
 * Initialize the application
 */
function initApp() {
    // Create city graph
    cityGraph = createCityGraph();
    
    // Initialize fare calculator
    fareCalculator = new FareCalculator();
    
    // Initialize promo code handler
    promoHandler = new PromoCodeHandler();
    
    // Initialize map renderer
    mapRenderer = new MapRenderer('mapCanvas', cityGraph);
    
    // Populate location dropdowns
    populateLocationDropdowns();
    
    // Draw initial map
    mapRenderer.drawGraph();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('Taxi Fare Estimator initialized successfully!');
    console.log('Graph has', cityGraph.size(), 'locations');
    
    // Print graph structure for debugging
    cityGraph.printGraph();
}

/**
 * Populate pickup and dropoff location dropdowns
 */
function populateLocationDropdowns() {
    const pickupSelect = document.getElementById('pickup');
    const dropoffSelect = document.getElementById('dropoff');
    
    // Get all locations
    const locations = cityGraph.getAllVertices().sort();
    
    // Clear existing options (except first one)
    pickupSelect.innerHTML = '<option value="">Select pickup point</option>';
    dropoffSelect.innerHTML = '<option value="">Select drop-off point</option>';
    
    // Add location options
    locations.forEach(location => {
        const pickupOption = document.createElement('option');
        pickupOption.value = location;
        pickupOption.textContent = location;
        pickupSelect.appendChild(pickupOption);
        
        const dropoffOption = document.createElement('option');
        dropoffOption.value = location;
        dropoffOption.textContent = location;
        dropoffSelect.appendChild(dropoffOption);
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const pickupSelect = document.getElementById('pickup');
    const dropoffSelect = document.getElementById('dropoff');
    
    calculateBtn.addEventListener('click', calculateFare);
    resetBtn.addEventListener('click', resetApp);
    
    // Update map when locations are selected
    pickupSelect.addEventListener('change', updateMapPreview);
    dropoffSelect.addEventListener('change', updateMapPreview);
}

/**
 * Update map preview when locations are selected
 */
function updateMapPreview() {
    const pickup = document.getElementById('pickup').value;
    const dropoff = document.getElementById('dropoff').value;
    
    if (pickup || dropoff) {
        mapRenderer.render([], pickup, dropoff);
    } else {
        mapRenderer.drawGraph();
    }
}

/**
 * Calculate fare based on user input
 */
function calculateFare() {
    const pickup = document.getElementById('pickup').value;
    const dropoff = document.getElementById('dropoff').value;
    const vehicleType = document.getElementById('vehicleType').value;
    const timeOfDay = document.getElementById('timeOfDay').value;
    
    // Validate inputs
    if (!pickup || !dropoff) {
        alert('Please select both pickup and drop-off locations!');
        return;
    }
    
    if (pickup === dropoff) {
        alert('Pickup and drop-off locations must be different!');
        return;
    }
    
    // Run Dijkstra's algorithm
    const result = dijkstra(cityGraph, pickup, dropoff);
    
    if (!result.found) {
        alert('No route found between selected locations!');
        return;
    }
    
    // Calculate estimated time
    const estimatedTime = calculateEstimatedTime(result.distance);
    
    // Calculate fare
    const fareBreakdown = fareCalculator.calculateFare(
        result.distance,
        estimatedTime,
        vehicleType,
        timeOfDay
    );
    
    // Display results
    displayFareResults(fareBreakdown, result);
    
    // Render map with path
    mapRenderer.render(result.path, pickup, dropoff, result.visited);
    
    // Scroll to results
    document.getElementById('fareResult').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
    });
}

/**
 * Display fare calculation results
 */
function displayFareResults(fareBreakdown, routeResult) {
    const fareResultDiv = document.getElementById('fareResult');
    
    // Show the result section
    fareResultDiv.style.display = 'block';
    
    // Update fare details
    document.getElementById('distance').textContent = 
        `${fareBreakdown.distance} km`;
    
    document.getElementById('time').textContent = 
        `${fareBreakdown.time} minutes`;
    
    document.getElementById('baseFare').textContent = 
        fareCalculator.formatCurrency(fareBreakdown.baseFare);
    
    document.getElementById('distanceCharge').textContent = 
        fareCalculator.formatCurrency(fareBreakdown.distanceCharge);
    
    document.getElementById('timeCharge').textContent = 
        fareCalculator.formatCurrency(fareBreakdown.timeCharge);
    
    document.getElementById('surgeMultiplier').textContent = 
        `${fareBreakdown.surgeMultiplier}x`;
    
    document.getElementById('totalFare').textContent = 
        fareCalculator.formatCurrency(fareBreakdown.totalFare);
    
    // Display route path
    const routePath = routeResult.path.join(' → ');
    document.getElementById('routePath').textContent = routePath;
    
    // Add animation
    fareResultDiv.classList.add('fade-in');
}

/**
 * Reset the application
 */
function resetApp() {
    // Reset form
    document.getElementById('pickup').value = '';
    document.getElementById('dropoff').value = '';
    document.getElementById('vehicleType').value = 'economy';
    document.getElementById('timeOfDay').value = 'normal';
    
    // Hide results
    document.getElementById('fareResult').style.display = 'none';
    
    // Reset map
    mapRenderer.drawGraph();
    
    console.log('Application reset');
}

/**
 * Format time in human-readable format
 */
function formatTime(minutes) {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
}

/**
 * Get random location pair for demo
 */
function getRandomLocationPair() {
    const locations = cityGraph.getAllVertices();
    const pickup = locations[Math.floor(Math.random() * locations.length)];
    let dropoff;
    
    do {
        dropoff = locations[Math.floor(Math.random() * locations.length)];
    } while (dropoff === pickup);
    
    return { pickup, dropoff };
}

/**
 * Demo function - Calculate fare for random locations
 */
function runDemo() {
    const { pickup, dropoff } = getRandomLocationPair();
    
    document.getElementById('pickup').value = pickup;
    document.getElementById('dropoff').value = dropoff;
    
    // Random vehicle and time
    const vehicles = ['economy', 'comfort', 'premium', 'xl'];
    const times = ['normal', 'peak', 'night'];
    
    document.getElementById('vehicleType').value = 
        vehicles[Math.floor(Math.random() * vehicles.length)];
    document.getElementById('timeOfDay').value = 
        times[Math.floor(Math.random() * times.length)];
    
    // Calculate
    setTimeout(() => {
        calculateFare();
    }, 500);
}

/**
 * Export functionality - Save calculation as text
 */
function exportCalculation() {
    const fareResultDiv = document.getElementById('fareResult');
    
    if (fareResultDiv.style.display === 'none') {
        alert('Please calculate a fare first!');
        return;
    }
    
    const pickup = document.getElementById('pickup').value;
    const dropoff = document.getElementById('dropoff').value;
    const distance = document.getElementById('distance').textContent;
    const time = document.getElementById('time').textContent;
    const totalFare = document.getElementById('totalFare').textContent;
    const routePath = document.getElementById('routePath').textContent;
    
    const text = `
TAXI FARE ESTIMATE
==================

From: ${pickup}
To: ${dropoff}

Route: ${routePath}

Distance: ${distance}
Estimated Time: ${time}

Total Fare: ${totalFare}

Generated: ${new Date().toLocaleString()}
    `.trim();
    
    // Create download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fare-estimate-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// Make demo function available globally
window.runDemo = runDemo;
window.exportCalculation = exportCalculation;

// Log loaded
console.log('App.js loaded successfully');
