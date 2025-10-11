/**
 * shopFunctions.js
 * Contains all shopping-related functionality for the RAS Member Portal
 */

import { HCB_BASE_URL } from './constants.js';
import { getPurchasesByEid, getAvailableSnacks } from './eidStats.js';

// Track current shop mode globally
let currentShopMode = 'regular';

/**
 * Initialize shop functionality
 */
export function initShopFunctionality() {
    // Check if we're in IRL mode from URL
    const searchParams = new URLSearchParams(window.location.search);
    currentShopMode = searchParams.get('irl') === '1' ? 'irl' : 'regular';
    
    // Generate the shop table
    generateShopTable(currentShopMode);
    
    // Add event listener to checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        // Make the checkout button bigger
        checkoutBtn.style.padding = '12px 24px';
        checkoutBtn.style.fontSize = '1.2em';
        checkoutBtn.style.fontWeight = 'bold';
        
        checkoutBtn.addEventListener('click', function() {
            processCheckout();
        });
    }
    
    // No need to handle customer info fields as they've been removed
    
    // Initial total calculation
    updateTotal();
}

/**
 * Process the shop items to propagate image and price values downward
 * @param {Array} itemsArray - Array of shop items
 * @returns {Array} - Processed array of shop items
 */
export function processShopItems(itemsArray = shopItems) {
    let lastImage = null;
    let lastPrice = null;
    
    return itemsArray.map(item => {
        // If this item doesn't have an image, use the last one
        if (!item.image && lastImage) {
            item.image = lastImage;
        } else if (item.image) {
            lastImage = item.image;
        }
        
        // If this item doesn't have a price, use the last one
        if (!item.price && lastPrice) {
            item.price = lastPrice;
        } else if (item.price) {
            lastPrice = item.price;
        }
        
        return {...item}; // Return a copy of the item to avoid modifying the original
    });
}

/**
 * Switch between shop types (IRL vs Regular) without page reload
 * @param {string} mode - The shop mode to switch to ('irl' or 'regular')
 */
export function switchShopType(mode) {
    // Show a brief loading message
    const container = document.getElementById('shopTableContainer');
    if (container) {
        const loadingMsg = document.createElement('div');
        loadingMsg.textContent = 'Loading...';
        loadingMsg.style.padding = '10px';
        loadingMsg.style.textAlign = 'center';
        container.innerHTML = '';
        container.appendChild(loadingMsg);
    }
    
    // Small delay to allow UI update
    setTimeout(() => {
        // Update current shop mode
        currentShopMode = mode === 'irl' ? 'irl' : 'regular';
        
        // Update URL without reloading the page
        const url = new URL(window.location);
        if (currentShopMode === 'irl') {
            url.searchParams.set('irl', '1');
        } else {
            url.searchParams.set('irl', '0');
        }
        window.history.pushState({}, '', url);
        
        // Clear existing table
        if (container) {
            container.innerHTML = '';
        }
        
        // Regenerate the shop table with the new mode
        generateShopTable(currentShopMode);
        
        // Recalculate total
        updateTotal();
    }, 100); // Short delay for better user experience
}

/**
 * Generate shop table from items array
 * @param {string} mode - The shop mode ('irl' or 'regular')
 */
