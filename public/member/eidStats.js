/**
 * eidStats.js
 * Functions for handling EID lookups and membership data
 */

import { MEMBERSHIP_CSV_URL, GOOGLE_APPS_SCRIPT_URL } from './constants.js';

// Store membership data globally
let membershipRows = null;
// Store purchases by EID
let purchasesByEid = new Map();
// Store the current EID
let currentEid = null;

// Initialize module - auto-load saved EID on script load
initializeModule();

/**
 * Function to load membership data from Apps Script
 * @param {string} eid - EID to fetch data for
 * @returns {Promise<boolean>} - Promise resolving to true if data was loaded successfully
 */
export async function loadMembershipData(eid) {
    try {
        const result = await fetchDataFromAppsScript(GOOGLE_APPS_SCRIPT_URL, eid);
        
        if (result.success && result.format === 'csv') {
            membershipRows = result.data;
            
            // Parse purchase information if it exists in the data
            if (membershipRows.length > 0) {
                parsePurchaseData(membershipRows);
            }
            return true;
        }
        return false;
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
    
    // Get status element
    const statusElement = document.getElementById('eidStatus');
    if (statusElement) {
        statusElement.textContent = 'Checking membership...';
        statusElement.className = 'status-message loading';
    }
    
    try {
        // Load membership data directly using shared fetchDataFromAppsScript function
        const dataLoaded = await loadMembershipData(eid);
        if (!dataLoaded) {
            throw new Error('Failed to load membership data');
        }
        
        // Check if any data was returned
        const memberExists = membershipRows && membershipRows.length > 1; // More than just headers
        
        // Update the status message if element exists
        if (statusElement) {
            if (memberExists) {
                statusElement.textContent = 'Welcome back! Your membership is active.';
                statusElement.className = 'status-message success';
            } else {
                statusElement.textContent = 'No membership found. Please fill out the form below.';
                statusElement.className = 'status-message warning';
            }
        }
        
        return memberExists;
    } catch (error) {
        console.error('Error fetching member info:', error);
        if (statusElement) {
            statusElement.textContent = 'Error checking membership. Please try again.';
            statusElement.className = 'status-message error';
        }
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

/**
 * Get the current EID that was loaded
 * @returns {string|null} - Current EID or null if none
 */
export function getCurrentEid() {
    return currentEid;
}

/**
 * Save EID to localStorage for future use
 * @param {string} eid - EID to save
 * @param {boolean} memberExists - Whether the member exists
 */
export function saveEidToStorage(eid, memberExists) {
    if (!eid) return;
    
    try {
        localStorage.setItem('savedEid', eid.trim().toLowerCase());
        localStorage.setItem('savedEidMemberExists', memberExists ? '1' : '0');
        // Update current EID
        currentEid = eid.trim().toLowerCase();
    } catch (e) {
        console.warn('Unable to save EID to localStorage', e);
    }
}

/**
 * Clear saved EID from localStorage
 */
export function clearSavedEid() {
    try {
        localStorage.removeItem('savedEid');
        localStorage.removeItem('savedEidMemberExists');
        currentEid = null;
    } catch (e) {
        console.warn('Unable to clear localStorage for EID', e);
    }
}

/**
 * Initialize the module and auto-load saved EID if available
 */
function initializeModule() {
    // Run this once when the script is loaded
    try {
        const savedEid = localStorage.getItem('savedEid');
        if (savedEid && savedEid.trim() !== '') {
            currentEid = savedEid.trim().toLowerCase();
            console.log(`Found saved EID: ${currentEid}, will auto-load data`);
            
            // Use setTimeout to ensure this runs after the DOM is ready
            setTimeout(() => {
                loadMembershipData(currentEid).then(success => {
                    if (success) {
                        console.log(`Auto-loaded membership data for ${currentEid}`);
                        // Dispatch a custom event that other scripts can listen for
                        document.dispatchEvent(new CustomEvent('eidDataLoaded', { 
                            detail: { 
                                eid: currentEid,
                                success: true 
                            }
                        }));
                    }
                });
            }, 0);
        }
    } catch (e) {
        console.warn('Unable to auto-load EID from localStorage', e);
    }
}

/**
 * Fetch data from arbitrary Apps Script URL with EID parameter
 * @param {string} url - The Apps Script URL to fetch from
 * @param {string} eid - The EID to fetch data for
 * @param {string} [statusElementId='dataStatus'] - ID of status element to update
 * @returns {Promise<Object>} - Promise resolving to the response data
 */
export async function fetchDataFromAppsScript(url, eid, statusElementId = 'dataStatus') {
    if (!url || !eid) {
        throw new Error('URL and EID are required');
    }
    
    // Get status element if ID provided
    const statusElement = statusElementId ? document.getElementById(statusElementId) : null;
    
    // Update status if element exists
    if (statusElement) {
        statusElement.textContent = 'Loading data...';
        statusElement.className = 'status-message loading';
    }
    
    try {
        // Construct URL with EID parameter
        const fullUrl = new URL(url);
        fullUrl.searchParams.set('eid', eid.trim().toLowerCase());
        
        console.log(`Fetching data from: ${fullUrl.toString()}`);
        
        // Make the fetch request
        const response = await fetch(fullUrl.toString());
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        
        // Check if response is CSV (based on Content-Type header)
        const contentType = response.headers.get('Content-Type') || '';
        
        if (contentType.includes('text/csv')) {
            // Handle CSV response
            const csvText = await response.text();
            const parsedData = parseCSV(csvText);
            
            // Update status if element exists
            if (statusElement) {
                statusElement.textContent = 'Data loaded successfully!';
                statusElement.className = 'status-message success';
            }
            
            return {
                success: true,
                format: 'csv',
                data: parsedData
            };
        } else {
            // Handle JSON response
            const jsonData = await response.json();
            
            // Update status based on response
            if (statusElement) {
                if (jsonData.status === 'success') {
                    statusElement.textContent = jsonData.message || 'Data loaded successfully!';
                    statusElement.className = 'status-message success';
                } else {
                    statusElement.textContent = jsonData.message || 'No data found.';
                    statusElement.className = 'status-message warning';
                }
            }
            
            return {
                success: jsonData.status === 'success',
                format: 'json',
                data: jsonData
            };
        }
    } catch (error) {
        console.error('Error fetching data from Apps Script:', error);
        
        // Update status element if it exists
        if (statusElement) {
            statusElement.textContent = 'Error loading data. Please try again.';
            statusElement.className = 'status-message error';
        }
        
        return {
            success: false,
            format: 'error',
            error: error.message
        };
    }
}