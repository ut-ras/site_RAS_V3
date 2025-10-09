/**
 * membershipForm.js
 * Contains functions for handling the membership form functionality
 */

import { GOOGLE_APPS_SCRIPT_URL } from './constants.js';
import { postToAppsScript } from './apiService.js';

/**
 * Initialize membership form functionality
 */
export function initMembershipForm() {
    // Setup form toggle function
    setupFormToggle();
    
    // Setup form submission handler
    setupFormSubmissionHandler();
}

/**
 * Setup the toggle functionality for the membership form
 */
function setupFormToggle() {
    // Expose function to global window object for onclick handler in HTML
    window.toggleMembershipForm = function() {
        const form = document.getElementById('membershipForm');
        // If form is hidden, show it
        if (form.style.display === 'none' || form.style.display === '') {
            form.style.display = 'block';
        } else {
            // Only hide the form if the update button is visible
            // This prevents hiding the form when it was automatically shown for new members
            const updateInfoBtn = document.getElementById('updateInfoBtn');
            if (updateInfoBtn && updateInfoBtn.style.display !== 'none') {
                form.style.display = 'none';
            }
        }
    };
}

/**
 * Setup the form submission handler
 */
function setupFormSubmissionHandler() {
    const memberForm = document.getElementById('rasForm');
    if (memberForm) {
        memberForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Show loading state
            const submitButton = memberForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
            
            // Collect form data
            const formData = new FormData(memberForm);
            const data = {
                'TYPE': 'MEMBERSHIP' // Default type for membership form
            };
            
            // Process all form fields
            processFormFields(memberForm, data);
            
            // Submit data to Google Apps Script
            submitMembershipForm(memberForm, data, submitButton, originalButtonText);
        });
    }
}

/**
 * Process all fields in the membership form
 * @param {HTMLFormElement} form - The form element to process
 * @param {Object} data - The data object to fill with form values
 */
function processFormFields(form, data) {
    // Generic approach to process all form fields
    // Loop through all form elements
    Array.from(form.elements).forEach(element => {
        // Skip buttons, fieldsets, and elements without names
        if (!element.name || element.type === 'submit' || element.tagName === 'FIELDSET' || element.tagName === 'BUTTON') {
            return;
        }
        
        const fieldName = element.name.toUpperCase();
        
        // Handle checkboxes (multiple values possible)
        if (element.type === 'checkbox' && element.checked) {
            if (!data[fieldName]) {
                data[fieldName] = [];
            }
            
            if (Array.isArray(data[fieldName])) {
                data[fieldName].push(element.value);
            }
            return;
        }
        
        // Handle radio buttons - only process if checked
        if (element.type === 'radio' && !element.checked) {
            return;
        }
        
        // Skip text inputs that are part of "other" options (will be processed later)
        if (element.type === 'text' && element.id.startsWith('other')) {
            return;
        }
        
        // Standard field processing for non-other fields
        if (element.type !== 'radio' && element.type !== 'checkbox') {
            if (element.value.trim() !== '' || element.required) {
                data[fieldName] = element.value;
            }
        }
    });
    
    // Process "other" options by convention
    // Check all radio button groups with an "other" option
    const radioGroups = new Set();
    form.querySelectorAll('input[type="radio"]').forEach(radio => {
        radioGroups.add(radio.name);
    });
    
    radioGroups.forEach(groupName => {
        const checkedRadio = form.querySelector(`input[name="${groupName}"]:checked`);
        if (checkedRadio && checkedRadio.value === 'other') {
            const otherInput = form.querySelector(`#other${groupName.charAt(0).toUpperCase() + groupName.slice(1)}`);
            if (otherInput && otherInput.value.trim() !== '') {
                data[groupName.toUpperCase()] = otherInput.value;
            }
        }
    });
    
    // Convert any arrays to comma-separated strings for easier storage in spreadsheets
    Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
            data[key] = data[key].join(', ');
        }
    });
}

/**
 * Submit membership form data to Google Apps Script
 * @param {HTMLFormElement} form - The form element
 * @param {Object} data - The data to submit
 * @param {HTMLButtonElement} submitButton - The submit button
 * @param {string} originalButtonText - Original text of the submit button
 */
function submitMembershipForm(form, data, submitButton, originalButtonText) {
    postToAppsScript(
        data,
        // Success callback
        () => {
            // Reset form and show success message
            form.reset();
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Form submitted successfully! Thank you for joining RAS.';
            form.parentNode.insertBefore(successMessage, form);
            
            // Reset button
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            
            // Hide the form after successful submission
            setTimeout(() => {
                form.style.display = 'none';
            }, 2000);
        },
        // Error callback
        (error) => {
            console.error('Error:', error);
            
            // Show error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'There was an error submitting your form. Please try again or contact us directly.';
            form.parentNode.insertBefore(errorMessage, form);
            
            // Reset button
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    );
}

/**
 * Handle EID form visibility based on member existence
 * @param {boolean} memberExists - Whether the member exists
 * @param {string} eid - The EID entered
 */
export function handleFormVisibility(memberExists, eid) {
    // Copy EID to hidden form field if it exists
    const formEidElement = document.getElementById('formEid');
    if (formEidElement) {
        formEidElement.value = eid;
    }
    
    // Show/hide update button based on member existence
    const updateInfoBtn = document.getElementById('updateInfoBtn');
    if (updateInfoBtn) {
        updateInfoBtn.style.display = memberExists ? 'block' : 'none';
    }
    
    // Automatically show form if member doesn't exist
    const membershipForm = document.getElementById('membershipForm');
    if (membershipForm) {
        membershipForm.style.display = memberExists ? 'none' : 'block';
    }
}