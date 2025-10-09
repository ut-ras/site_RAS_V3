/**
 * eidStats.js
 * Functions for handling EID lookups and membership data
 */

import { MEMBERSHIP_CSV_URL } from './constants.js';

// Store membership data globally
let membershipRows = null;
// Store purchases by EID
let purchasesByEid = new Map();

/**
 * Function to load membership data once
 * @returns {Promise<boolean>} - Promise resolving to true if data was loaded successfully
 */
export async function loadMembershipData() {
    try {
        const response = await fetch(MEMBERSHIP_CSV_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch membership data');
        }
        
        const csvText = await response.text();
        membershipRows = parseCSV(csvText);
        
        // Parse purchase information from column 3 (index 2)
        parsePurchaseData(membershipRows);
        
        return true;
    } catch (error) {
        console.error('Error loading membership data:', error);
        return false;
    }
}

/**
 * Function to parse purchase data from membership rows
 * @param {Array} rows - Array of membership data rows
 */
export function parsePurchaseData(rows) {
    purchasesByEid = new Map();
    
    // Skip header row (row 0)
    for (let i = 1; i < rows.length; i++) {
        // Check if we have enough columns and column 3 has purchase data
        if (rows[i].length >= 3 && rows[i][2]) {
            const purchaseData = rows[i][2];
            if (purchaseData.indexOf("km54774") > -1) {
                console.log(purchaseData);
            }
            
            // Parse purchase data format like "rasform25;id:nbb648;shirts:1;shirtl:1"
            const parts = purchaseData.split(';');
            let eid = null;
            let purchases = {};
            
            parts.forEach(part => {
                if (part.startsWith('id:')) {
                    eid = part.substring(3).toLowerCase();
                } else if (part.includes(':')) {
                    const [itemId, quantity] = part.split(':');
                    if (itemId && quantity) {
                        const key = itemId.toLowerCase();
                        purchases[key] = (purchases[key] || 0) + (parseInt(quantity) || 0);
                    }} 
               
            });
            
            // If we found an EID and purchases, merge with existing or add to map
            if (eid && Object.keys(purchases).length > 0) {
                if (purchasesByEid.has(eid)) {
                    const existingPurchases = purchasesByEid.get(eid);
                    // Merge purchases, adding quantities
                    Object.entries(purchases).forEach(([id, qty]) => 
                        existingPurchases[id] = (existingPurchases[id] || 0) + qty);
                } else {
                    purchasesByEid.set(eid, purchases);
                }
            }
        }
    }
    
    console.log(purchasesByEid);
    console.log('Parsed purchase data for', purchasesByEid.size, 'members');
}

/**
 * Function to check member information by EID
 * @param {string} eid - EID to check
 * @returns {Promise<boolean>} - Promise resolving to true if member exists
 */
export async function fetchMemberInfo(eid) {
    if (!eid || eid.trim() === '') {
        return false;
    }
    
    // Display loading status
    const statusElement = document.getElementById('eidStatus');
    statusElement.textContent = 'Checking membership...';
    statusElement.className = 'status-message loading';
    
    // Normalize the EID for comparison (to lowercase)
    const normalizedEid = eid.trim().toLowerCase();
    
    try {
        // Make sure membership data is loaded
        if (!membershipRows) {
            statusElement.textContent = 'Loading membership data...';
            const dataLoaded = await loadMembershipData();
            if (!dataLoaded) {
                throw new Error('Failed to load membership data');
            }
        }
        
        // Use the already loaded membership data
        const rows = membershipRows;
        
        // Check if the EID exists in the first column
        // We assume the first row contains headers and the first column contains EIDs
        let memberExists = false;
        
        // Skip the header row (index 0) and check remaining rows
        for (let i = 1; i < rows.length; i++) {
            if (rows[i].length > 0 && rows[i][0].toLowerCase() === normalizedEid) {
                memberExists = true;
                break;
            }
        }
        
        // Update the status message
        if (memberExists) {
            statusElement.textContent = 'Welcome back! Your membership is active.';
            statusElement.className = 'status-message success';
        } else {
            statusElement.textContent = 'No membership found. Please fill out the form below.';
            statusElement.className = 'status-message warning';
        }
        
        return memberExists;
    } catch (error) {
        console.error('Error fetching member info:', error);
        statusElement.textContent = 'Error checking membership. Please try again.';
        statusElement.className = 'status-message error';
        return false;
    }
}

/**
 * Helper function to parse CSV text
 * @param {string} text - CSV text to parse
 * @returns {Array} - Array of parsed CSV rows
 */
export function parseCSV(text) {
    // Split the text into rows
    const rows = text.split('\n');
    
    // Parse each row
    return rows.map(row => {
        // Handle quoted values with commas inside
        let inQuote = false;
        let currentValue = '';
        const values = [];
        
        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                values.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        
        // Add the last value
        values.push(currentValue.trim());
        
        return values;
    });
}

/**
 * Get purchases by EID
 * @param {string} eid - The EID to lookup purchases for
 * @returns {object|null} - Purchase object or null if not found
 */
export function getPurchasesByEid(eid) {
    if (!eid) return null;
    return purchasesByEid.get(eid.toLowerCase()) || null;
}

/**
 * Check if membership data is loaded
 * @returns {boolean} - True if data is loaded
 */
export function isMembershipDataLoaded() {
    return membershipRows !== null;
}