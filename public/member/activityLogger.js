/**
 * activityLogger.js
 * Contains functions for managing activity logging in the RAS Member Portal
 */

import { activityData } from './constants.js';
import { postToAppsScript } from './apiService.js';

// Store references to UI elements and state
let activitySection;
let subOptionsContainer;
let logActivityButton;
let checkboxRefs = {
    main: {},
    sub: {}
};
let currentlySelectedMainActivity = null;
let preSelectedActivity = null;
let preSelectedSubOption = null;

/**
 * Initialize the activity logging section
 * @param {string|null} initialActivity - Pre-selected activity from URL parameters
 * @param {string|null} initialSubOption - Pre-selected sub-option from URL parameters
 */
export function setupActivitySection(initialActivity = null, initialSubOption = null) {
    // Store preselected values for reference throughout the component
    // Convert to lowercase for case-insensitive comparison
    preSelectedActivity = initialActivity ? initialActivity.toLowerCase() : null;
    preSelectedSubOption = initialSubOption ? initialSubOption.toLowerCase() : null;
    
    activitySection = document.getElementById('activitySection');
    if (!activitySection) return;
    
    // Initialize UI elements
    initializeUIElements();
    
    // Generate main activity buttons
    generateActivityButtons();
    
    // Set up log activity button handler
    setupLogActivityButtonHandler();
}

/**
 * Initialize UI elements for the activity section
 */
function initializeUIElements() {
    // Clear any existing content
    const activityButtonsContainer = activitySection.querySelector('.activity-buttons');
    
    // Create sub-options container
    subOptionsContainer = document.createElement('div');
    subOptionsContainer.id = 'subOptionsContainer';
    subOptionsContainer.className = 'sub-options-container';
    
    // Get or create the log button
    logActivityButton = document.getElementById('logActivityButton');
    if (!logActivityButton) {
        logActivityButton = document.createElement('button');
        logActivityButton.id = 'logActivityButton';
        logActivityButton.className = 'submit-btn disabled';
        logActivityButton.disabled = true;
        logActivityButton.textContent = 'Log Activity';
        activitySection.appendChild(logActivityButton);
    }
    
    // Add sub-options container after activity buttons
    activitySection.insertBefore(subOptionsContainer, logActivityButton);
}

/**
 * Generate main activity buttons
 */
function generateActivityButtons() {
    const activityButtonsContainer = activitySection.querySelector('.activity-buttons');
    if (!activityButtonsContainer) return;
    
    activityButtonsContainer.innerHTML = '';
    
    Object.keys(activityData).forEach(activity => {
        const buttonLabel = document.createElement('label');
        buttonLabel.className = 'activity-button';
        buttonLabel.id = `${activity.toLowerCase()}Button`;
        
        if (activity === 'Other') {
            buttonLabel.className += ' other-button';
        }
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'activity';
        checkbox.value = activity;
        
        // Check if this activity matches the preselected one from URL
        const shouldPreselect = preSelectedActivity && 
                               (preSelectedActivity.toLowerCase() === activity.toLowerCase());
        
        if (shouldPreselect) {
            checkbox.checked = true;
        }
        
        const span = document.createElement('span');
        span.textContent = activity === 'BusinessAdvertising' ? 'Business/Advertising' : 
                          activity === 'VolunteerTabling' ? 'Volunteer/Tabling Event' : 
                          activity;
        
        buttonLabel.appendChild(checkbox);
        buttonLabel.appendChild(span);
        
        // Special case for "Other" to add a text input
        if (activity === 'Other') {
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.id = 'otherActivity';
            textInput.placeholder = 'Specify';
            buttonLabel.appendChild(textInput);
        }
        
        activityButtonsContainer.appendChild(buttonLabel);
        
        // Store reference to the checkbox
        checkboxRefs.main[activity] = checkbox;
        
        // Add event listener
        checkbox.addEventListener('change', function() {
            handleMainActivityChange(activity);
        });
    });
    
    // If a preselected activity was found and checked, trigger the change handler
    if (preSelectedActivity) {
        // Find the matching activity
        const matchingActivity = Object.keys(activityData).find(activity => 
            activity.toLowerCase() === preSelectedActivity.toLowerCase());
            
        if (matchingActivity && checkboxRefs.main[matchingActivity].checked) {
            handleMainActivityChange(matchingActivity);
        }
    }
}

/**
 * Function to update URL with current activity selection
 * @param {string|null} activity - The selected activity
 * @param {string|null} subOption - The selected sub-option
 */
function updateUrlWithActivity(activity, subOption) {
    const url = new URL(window.location.href);
    
    if (activity) {
        url.searchParams.set('attendanceactivity', activity);
        
        if (subOption) {
            url.searchParams.set('attendancesuboption', subOption);
        } else {
            url.searchParams.delete('attendancesuboption');
        }
    } else {
        url.searchParams.delete('attendanceactivity');
        url.searchParams.delete('attendancesuboption');
    }
    
    // Update URL without reloading page
    window.history.replaceState({}, '', url.toString());
}

