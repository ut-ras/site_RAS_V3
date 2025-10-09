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
 * Appends data to the specified sheet, creating new columns if needed
 * 
 * @param {Object} data - The data object to append
 * @param {String} sheetName - The name of the sheet to append to
 * @return {Object} Information about the operation
 */
function appendDataToSheet(data, sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Get the sheet - it should exist based on our earlier validation
  let sheet = ss.getSheetByName(sheetName);
  
  // Check if the first cell is empty to determine if headers need to be added
  const firstCell = sheet.getRange(1, 1).getValue();
  if (firstCell === '') {
    // Initialize with default headers if the sheet is empty
    sheet.appendRow(['TIMESTAMP', 'EID']);
  }
  
  // Get existing headers
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  const headers = headerRange.getValues()[0];
  
  // Check for new fields and add headers if needed
  let updatedHeaders = [...headers];
  const newHeaders = [];
  
  Object.keys(data).forEach(key => {
    if (!headers.includes(key)) {
      updatedHeaders.push(key);
      newHeaders.push(key);
    }
  });
  
  // If there are new headers, upd//https://script.google.com/macros/s/AKfycbzkHNj7J8ai6G9AFmm373TQqI0o02b9WLVkDJwPvavGOlw7XRTC8kacCEkoeblVPKCB/execate the header row
  if (newHeaders.length > 0) {
    // Add new columns
    sheet.getRange(1, headers.length + 1, 1, newHeaders.length)
      .setValues([newHeaders]);
    
    // Get updated headers
    const updatedHeaderRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    updatedHeaders = updatedHeaderRange.getValues()[0];
  }
  
  // Prepare row data to match all headers
  const rowData = updatedHeaders.map(header => data[header] || '');
  
  // Append the new row
  sheet.appendRow(rowData);
  
  return {
    'sheetName': sheetName,
    'newHeaders': newHeaders,
    'rowAdded': rowData
  };
}

/**
 * Handle GET requests - provides filtered PublishedPayments data as CSV when given an EID
 * @param {Object} e - The event object containing query parameters
 */
function doGet(e) {
  try {
    // Check if EID query parameter is provided
    if (!e || !e.parameter || !e.parameter.eid) {
      return ContentService.createTextOutput(
        JSON.stringify({
          'status': 'error',
          'message': 'Missing required query parameter: eid'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const eid = e.parameter.eid.toLowerCase().trim();
    
    // Get the PublishedPayments sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('PublishedPayments');
    
    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({
          'status': 'error',
          'message': 'PublishedPayments sheet not found'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();
    
    // Filter rows that contain the given EID in any cell
    const filteredRows = data.filter((row, index) => {
      if (index === 0) return true; // Keep headers
      
      // Check if any cell in the row contains the EID
      return row.some(cell => {
        if (cell === null || cell === undefined) return false;
        return cell.toString().toLowerCase().trim().includes(eid);
      });
    });
    
    // Convert filtered data to CSV
    if (filteredRows.length <= 1) { // Only headers or nothing
      return ContentService.createTextOutput(
        JSON.stringify({
          'status': 'success',
          'message': 'No records found for the provided EID',
          'eid': eid
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Convert to CSV
    const csv = filteredRows.map(row => 
      row.map(cell => {
        // Handle special characters and ensure proper CSV formatting
        if (cell === null || cell === undefined) return '';
        
        const cellStr = cell.toString();
        // If cell contains comma, quote, or newline, wrap in quotes and escape quotes
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return '"' + cellStr.replace(/"/g, '""') + '"';
        }
        return cellStr;
      }).join(',')
    ).join('\n');
    
    // Return as CSV
    return ContentService.createTextOutput(csv)
      .setMimeType(ContentService.MimeType.CSV)
      .downloadAsFile(`payments_${eid}.csv`);
  
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(
      JSON.stringify({
        'status': 'error',
        'message': `Error processing request: ${error.message}`
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
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
