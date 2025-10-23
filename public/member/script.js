/**
 * Form submission handler for RAS Membership Form
 * Sends form data to Google Apps Script Web App endpoint
 * Also handles EID lookup functionality
 */

// Import constants from constants.js
// Import EID related functions from eidStats.js
import { loadMembershipData, fetchMemberInfo, saveEidToStorage, clearSavedEid, getCurrentEid } from './eidStats.js';
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
    // We no longer need to load membership data here as eidStats.js does it automatically
    // Instead, listen for the eidDataLoaded event
    document.addEventListener('eidDataLoaded', function(event) {
        if (event.detail && event.detail.success) {
            console.log('Membership data auto-loaded successfully for:', event.detail.eid);
            
            // Update the EID input field with the current EID
            const eidInput = document.getElementById('eid');
            if (eidInput && event.detail.eid) {
                eidInput.value = event.detail.eid;
            }
            
            // Update status message
            const statusElement = document.getElementById('eidStatus');
            if (statusElement) {
                if (event.detail.memberExists) {
                    statusElement.textContent = 'Welcome back! Your membership is active.';
                    statusElement.className = 'status-message success';
                } else {
                    statusElement.textContent = 'No membership found. Please fill out the form below.';
                    statusElement.className = 'status-message warning';
                }
            }
            
            // Update UI to show content
            const contentAfterEid = document.getElementById('contentAfterEid');
            if (contentAfterEid) {
                contentAfterEid.classList.remove('hidden-until-eid');
                
                // Handle form visibility based on member existence
                handleFormVisibility(event.detail.memberExists, event.detail.eid);
                
                // Generate shop table if needed
                const shopTableContainer = document.getElementById('shopTableContainer');
                if (shopTableContainer) {
                    // Clear existing table
                    shopTableContainer.innerHTML = '';
                    // Generate new table with current EID's purchase history
                    generateShopTable();
                    // Recalculate total
                    updateTotal();
                }
            }
        }
    });
    
    // Function to validate EID format - moved outside to be accessible everywhere
    function isValidEid(eid) {
        const eidPattern = /^[a-z]{2,3}[0-9]{2,8}$/;
        return eidPattern.test(eid);
    }

    // Still process existing EID in case it wasn't auto-loaded
    processExistingEid();
    
    // Get URL parameters for activity selection
    const urlParams = new URLSearchParams(window.location.search);
    const activityParam = urlParams.get('attendanceactivity');
    const subOptionParam = urlParams.get('attendancesuboption');
    
    // Set up activity section functionality
    setupActivitySection(activityParam, subOptionParam);
    
    // Function to process EID if already present on load
    function processExistingEid() {
        const eidInput = document.getElementById('eid');
        if (!eidInput) return;

        // Try to restore saved EID using our centralized getCurrentEid function
        const saved = getCurrentEid();
        if (saved && saved.trim() !== '') {
            eidInput.value = saved;
            // No longer auto-triggering submission - user must click submit button
        }

        // Display validation message if there's a value
        if (eidInput.value && eidInput.value.trim() !== '') {
            const eid = eidInput.value.trim().toLowerCase();
            const statusElement = document.getElementById('eidStatus');
            
            if (isValidEid(eid)) {
                statusElement.textContent = 'Valid EID format. Click Submit to check membership.';
                statusElement.className = 'status-message success';
            }
        }
    }
    
    // EID input handling
    const eidInput = document.getElementById('eid');
    const eidSubmitBtn = document.getElementById('eidSubmitBtn');
    
    if (eidInput) {
        // Function to process EID
        async function processEid() {
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
                // Clear saved EID info using our centralized function
                clearSavedEid();
                return;
            }
            
            // Validate EID format
            if (!isValidEid(eid)) {
                statusElement.textContent = 'Invalid EID format. Please enter 2-3 lowercase letters followed by 2-8 numbers.';
                statusElement.className = 'status-message error';
                return;
            }
            
            try {
                // EID format is valid, proceed with checking if it exists
                const memberExists = await fetchMemberInfo(eid);

                // Persist EID and membership-exists flag using our centralized function
                saveEidToStorage(eid, memberExists);
                
                // Only if EID is valid, show the content
                contentAfterEid.classList.remove('hidden-until-eid');
                
                // Handle form visibility based on member existence
                handleFormVisibility(memberExists, eid);

                // No need to handle saved membership flag as we now get it directly from API data
                
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
        }
        
        // Submit button click handler - now the only way to submit
        if (eidSubmitBtn) {
            eidSubmitBtn.addEventListener('click', processEid);
        }
        
        // Add keypress event for Enter key
        eidInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent form submission if inside a form
                processEid();
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
                statusElement.textContent = 'EID should be 2-3 letters followed by 3-8 numbers';
                statusElement.className = 'status-message warning';
            } else {
                statusElement.textContent = 'Valid EID format. Click Submit to check membership.';
                statusElement.className = 'status-message success';
            }
        });
    }
    
    // Initialize membership form
    initMembershipForm();
    
    // Shop functionality
    initShopFunctionality();
});
