/**
 * constants.js
 * Contains all constants used in the RAS Membership Portal
 */

// API endpoint
export const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzkHNj7J8ai6G9AFmm373TQqI0o02b9WLVkDJwPvavGOlw7XRTC8kacCEkoeblVPKCB/exec';

// Shop URLs
export const HCB_BASE_URL = 'https://hcb.hackclub.com/donations/start/austin-ieee-ras?&fee_covered=1&goods=true';

// Define empty arrays to ensure backward compatibility
export const irlShopItems = [];
export const shopItems = [];

// Activity data structure with main activities and their sub-options
export const activityData = {
    // Activities with sub-options
    "Demobots": ["General", "Couchbot", "Dancebot", "Armbot", "TOA", "Chessbot", "Polargraph", "Mirrorbot", "IGVC"],
    "Robotathon": ["Team Meeting", "WorkshopOrGM"],
    
    // Activities without sub-options
    "GM": [],
    "RoboMaster": [],
    "VexU": [],
    "BusinessOrAdvertising": [],
    "LM": [],
    "Volunteer": [],
    "Other": []
};