export function generateShopTable(mode = null) {
    const container = document.getElementById('shopTableContainer');
    if (!container) return;
    
    // If mode is not provided, use the current shop mode or determine from URL
    if (mode === null) {
        const searchParams = new URLSearchParams(window.location.search);
        mode = searchParams.get('irl') === '1' ? 'irl' : 'regular';
        currentShopMode = mode;
    }
    
    const isIrlMode = mode === 'irl';
    
    // Get the items to display based on mode
    let itemsToProcess = [];
    if (isIrlMode) {
        // In IRL mode, show ONLY snacks from the API
        const apiSnacks = getAvailableSnacks();
        if (apiSnacks.length > 0) {
            console.log('Using snack items from API:', apiSnacks);
            
            // Convert API snacks to our shop item format
            itemsToProcess = apiSnacks
                .filter(snack => snack.irl) // Only include IRL available items
                .map(snack => ({
                    id: snack.id,
                    name: snack.name,
                    price: snack.price
                }));
        } else {
            // If no API snacks available, show a message
            container.innerHTML = '<p>No snacks currently available. Please try again later.</p>';
            return;
        }
    } else {
        // In regular mode, we should still check for online items
        const apiSnacks = getAvailableSnacks();
        if (apiSnacks.length > 0) {
            itemsToProcess = apiSnacks
                .filter(snack => snack.online) // Only include online available items
                .map(snack => ({
                    id: snack.id,
                    name: snack.name,
                    price: snack.price
                }));
        } else {
            container.innerHTML = '<p>No items currently available for purchase online. Please try again later.</p>';
            return;
        }
    }
    
    // Process items to propagate values
    const processedItems = processShopItems(itemsToProcess);
    
    // Create table element
    const table = document.createElement('table');
    table.id = 'shopTable';
    table.className = 'shop-table';
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Item', 'Quantity', 'Purchased', 'Price'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        
        // Make "Purchased" header smaller
        if (headerText === 'Purchased') {
            th.style.fontSize = '0.85em';
        }
        
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Get current EID for purchase history
    const eidInput = document.getElementById('eid');
    const currentEid = eidInput ? eidInput.value.trim().toLowerCase() : '';
    const userPurchases = currentEid ? getPurchasesByEid(currentEid) || {} : {};
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Create rows for each item
    processedItems.forEach(item => {
        const row = document.createElement('tr');
        row.setAttribute('data-item-id', item.id);
        row.setAttribute('data-price', item.price);
        
        // Photo cell removed
        
        // Name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = item.name;
        
        // Price cell
        const priceCell = document.createElement('td');
        priceCell.textContent = `$${(item.price/100).toFixed(2)}`;
        
        // Purchased cell - show previous purchases if available
        const purchasedCell = document.createElement('td');
        purchasedCell.className = 'purchased-cell';
        
        // Check if this item has been purchased before
        const purchasedCount = getPurchaseCount(userPurchases, item.id);
        if (purchasedCount > 0) {
            purchasedCell.textContent = purchasedCount;
            purchasedCell.classList.add('has-purchases');
        } else {
            purchasedCell.textContent = '-';
        }
        
        // Make purchased text smaller
        purchasedCell.style.fontSize = '0.85em';
        
        // Quantity cell
        const quantityCell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.min = 0;
        input.value = 0;
        input.className = 'quantity-input';
        input.addEventListener('change', function() {
            // Ensure value is not negative
            if (parseInt(this.value) < 0) {
                this.value = 0;
            }
            updateTotal();
        });
        quantityCell.appendChild(input);
        
        // Append cells to row in order (Item, Quantity, Purchased, Price)
        row.appendChild(nameCell);
        row.appendChild(quantityCell);
        row.appendChild(purchasedCell);
        row.appendChild(priceCell);
        
        // Add row to table body
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    // Add shop switch link
    const shopSwitchLink = document.createElement('a');
    shopSwitchLink.href = '#'; // Use # to prevent page navigation
    
    if (isIrlMode) {
        shopSwitchLink.textContent = 'Switch to Online Items';
        shopSwitchLink.setAttribute('data-target-mode', 'regular');
    } else {
        shopSwitchLink.textContent = 'Switch to Available Snacks';
        shopSwitchLink.setAttribute('data-target-mode', 'irl');
    }
    
    // Add click event listener to switch shop type without page reload
    shopSwitchLink.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent the default link behavior
        const targetMode = this.getAttribute('data-target-mode');
        switchShopType(targetMode);
    });
    
    shopSwitchLink.style.color = '#0066cc';
    shopSwitchLink.style.textDecoration = 'underline';
    shopSwitchLink.style.display = 'inline-block';
    shopSwitchLink.style.marginTop = '10px';
    shopSwitchLink.style.fontSize = '0.9em';
    shopSwitchLink.style.cursor = 'pointer';
    container.appendChild(shopSwitchLink);
}

/**
 * Helper function to get purchase count for an item
 * @param {Object} userPurchases - Object with purchase history
 * @param {string} itemId - ID of the item to check
 * @returns {number} - Number of purchases for the item
 */
export function getPurchaseCount(userPurchases, itemId) {
    return userPurchases[itemId] || userPurchases[itemId.toLowerCase()] || 
           Object.entries(userPurchases).find(([k, v]) => k.toLowerCase() === itemId.toLowerCase())?.[1] || 0;
}

/**
 * Calculate and update total amount
 * @returns {number} - Total amount in cents
 */