/**
 * Handle main activity selection
 * @param {string} selectedActivity - The selected activity
 */
function handleMainActivityChange(selectedActivity) {
    const isChecked = checkboxRefs.main[selectedActivity].checked;
    
    // If this activity is now checked
    if (isChecked) {
        currentlySelectedMainActivity = selectedActivity;
        
        // Uncheck all other main activities
        Object.keys(activityData).forEach(activity => {
            if (activity !== selectedActivity) {
                checkboxRefs.main[activity].checked = false;
            }
        });
        
        // Show sub-options if this activity has any
        if (activityData[selectedActivity].length > 0) {
            generateSubOptions(selectedActivity);
            subOptionsContainer.style.display = 'block';
            
            // Don't update URL yet - wait for suboption selection
        } else {
            subOptionsContainer.innerHTML = '';
            subOptionsContainer.style.display = 'none';
            
            // Update URL with main activity only (no suboptions)
            updateUrlWithActivity(selectedActivity, null);
        }
    } else {
        // If unchecking the current activity
        currentlySelectedMainActivity = null;
        subOptionsContainer.innerHTML = '';
        subOptionsContainer.style.display = 'none';
        
        // Remove activity from URL
        updateUrlWithActivity(null, null);
    }
    
    updateLogButtonState();
}

/**
 * Generate sub-options for selected main activity
 * @param {string} mainActivity - The selected main activity
 */
function generateSubOptions(mainActivity) {
    subOptionsContainer.innerHTML = '';
    checkboxRefs.sub = {}; // Reset sub-option references
    
    const heading = document.createElement('h4');
    heading.textContent = `${mainActivity} Options`;
    subOptionsContainer.appendChild(heading);
    
    const subButtonsContainer = document.createElement('div');
    subButtonsContainer.className = 'activity-buttons';
    
    activityData[mainActivity].forEach(subOption => {
        const buttonLabel = document.createElement('label');
        buttonLabel.className = 'activity-button';
        
        // Change from checkbox to radio button for single select
        const radio = document.createElement('input');
        radio.type = 'radio'; // Changed from checkbox to radio
        radio.name = mainActivity.toLowerCase(); // Same name ensures they belong to the same group
        radio.value = subOption.replace(/ /g, ''); // Remove spaces for value
        
        // Check if this sub-option matches the preselected one from URL
        if (preSelectedSubOption && 
            preSelectedSubOption.toLowerCase() === subOption.replace(/ /g, '').toLowerCase()) {
            radio.checked = true;
            // Will update URL in updateLogButtonState
        }
        
        const span = document.createElement('span');
        span.textContent = subOption;
        
        buttonLabel.appendChild(radio);
        buttonLabel.appendChild(span);
        subButtonsContainer.appendChild(buttonLabel);
        
        // Store reference to the radio button
        if (!checkboxRefs.sub[mainActivity]) {
            checkboxRefs.sub[mainActivity] = [];
        }
        checkboxRefs.sub[mainActivity].push(radio);
        
        // Add event listener
        radio.addEventListener('change', updateLogButtonState);
    });
    
    subOptionsContainer.appendChild(subButtonsContainer);
    
    // Trigger update of log button state to handle URL updates for any preselected suboption
    updateLogButtonState();
}

/**
 * Update the state of the log button
 */
function updateLogButtonState() {
    let shouldEnable = false;
    let selectedSubOption = null;
    
    if (currentlySelectedMainActivity) {
        // If activity has sub-options, require one sub-option to be selected
        if (activityData[currentlySelectedMainActivity].length > 0) {
            if (checkboxRefs.sub[currentlySelectedMainActivity]) {
                // Check if any sub-options are selected (now using radio buttons)
                const subOptions = checkboxRefs.sub[currentlySelectedMainActivity];
                const selectedRadio = subOptions.find(radio => radio.checked);
                
                if (selectedRadio) {
                    shouldEnable = true;
                    selectedSubOption = selectedRadio.value;
                    
                    // Update URL with activity and suboption
                    updateUrlWithActivity(currentlySelectedMainActivity, selectedSubOption);
                } else {
                    // No sub-option selected, but main activity is selected
                    updateUrlWithActivity(currentlySelectedMainActivity, null);
                }
            }
        } else {
            // For activities without sub-options, simply being selected is enough
            shouldEnable = true;
        }
    }
    
    // Update button state
    logActivityButton.disabled = !shouldEnable;
    if (shouldEnable) {
        logActivityButton.classList.remove('disabled');
    } else {
        logActivityButton.classList.add('disabled');
    }
}

/**
 * Set up the log activity button handler
 */
