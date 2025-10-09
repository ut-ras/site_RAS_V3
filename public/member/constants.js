/**
 * constants.js
 * Contains all constants used in the RAS Membership Portal
 */

// API endpoints
export const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzkHNj7J8ai6G9AFmm373TQqI0o02b9WLVkDJwPvavGOlw7XRTC8kacCEkoeblVPKCB/exec';
export const MEMBERSHIP_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRU1JHrIh6esLsBJwMltSBpLwT6wshvtlx3allUAkryWIILbBnLmct30gh_MXi1dcjKk-Kyq7PieTY4/pub?gid=2100017201&single=true&output=csv';

// Shop URLs
export const HCB_BASE_URL = 'https://hcb.hackclub.com/donations/start/austin-ieee-ras?&fee_covered=1&goods=true';

// IRL-only shop items (snacks, etc)
export const irlShopItems = [
    // Drinks
    {
        id: "drinks",
        name: "Drinks (Capri Sun, Soda)",
        price: 100,
    },
    
    {
        id: "drinks",
        name: "Celcius",
        price: 150,
    },
    // Snack Packs
    {
        id: "smallsnacks",
        name: "Fruit Snacks/Rice Krispies)",
        price: 50,
    },
    
    // Chips
    {
        id: "chips",
        name: "Chips",
        price: 100,
    },
    
    // Candy
    {
        id: "candy",
        name: "Candy (Twix, M&Ms, Snickers, Sour Patch, Airhead)",
        price: 150,
    },
    
    // Microwaveable Foods
    {
        id: "popcorn",
        name: "Popcorn",
        price: 100,
    },
    {
        id: "microwavemeals",
        name: "Microwave Meals (Ramen/Mac and Cheese)",
        price: 150,
    },
    
    // Pop Tarts
    {
        id: "poptarts",
        name: "Pop Tarts",
        price: 100,
    },
    {
        id: "shirtXS",
        name: "Shirt (Overstock) XS",
        price: 1500,
    },
    {
        id: "shirtS",
        name: "Shirt (Overstock) S",
    },
    {
        id: "shirtM",
        name: "Shirt (Overstock) M"
    },
    {
        id: "shirtL",
        name: "Shirt (Overstock) L"
    },
    {
        id: "shirtXL",
        name: "Shirt (Overstock) XL"
    },
];

// Shop items data array
export const shopItems = [
    {
        id: "dues",
        name: "RAS Dues",
        price: 3000,
    },
    {
        id: "robotathonShirtXS",
        name: "Robotathon Shirt - XS",
        price: 1500,
    },
    {
        id: "robotathonShirtS",
        name: "Robotathon Shirt - S",
    },
    {
        id: "robotathonShirtM",
        name: "Robotathon Shirt - M"
    },
    {
        id: "robotathonShirtL",
        name: "Robotathon Shirt - L"
    },
    {
        id: "robotathonShirtXL",
        name: "Robotathon Shirt - XL"
    },
    {
        id: "robotathon",
        name: "Robotathon",
        price: 1500,
        image: "../images/ras_logo.png"
    }
];

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
    "VolunteerTabling": [],
    "Other": []
};