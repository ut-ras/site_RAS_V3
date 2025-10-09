/**
 * Form submission handler for RAS Membership Form
 * Sends form data to Google Apps Script Web App endpoint
 * Also handles EID lookup functionality
 */

// Import constants from constants.js
import { MEMBERSHIP_CSV_URL } from './constants.js';
// Import EID related functions from eidStats.js
import { loadMembershipData, fetchMemberInfo } from './eidStats.js';
// Import shopping related functions from shopFunctions.js
import { initShopFunctionality, generateShopTable, updateTotal } from './shopFunctions.js';
// Import membership form related functions
import { initMembershipForm, handleFormVisibility } from './membershipForm.js';
// Import activity logging functions
import { setupActivitySection } from './activityLogger.js';
// Import API service functions
import { postToAppsScript } from './apiService.js';


// Shop items are now imported from constants.js
// EID related functions are now imported from eidStats.js

document.addEventListener('DOMContentLoaded', function() {
    // Load membership data when the page loads
    loadMembershipData().then(success => {
        if (success) {
            console.log('Membership data loaded successfully');
            
            // After membership data is loaded, check if EID is already entered
            processExistingEid();
        } else {
            console.error('Failed to preload membership data');
        }
    });
    
    // Get URL parameters for activity selection
    const urlParams = new URLSearchParams(window.location.search);
    const activityParam = urlParams.get('attendanceactivity');
    const subOptionParam = urlParams.get('attendancesuboption');
    
    // Set up activity section functionality
    setupActivitySection(activityParam, subOptionParam);
    
    // Function to process EID if already present on load
    function processExistingEid() {
        const eidInput = document.getElementById('eid');
        if (eidInput && eidInput.value && eidInput.value.trim() !== '') {
            // Trigger the blur event to process the EID
            const event = new Event('blur');
            eidInput.dispatchEvent(event);
        }
    }
    
    // EID input handling
    const eidInput = document.getElementById('eid');
    if (eidInput) {
        // Function to validate EID format
        function isValidEid(eid) {
            const eidPattern = /^[a-z]{2,3}[0-9]{3,8}$/;
            return eidPattern.test(eid);
        }
        
        eidInput.addEventListener('blur', async function() {
            const eid = eidInput.value.trim().toLowerCase();
            const statusElement = document.getElementById('eidStatus');
            const contentAfterEid = document.getElementById('contentAfterEid');
            
            // Reset and hide content
            contentAfterEid.classList.add('hidden-until-eid');
            document.getElementById('membershipForm').style.display = 'none';
            
            // Check if EID is empty
            if (eid === '') {
                statusElement.textContent = '';
                statusElement.className = 'status-message';
                return;
            }
            
            // Validate EID format
            if (!isValidEid(eid)) {
                statusElement.textContent = 'Invalid EID format. Please enter 2-3 lowercase letters followed by 3-8 numbers.';
                statusElement.className = 'status-message error';
                return;
            }
            
            try {
                // EID format is valid, proceed with checking if it exists
                const memberExists = await fetchMemberInfo(eid);
                
                // Only if EID is valid, show the content
                contentAfterEid.classList.remove('hidden-until-eid');
                
                // Handle form visibility based on member existence
                handleFormVisibility(memberExists, eid);
                
                // Regenerate the shop table to show purchase history for this EID
                const shopTableContainer = document.getElementById('shopTableContainer');
                if (shopTableContainer) {
                    // Clear existing table
                    shopTableContainer.innerHTML = '';
                    // Generate new table with current EID's purchase history
                    generateShopTable();
                    // Recalculate total
                    updateTotal();
                }
            } catch (error) {
                console.error("Error in EID validation:", error);
                statusElement.textContent = 'Error checking membership. Please try again.';
                statusElement.className = 'status-message error';
            }
        });
        
        // Handle input events for real-time validation
        eidInput.addEventListener('input', function() {
            const eid = eidInput.value.trim().toLowerCase();
            const statusElement = document.getElementById('eidStatus');
            const contentAfterEid = document.getElementById('contentAfterEid');
            
            // Always hide content while typing
            contentAfterEid.classList.add('hidden-until-eid');
            
            // Clear status if empty
            if (eid === '') {
                statusElement.textContent = '';
                statusElement.className = 'status-message';
                return;
            }
            
            // Show validation message while typing
            if (!isValidEid(eid)) {
                statusElement.textContent = 'EID should be 2-3 lowercase letters followed by 3-8 numbers';
                statusElement.className = 'status-message warning';
            } else {
                statusElement.textContent = 'Valid EID format. Click/tab out to check membership.';
                statusElement.className = 'status-message success';
            }
        });
    }
    
    // Initialize membership form
    initMembershipForm();
    
    // Shop functionality
    initShopFunctionality();
});