export function updateTotal() {
    let total = 0;
    const rows = document.querySelectorAll('#shopTable tbody tr');
    
    rows.forEach(row => {
        const price = parseInt(row.getAttribute('data-price'));
        const quantity = parseInt(row.querySelector('.quantity-input').value);
        total += price * quantity;
    });
    
    // Update total display (convert cents to dollars)
    const totalAmountElement = document.getElementById('totalAmount');
    if (totalAmountElement) {
        totalAmountElement.textContent = (total / 100).toFixed(2);
    }
    
    // Enable/disable checkout button based on total with $1 minimum (100 cents)
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        if (total < 100) {  // Less than $1.00
            checkoutBtn.disabled = true;
            checkoutBtn.classList.add('disabled');
            checkoutBtn.style.opacity = '0.5';
            checkoutBtn.style.cursor = 'not-allowed';
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.classList.remove('disabled');
            checkoutBtn.style.opacity = '1';
            checkoutBtn.style.cursor = 'pointer';
        }
    }
    
    // Update the minimum purchase message style based on total
    const minNoteElement = document.querySelector('.checkout-min-note');
    if (minNoteElement) {
        if (total < 100) {
            minNoteElement.style.color = '#bf0000'; // Highlight the message in red when below minimum
            minNoteElement.style.fontWeight = 'bold';
        } else {
            minNoteElement.style.color = '#666'; // Regular color when at or above minimum
            minNoteElement.style.fontWeight = 'normal';
        }
    }
    
    return total;
}

/**
 * Get customer info from API data in localStorage
 * @returns {Object} - Object with name and email properties
 */
function getCustomerInfo() {
    try {
        const savedApiData = localStorage.getItem('apiData');
        if (!savedApiData) return { name: '', email: '' };
        
        const apiData = JSON.parse(savedApiData);
        
        // Construct name from fname and lname
        const firstName = apiData.fname || '';
        const lastName = apiData.lname || '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ');
        
        return {
            name: fullName,
            email: apiData.email || ''
        };
    } catch (e) {
        console.warn('Unable to get customer info from localStorage', e);
        return { name: '', email: '' };
    }
}

/**
 * This function no longer needs to do anything since we're not using text inputs
 */
function restoreCustomerInfo() {
    // No need to restore to input fields anymore
}

/**
 * Process checkout by generating HCB URL and redirecting
 */
export function processCheckout() {
    const eidInput = document.getElementById('eid');
    const eid = eidInput ? eidInput.value.trim().toLowerCase() : '';
    
    // Get customer info from API data in localStorage
    const customerInfo = getCustomerInfo();
    const customerName = customerInfo.name;
    const customerEmail = customerInfo.email;
    
    if (!eid) {
        alert('Please enter your EID first.');
        return;
    }
    
    if (!customerName) {
        alert('Your name is missing from your member data. Please contact an officer.');
        return;
    }
    
    if (!customerEmail) {
        alert('Your email is missing from your member data. Please contact an officer.');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
        alert('Your saved email address appears to be invalid. Please contact an officer.');
        return;
    }
    
    // Use HCB_BASE_URL from constants
    const baseUrl = HCB_BASE_URL;
    
    // Calculate total amount in cents
    const totalAmount = updateTotal();
    
    // Button should already be disabled if total is below $1, but double-check
    if (totalAmount < 100) { // $1.00 = 100 cents
        alert('Minimum purchase of $1.00 required.');
        return;
    }
    
    // Build message string with item details
    let messageItems = [];
    messageItems.push(`rasform25;id:${eid}`);
    
    const rows = document.querySelectorAll('#shopTable tbody tr');
    rows.forEach(row => {
        const itemId = row.getAttribute('data-item-id');
        const quantity = parseInt(row.querySelector('.quantity-input').value);
        
        if (quantity > 0) {
            messageItems.push(`${itemId}:${quantity}`);
        }
    });
    
    const messageParam = encodeURIComponent(messageItems.join(';'));
    
    // Complete URL with parameters, including name and email
    const checkoutUrl = `${baseUrl}&message=${messageParam}&amount=${totalAmount}&name=${encodeURIComponent(customerName)}&email=${encodeURIComponent(customerEmail)}`;
    
    // Redirect to HCB checkout
    window.location.href = checkoutUrl;
}