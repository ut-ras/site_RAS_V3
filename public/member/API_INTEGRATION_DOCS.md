# API Integration Update Documentation

## Overview
This document describes the changes made to integrate the JSON API response format into the RAS Member Portal. The API now returns data exclusively in a JSON format that includes membership information, payment history, and available snack items.

## API Response Format

The API now returns data in the following format:
```json
{
  "eid": "km54774",
  "timestamp": "2025-10-09T17:04:31.788Z",
  "payments": [
    "id:km54774;shirtM:1",
    "rasform25;id:km54774;shirtm:1;shirtl:1",
    "rasform25;id:km54774;poptarts:1"
  ],
  "snack": [
    {
      "id": "chips",
      "text": "Chips",
      "price": 50,
      "online": 0,
      "irl": 1
    },
    {
      "id": "caprisun",
      "text": "Capri Sun",
      "price": 50,
      "online": 0,
      "irl": 1
    }
  ]
}
```

## Changes Made

### 1. Cleaned up `eidStats.js`:
- Removed all CSV-related code as the API now only returns JSON
- Simplified data processing functions to handle only JSON
- Created functionality to extract payment information from the payments array
- Added handling of snack data from the API
- Updated the member existence check to use the timestamp as an indicator of form completion

### 2. Updated Shop Functionality:
- Modified shop generation to use snack data from the API when available

### 3. Added Diagnostic Tools:
- Created a test module (`testApiIntegration.js`) to verify API integration
- Added a test button to the UI for development purposes

## Technical Details

### JSON Payment Data Handling
The system now parses payment data from an array of strings, where each string may contain multiple items in a semicolon-delimited format. The system extracts item IDs and quantities and aggregates them into a purchases object.

### Snack Data Handling
The API now provides a list of available snack items with details such as price, name, and availability (online/in-person). The shop functionality now incorporates these items when displaying the shop interface.

### Member Existence Check
The timestamp field in the API response is used to determine whether a member has completed the membership form. If the timestamp is present and non-empty, the member is considered to have filled out the form.

## Testing

To test the API integration:
1. Load the member portal page
2. Enter the test EID "km54774"
3. Click the "Run API Integration Tests" button at the bottom of the page
4. Check the browser console for test results

The test verifies:
- Successful data loading
- Member existence check
- Current EID setting
- Availability of snack data
- Availability of purchase history data