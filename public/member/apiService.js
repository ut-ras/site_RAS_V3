/**
 * apiService.js
 * Contains functions for API communication in the RAS Member Portal
 */

import { GOOGLE_APPS_SCRIPT_URL } from './constants.js';

/**
 * Generic function to post data to Google Apps Script
 * @param {Object} data - The data object to send
 * @param {Function} onSuccess - Callback function on success
 * @param {Function} onError - Callback function on error
 * @returns {Promise} - Promise representing the fetch request
 */
export function postToAppsScript(data, onSuccess = null, onError = null) {
    return fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',  // Use text/plain to avoid CORS preflight
        },
        body: JSON.stringify(data),
        mode: 'no-cors' // This mode doesn't require CORS headers on the server
    })
    .then(response => {
        // Due to 'no-cors' mode, we can't read the response
        // So we'll just assume success if we get here
        console.log('Data successfully submitted:', data);
        if (onSuccess) onSuccess(response);
        return response;
    })
    .catch(error => {
        console.error('Error submitting data:', error);
        if (onError) onError(error);
        throw error;
    });
}