function setupLogActivityButtonHandler() {
    logActivityButton.addEventListener('click', function() {
        if (this.disabled) return;
        
        // Get the current EID
        const eidInput = document.getElementById('eid');
        const eid = eidInput ? eidInput.value.trim().toLowerCase() : '';
        
        if (!eid) {
            alert('Please enter your EID first.');
            return;
        }
        
        // Change button text and disable it during submission
        const originalText = this.textContent;
        this.textContent = 'Submitting...';
        this.disabled = true;
        this.classList.add('disabled');
        
        // Prepare data for submission
        const activityData = collectActivityData(eid);
        
        // Send data to Google Apps Script
        submitActivityData(activityData, originalText);
    });
}

/**
 * Collect activity data for submission
 * @param {string} eid - The user's EID
 * @returns {Object} - The activity data for submission
 */
function collectActivityData(eid) {
    // Prepare selected activities array
    const selectedActivities = [];
    
    // Get main activity and sub-activity data
    let mainActivity = currentlySelectedMainActivity || '';
    let subActivity = '';
    
    // Handle "Other" activity type
    if (mainActivity === 'Other') {
        const otherInput = document.getElementById('otherActivity');
        if (otherInput && otherInput.value.trim()) {
            mainActivity = `Other: ${otherInput.value.trim()}`;
            selectedActivities.push(mainActivity);
        } else {
            selectedActivities.push('Other');
        }
    } 
    // Handle regular activities
    else if (mainActivity) {
        // For activities without sub-options
        if (activityData[mainActivity].length === 0) {
            selectedActivities.push(mainActivity);
        } else {
            // For activities with sub-options (now only one will be selected)
            let selectedSubOption = null;
            // Find the selected radio button
            const selectedRadio = checkboxRefs.sub[mainActivity].find(radio => radio.checked);
            
            if (selectedRadio) {
                // Convert the value back to display text if needed
                const optionIndex = activityData[mainActivity].findIndex(
                    opt => opt.replace(/ /g, '') === selectedRadio.value
                );
                if (optionIndex !== -1) {
                    selectedSubOption = activityData[mainActivity][optionIndex];
                } else {
                    selectedSubOption = selectedRadio.value;
                }
                
                // Add the activity with its selected sub-option
                selectedActivities.push(`${mainActivity}: ${selectedSubOption}`);
                subActivity = selectedSubOption;
            }
        }
    }
    
    // Return formatted data object for submission
    return {
        'TYPE': 'ATTENDANCE', // Indicate this is activity data, not membership data
        'EID': eid,
        'ACTIVITY': mainActivity,
        'SUBACTIVITY': subActivity,
        'TIMESTAMP': new Date().toISOString()
    };
}

/**
 * Submit activity data to Google Apps Script
 * @param {Object} activitySubmitData - The data to submit
 * @param {string} originalButtonText - The original button text to restore after submission
 */
function submitActivityData(activitySubmitData, originalButtonText) {
    postToAppsScript(activitySubmitData, 
        // Success callback
        () => {
            // Display a confirmation message
            // alert(`Activity logged for EID ${activitySubmitData.EID}: ${activitySubmitData.ACTIVITY}${activitySubmitData.SUBACTIVITY ? ' - ' + activitySubmitData.SUBACTIVITY : ''}`);
            
            // Log for debugging
            console.log('Activity logged:', activitySubmitData);
            
            // Reset form state after successful submission
            resetActivityForm(originalButtonText);
        },
        // Error callback
        (error) => {
            alert('Error logging activity. Please try again.');
            console.error('Error logging activity:', error);
            
            // Restore button state even on error
            if (logActivityButton) {
                logActivityButton.textContent = originalButtonText;
                logActivityButton.disabled = false;
                logActivityButton.classList.remove('disabled');
            }
        }
    );
}

/**
 * Reset the activity form after submission
 * @param {string} [originalButtonText='Log Activity'] - The original button text to restore
 */
function resetActivityForm(originalButtonText = 'Log Activity') {
    // Reset main activity selection
    if (currentlySelectedMainActivity) {
        checkboxRefs.main[currentlySelectedMainActivity].checked = false;
    }
    
    // Reset all sub-options
    Object.keys(checkboxRefs.sub).forEach(mainActivity => {
        checkboxRefs.sub[mainActivity].forEach(checkbox => {
            checkbox.checked = false;
        });
    });
    
    // Clear current selection
    currentlySelectedMainActivity = null;
    
    // Reset UI state
    subOptionsContainer.innerHTML = '';
    subOptionsContainer.style.display = 'none';
    
    // Clear "Other" input if present
    const otherInput = document.getElementById('otherActivity');
    if (otherInput) otherInput.value = '';
    
    // Restore the button text and disable it
    if (logActivityButton) {
        logActivityButton.textContent = originalButtonText;
        logActivityButton.disabled = true;
        logActivityButton.classList.add('disabled');
    }
}