// fareCalculator.js - Fare calculation logic

/**
 * Fare Calculator Class
 * Calculates taxi fare based on distance, time, vehicle type, and surge pricing
 */
class FareCalculator {
    constructor() {
        // Base fare for starting a trip
        this.baseFare = 100;

        // Per kilometer rates for different vehicle types
        this.vehicleRates = {
            economy: 50,
            comfort: 80,
            premium: 120,
            xl: 100
        };

        // Per minute rate for time-based charges
        this.perMinuteRate = 10;

        // Surge multipliers for different times
        this.surgeMultipliers = {
            normal: 1.0,
            peak: 1.5,
            night: 1.25
        };

        // Minimum fare
        this.minimumFare = 200;

        // Service fee
        this.serviceFee = 50;
    }

    /**
     * Calculate total fare
     * @param {number} distance - Distance in km
     * @param {number} time - Time in minutes
     * @param {string} vehicleType - Type of vehicle
     * @param {string} timeOfDay - Time of day (normal, peak, night)
     * @returns {Object} Detailed fare breakdown
     */
    calculateFare(distance, time, vehicleType = 'economy', timeOfDay = 'normal') {
        // Get rates
        const ratePerKm = this.vehicleRates[vehicleType] || this.vehicleRates.economy;
        const surgeMultiplier = this.surgeMultipliers[timeOfDay] || 1.0;

        // Calculate components
        const distanceCharge = distance * ratePerKm;
        const timeCharge = time * this.perMinuteRate;
        
        // Subtotal before surge
        let subtotal = this.baseFare + distanceCharge + timeCharge;

        // Apply surge pricing
        const surgeAmount = subtotal * (surgeMultiplier - 1);
        subtotal += surgeAmount;

        // Add service fee
        subtotal += this.serviceFee;

        // Apply minimum fare
        const totalFare = Math.max(subtotal, this.minimumFare);

        // Return detailed breakdown
        return {
            baseFare: this.baseFare,
            distanceCharge: parseFloat(distanceCharge.toFixed(2)),
            timeCharge: parseFloat(timeCharge.toFixed(2)),
            serviceFee: this.serviceFee,
            surgeMultiplier: surgeMultiplier,
            surgeAmount: parseFloat(surgeAmount.toFixed(2)),
            subtotal: parseFloat(subtotal.toFixed(2)),
            totalFare: parseFloat(totalFare.toFixed(2)),
            distance: parseFloat(distance.toFixed(2)),
            time: time,
            vehicleType: vehicleType,
            timeOfDay: timeOfDay
        };
    }

    /**
     * Calculate fare for multiple route options
     * @param {Array} routes - Array of route objects
     * @param {string} vehicleType - Type of vehicle
     * @param {string} timeOfDay - Time of day
     * @returns {Array} Array of fare breakdowns
     */
    calculateMultipleFares(routes, vehicleType, timeOfDay) {
        return routes.map(route => {
            const time = calculateEstimatedTime(route.distance);
            return {
                ...route,
                fare: this.calculateFare(route.distance, time, vehicleType, timeOfDay)
            };
        });
    }

    /**
     * Get vehicle type display name
     * @param {string} vehicleType - Vehicle type code
     * @returns {string} Display name
     */
    getVehicleDisplayName(vehicleType) {
        const names = {
            economy: 'Economy',
            comfort: 'Comfort',
            premium: 'Premium',
            xl: 'XL (6 Seats)'
        };
        return names[vehicleType] || 'Economy';
    }

    /**
     * Get time of day display name
     * @param {string} timeOfDay - Time code
     * @returns {string} Display name
     */
    getTimeOfDayDisplayName(timeOfDay) {
        const names = {
            normal: 'Normal Hours',
            peak: 'Peak Hours',
            night: 'Night Hours'
        };
        return names[timeOfDay] || 'Normal Hours';
    }

    /**
     * Estimate fare range (useful for uncertainty)
     * @param {number} distance - Distance in km
     * @param {string} vehicleType - Type of vehicle
     * @returns {Object} Min and max fare estimates
     */
    estimateFareRange(distance, vehicleType = 'economy') {
        const minTime = calculateEstimatedTime(distance) - 5; // 5 min faster
        const maxTime = calculateEstimatedTime(distance) + 10; // 10 min slower

        const minFare = this.calculateFare(distance, Math.max(0, minTime), vehicleType, 'normal');
        const maxFare = this.calculateFare(distance, maxTime, vehicleType, 'peak');

        return {
            min: minFare.totalFare,
            max: maxFare.totalFare,
            estimated: ((minFare.totalFare + maxFare.totalFare) / 2).toFixed(2)
        };
    }

    /**
     * Format currency
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount) {
        return `Rs ${amount.toFixed(2)}`;
    }

    /**
     * Get fare summary text
     * @param {Object} fareBreakdown - Fare breakdown object
     * @returns {string} Summary text
     */
    getFareSummary(fareBreakdown) {
        return `${this.formatCurrency(fareBreakdown.totalFare)} for ${fareBreakdown.distance} km (${fareBreakdown.time} min)`;
    }
}

/**
 * Discount and Promo Code Handler
 */
class PromoCodeHandler {
    constructor() {
        this.promoCodes = new Map([
            ['FIRST10', { type: 'percentage', value: 10, description: '10% off first ride' }],
            ['SAVE100', { type: 'fixed', value: 100, description: 'Rs 100 off' }],
            ['WELCOME20', { type: 'percentage', value: 20, description: '20% off welcome bonus' }]
        ]);
    }

    /**
     * Apply promo code to fare
     * @param {number} fare - Original fare
     * @param {string} code - Promo code
     * @returns {Object} Updated fare and discount info
     */
    applyPromoCode(fare, code) {
        const promo = this.promoCodes.get(code.toUpperCase());

        if (!promo) {
            return {
                valid: false,
                originalFare: fare,
                discount: 0,
                finalFare: fare,
                message: 'Invalid promo code'
            };
        }

        let discount = 0;

        if (promo.type === 'percentage') {
            discount = fare * (promo.value / 100);
        } else if (promo.type === 'fixed') {
            discount = Math.min(promo.value, fare); // Don't make fare negative
        }

        return {
            valid: true,
            originalFare: fare,
            discount: parseFloat(discount.toFixed(2)),
            finalFare: parseFloat((fare - discount).toFixed(2)),
            message: promo.description
        };
    }

    /**
     * Add new promo code
     * @param {string} code - Promo code
     * @param {string} type - Type (percentage or fixed)
     * @param {number} value - Discount value
     * @param {string} description - Description
     */
    addPromoCode(code, type, value, description) {
        this.promoCodes.set(code.toUpperCase(), { type, value, description });
    }

    /**
     * Get all available promo codes
     * @returns {Array} Array of promo codes
     */
    getAvailablePromoCodes() {
        return Array.from(this.promoCodes.entries()).map(([code, promo]) => ({
            code,
            ...promo
        }));
    }
}
