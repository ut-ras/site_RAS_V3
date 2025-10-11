/**
 * Google Apps Script template to receive POST events and append data to sheets
 * 
 * This script handles POST requests containing JSON data and:
 * 1. Checks if the request contains a TYPE field
 * 2. Validates that an EID is present and TYPE is all uppercase
 * 3. Appends data to the appropriate sheet based on the TYPE value
 * 4. Creates new columns if needed to match incoming data fields
 */

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data.TYPE) {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Missing TYPE field'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (!data.EID) {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Missing EID field'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Validate that TYPE is all uppercase
    const typeValue = String(data.TYPE);
    if (typeValue !== typeValue.toUpperCase()) {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'TYPE'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the active spreadsheet to check for existing sheets
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Determine which sheet to append to
    // If a sheet with the TYPE name already exists, use that, otherwise use 'OTHER'
    const sheetExists = ss.getSheetByName(typeValue) !== null;
    const sheetName = sheetExists ? typeValue : 'OTHER';
    
    // Add submission timestamp to data
    data.TIMESTAMP = new Date().toISOString();
    
    // Append the data to the appropriate sheet
    const result = appendDataToSheet(data, sheetName);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'message': `Data appended to ${sheetName} sheet`,
      'result': result
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': `Error processing request: ${error.message}`
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
/**
 * Find member data for a given EID from the filledEIDs sheet
 * @param {String} eid - The EID to look up
 * @return {Object|null} An object with all member data or null if not found
 */
function findTimestampForEID(eid) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const filledEIDsSheet = ss.getSheetByName('filledEIDs');
  
  if (!filledEIDsSheet) {
    return null;
  }
  
  // Get all data from the filledEIDs sheet
  const data = filledEIDsSheet.getDataRange().getValues();
  
  // Get headers from first row
  const headers = data[0];
  
  // Look for the EID in remaining rows
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const eidValue = row[0] ? row[0].toString().toLowerCase().trim() : '';
    
    if (eidValue === eid.toLowerCase().trim()) {
      // Create an object with all fields
      const memberData = {};
      headers.forEach((header, index) => {
        if (header) { // Only include non-empty headers
          memberData[header] = row[index] !== undefined ? row[index] : null;
        }
      });
      return memberData;
    }
  }
  
  return null;
}

/**
 * Parse the Snack sheet into an array of objects.
 * Each object uses header names as keys and cell contents as values.
 * Example return:
 * [
 *   { id: 'chips', text: 'Chips', 'price (cents)': 50 },
 *   { id: 'caprisun', text: 'Capri Sun', 'price (cents)': 50 }
 * ]
 */
function parseSnackSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Snack');
  if (!sheet) return [];

  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => h.toString().trim());
  const rows = values.slice(1);

  const objects = rows
    .filter(row => row.some(v => v !== '')) // skip blank rows
    .map(row => {
      const obj = {};
      headers.forEach((key, i) => {
        obj[key] = row[i];
      });
      return obj;
    });

  return objects;
}


/**
 * Return all RawPayments!C:C messages that contain id:<eid>;
 * @param {string} eid
 * @return {string[]} matching messages (raw strings from column C)
 */
function getRawPaymentsForEID_(eid) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('RawPayments');
  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return []; // no data

  // Column C
  const col = sheet.getRange(1, 3, lastRow, 1).getValues().map(r => r[0]);
  const eidRe = new RegExp(`\\bid\\s*:\\s*${eid}\\s*;`, 'i');

  // Skip header if present; keep only rows that match id:<eid>;
  return col
    .slice(1)                   // drop header row (C1)
    .filter(v => v != null && v !== '' && eidRe.test(String(v)));
}

/**
 * Handle GET requests - returns snacks purchased by an EID
 * Uses Snack (id, text, price) and RawPayments!C:C messages.
 * Query param: ?eid=xyz
 */
function doGet(e) {
  try {
    if (!e || !e.parameter || !e.parameter.eid) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'error', message: 'Missing required query parameter: eid' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const eid = e.parameter.eid.toLowerCase().trim();

    // Get all member data
    const memberData = findTimestampForEID(eid);

    const payments = getRawPaymentsForEID_(eid);              // RawPayments col C
    
    // Create response with all member data fields
    const response = { 
      eid,
      payments,
      snack: parseSnackSheet()
    };
    
    // Add all member data fields to the response if available
    if (memberData) {
      Object.keys(memberData).forEach(key => {
        response[key.toLowerCase()] = memberData[key];
      });
    }
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: `Error processing request: ${error.message}` })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function testMyTest() {
     const memberData = findTimestampForEID("km54774");
     console.log("Member data for km54774:", memberData);
}

/**
 * Test function to simulate a POST event (for manual testing in the script editor)
 */
function testAppendData() {
  const testData = {
    'TYPE': 'ATTENDANCE',
    'EID': 'abc123',
    'FNAME': 'John',
    'LNAME': 'Doe',
    'EVENT': 'General Meeting',
    'RANDOM_FIELD': 'Some Value'
  };
  
  // Get the active spreadsheet to check for existing sheets
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Determine which sheet to append to, following the same logic as doPost
  const sheetExists = ss.getSheetByName(testData.TYPE) !== null;
  const sheetName = sheetExists ? testData.TYPE : 'OTHER';
  
  const result = appendDataToSheet(testData, sheetName);
  
  Logger.log(result);
}
