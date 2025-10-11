/**
 * eidStats.js
 * Functions for handling EID lookups and membership data
 */

import { GOOGLE_APPS_SCRIPT_URL } from './constants.js';

// Store current API response data
let currentApiResponse = null;
// Store purchases by EID
let purchasesByEid = new Map();
// Store the current EID
let currentEid = null;
// Store available snack items from the API
let availableSnacks = [];

// Initialize module - auto-load saved EID on script load
initializeModule();

/**
 * Function to load membership data from Apps Script
 * @param {string} eid - EID to fetch data for
 * @param {boolean} [useStoredData=false] - Whether to use stored data (only true during page load)
 * @returns {Promise<boolean>} - Promise resolving to true if data was loaded successfully
 */
export async function loadMembershipData(eid, useStoredData = false) {
    try {
        // Only try to use stored data if explicitly requested (on page load)
        if (useStoredData) {
            const savedData = getSavedApiResponse(eid);
            
            // If we have saved data, use it
            if (savedData) {
                console.log(`Using saved API data for ${eid} from localStorage (page load)`);
                
                // Process the saved data as if it came from the API
                processApiResponse(savedData);
                
                return true;
            }
        }
        
        // Always make a fresh API call for explicit user actions (submit button)
        const result = await fetchDataFromAppsScript(GOOGLE_APPS_SCRIPT_URL, eid);
        
        if (result.success && result.format === 'json') {
            // Process the API response
            processApiResponse(result.data);
            
            // API response is already saved by fetchDataFromAppsScript
            
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error loading membership data:', error);
        return false;
    }
}

/**
 * Process API response data
 * @param {Object} jsonData - The API response data
 */
function processApiResponse(jsonData) {
    // Store the entire API response directly
    currentApiResponse = jsonData;
    
    // Parse payment data from the array format
    parseJsonPaymentData(jsonData);
    
    // Update available snacks if present
    if (Array.isArray(jsonData.snack) && jsonData.snack.length > 0) {
        updateAvailableSnacks(jsonData.snack);
    }
}

// CSV-based purchase parsing function removed as the API now returns only JSON

/**
 * Function to parse payment data from JSON format
 * @param {Object} memberData - Member data object from API
 */
export function parseJsonPaymentData(memberData) {
    const eid = memberData.eid.toLowerCase();
    if (!eid) return;
    
    // Reset purchases for this EID
    const purchases = {};
    
    // Process payments array
    if (Array.isArray(memberData.payments)) {
        memberData.payments.forEach(payment => {
            // Parse payment string format like "id:km54774;shirtM:1" or "rasform25;id:km54774;shirtm:1;shirtl:1"
            const parts = payment.split(';');
            
            parts.forEach(part => {
                if (!part.startsWith('id:') && part.includes(':')) {
                    const [itemId, quantity] = part.split(':');
                    if (itemId && quantity) {
                        const key = itemId.toLowerCase();
                        purchases[key] = (purchases[key] || 0) + (parseInt(quantity) || 0);
                    }
                }
            });
        });
    }
    
    // Don't automatically add snacks to purchases - only if they were actually purchased
    // Comment out the problematic code that was adding snacks to purchases
    /* 
    if (Array.isArray(memberData.snack)) {
        memberData.snack.forEach(snackItem => {
            if (snackItem.id && snackItem.irl > 0) {
                const key = snackItem.id.toLowerCase();
                purchases[key] = (purchases[key] || 0) + snackItem.irl;
            }
        });
    }
    */
    
    // Store the purchases in the global map
    if (Object.keys(purchases).length > 0) {
        purchasesByEid.set(eid, purchases);
        console.log('Parsed JSON payment data for', eid, ':', purchases);
    } else {
        // Ensure we have an empty purchases object for this EID
        purchasesByEid.set(eid, {});
        console.log('No purchases found for', eid);
    }
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
        // Load membership data directly from API - always use fresh data when user submits
        // Pass false to ensure we don't use stored data for explicit user submissions
        const dataLoaded = await loadMembershipData(eid, false);
        if (!dataLoaded) {
            throw new Error('Failed to load membership data');
        }
        
        // Use the checkMemberExists helper to determine if the member exists
        const memberExists = checkMemberExists(eid);
        
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

// CSV parsing function removed as the API now returns only JSON

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
 * Check if a member with the given EID exists in the loaded data
 * @param {string} eid - The EID to check
 * @returns {boolean} - True if the member exists
 */
export function checkMemberExists(eid) {
    // Get the stored API response
    const apiResponse = getSavedApiResponse(eid);
    
    if (!apiResponse) {
        return false;
    }
    
    // If there's a timestamp in the response, the member exists
    // The timestamp indicates that they've filled out the membership form
    return !!apiResponse.timestamp;
}

/**
 * Check if membership data is loaded
 * @returns {boolean} - True if data is loaded
 */
export function isMembershipDataLoaded() {
    return currentApiResponse !== null;
}

/**
 * Get the current EID that was loaded
 * @returns {string|null} - Current EID or null if none
 */
export function getCurrentEid() {
    return currentEid;
}

/**
 * Get available snacks from the API response
 * @returns {Array} - Array of snack objects
 */
export function getAvailableSnacks() {
    return availableSnacks;
}

/**
 * Update available snacks from API response
 * @param {Array} snacks - Array of snack objects from the API
 */
export function updateAvailableSnacks(snacks) {
    if (Array.isArray(snacks)) {
        availableSnacks = snacks.map(snack => ({
            id: snack.id,
            name: snack.text,
            price: snack.price,
            online: snack.online === 1,
            irl: snack.irl === 1
        }));
        
        console.log('Updated available snacks:', availableSnacks);
    }
}

/**
 * Save the API response data to localStorage
 * @param {string} eid - EID associated with this data (not used for storage key)
 * @param {Object} apiData - The API response data to save
 */
export function saveApiResponseToStorage(eid, apiData) {
    if (!apiData) return;
    
    try {
        // Store the API response data as a JSON string using a single key
        // Store the raw API data directly without any wrapper
        localStorage.setItem('apiData', JSON.stringify(apiData));
        console.log(`Saved API data to localStorage`);
    } catch (e) {
        console.warn('Unable to save API data to localStorage', e);
    }
}

/**
 * Get saved API response data from localStorage
 * @param {string} eid - EID to match against stored data (optional)
 * @returns {Object|null} - The saved API data or null if not found
 */
export function getSavedApiResponse(eid) {
    try {
        const savedDataString = localStorage.getItem('apiData');
        if (!savedDataString) return null;
        
        // Parse the stored data directly - no format wrapper
        const parsedData = JSON.parse(savedDataString);
        
        // If eid is provided, verify it matches the stored data's EID
        if (eid && parsedData.eid && 
            eid.trim().toLowerCase() !== parsedData.eid.trim().toLowerCase()) {
            console.log('Saved API data EID does not match requested EID');
            return null;
        }
        
        return parsedData;
    } catch (e) {
        console.warn('Unable to retrieve API data from localStorage', e);
        return null;
    }
}



// Removed isApiDataStale function as we're not using it

/**
 * Save EID to localStorage functionality removed
 * EID is now saved as part of the API response data
 */
export function saveEidToStorage(eid, memberExists) {
    if (!eid) return;
    
    // Just update the current EID in memory
    currentEid = eid.trim().toLowerCase();
    console.log(`Updated current EID to: ${currentEid}`);
    
    // No longer saving separate EID in localStorage
}

/**
 * Clear saved API data from localStorage
 */
export function clearSavedEid() {
    try {
        // Clear the API data
        localStorage.removeItem('apiData');
        
        // Reset current EID
        currentEid = null;
        console.log('Cleared API data from localStorage');
    } catch (e) {
        console.warn('Unable to clear localStorage API data', e);
    }
}

/**
 * Initialize the module and auto-load saved EID if available
 */
/**
 * Refresh data in the background
 * @param {string} eid - The EID to refresh data for
 */
async function refreshDataInBackground(eid) {
    if (!eid) return;
    
    console.log(`Starting background refresh for EID: ${eid}`);
    
    try {
        // Make a fresh API call to get updated data
        const result = await fetchDataFromAppsScript(GOOGLE_APPS_SCRIPT_URL, eid, null); // Pass null for statusElementId to avoid UI updates
        
        if (result.success && result.format === 'json') {
            // Process the API response and update storage
            processApiResponse(result.data);
            console.log(`Background refresh completed for EID: ${eid}`);
        } else {
            console.warn(`Background refresh failed for EID: ${eid}`);
        }
    } catch (error) {
        console.warn(`Error during background refresh for EID: ${eid}`, error);
    }
}

function initializeModule() {
    // Run this once when the script is loaded
    try {
        // Check if we have saved API data
        const savedApiData = localStorage.getItem('apiData');
        if (savedApiData) {
            try {
                // Parse the stored data directly - no format wrapper
                const apiData = JSON.parse(savedApiData);
                
                // Check if the API data has an EID
                if (apiData && apiData.eid && apiData.eid.trim() !== '') {
                    currentEid = apiData.eid.trim().toLowerCase();
                    console.log(`Found saved API data with EID: ${currentEid}, will auto-load`);
                    
                    // Use setTimeout to ensure this runs after the DOM is ready
                    setTimeout(() => {
                        // Process the saved API data
                        processApiResponse(apiData);
                        
                        // Check if member exists based on timestamp
                        const memberExists = checkMemberExists(currentEid);
                        
                        console.log(`Auto-loaded API data for ${currentEid}, member exists: ${memberExists}`);
                        
                        // Dispatch a custom event that other scripts can listen for
                        document.dispatchEvent(new CustomEvent('eidDataLoaded', { 
                            detail: { 
                                eid: currentEid,
                                success: true,
                                memberExists: memberExists
                            }
                        }));
                        
                        // After loading data from localStorage, refresh it in the background
                        // Use a short delay to ensure page is rendered first
                        setTimeout(() => {
                            refreshDataInBackground(currentEid);
                        }, 1000);
                    }, 0);
                }
            } catch (parseError) {
                console.warn('Unable to parse saved API data', parseError);
            }
        }
    } catch (e) {
        console.warn('Unable to auto-load API data from localStorage', e);
    }
}

/**
 * Fetch data from arbitrary Apps Script URL with EID parameter
 * @param {string} url - The Apps Script URL to fetch from
 * @param {string} eid - The EID to fetch data for
 * @param {string|null} [statusElementId='dataStatus'] - ID of status element to update, or null to skip UI updates
 * @returns {Promise<Object>} - Promise resolving to the response data
 */
export async function fetchDataFromAppsScript(url, eid, statusElementId = 'dataStatus') {
    if (!url || !eid) {
        throw new Error('URL and EID are required');
    }
    
    // Get status element if ID provided
    const statusElement = statusElementId ? document.getElementById(statusElementId) : null;
    
    // Update status if element exists and statusElementId is not null
    if (statusElement && statusElementId !== null) {
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
        
        try {
            const responseText = await response.text();
            
            try {
                // Parse as JSON
                const jsonData = JSON.parse(responseText);
                
                // If successful, it's JSON format
                console.log('Received JSON data:', jsonData);
                
                // Save API response to localStorage
                saveApiResponseToStorage(eid, jsonData);
                
                // Update status if element exists and statusElementId is not null
                if (statusElement && statusElementId !== null) {
                    statusElement.textContent = 'Data loaded successfully!';
                    statusElement.className = 'status-message success';
                }
                
                return {
                    success: true,
                    format: 'json',
                    data: jsonData
                };
            } catch (jsonError) {
                console.error('Failed to parse JSON response:', jsonError);
                throw new Error('Invalid JSON response from API');
            }
        } catch (error) {
            throw new Error('Failed to parse response');
        }
    } catch (error) {
        console.error('Error fetching data from Apps Script:', error);
        
        // Update status element if it exists and statusElementId is not null
        if (statusElement && statusElementId !== null) {
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