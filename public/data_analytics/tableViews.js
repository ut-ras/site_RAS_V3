// Add shared table schema and constraints for DB initialization
export const schemas = {
  user_info: {
    eid: 'TEXT', timestamp: 'TEXT', firstname: 'TEXT', lastname: 'TEXT', email: 'TEXT',
    dues: 'BOOLEAN', discord: 'BOOLEAN', waiver: 'BOOLEAN', committee_interest: 'TEXT',
    major: 'TEXT', minor: 'TEXT', gradsem: 'REAL', gender: 'TEXT',
    hispanic_latino: 'BOOLEAN', race: 'TEXT'
  },
  resumes: { eid: 'TEXT', timestamp: 'TEXT', resumelink: 'TEXT' },
  attendance: { eid: 'TEXT', timestamp: 'TEXT', event: 'TEXT', date_of_attendance: 'TEXT' },
  hcb_donations: {
    id: 'TEXT', date: 'TEXT', donor_name: 'TEXT', donor_email: 'TEXT',
    amount_cents: 'INTEGER', message: 'TEXT', dues_eid: 'TEXT'
  }
};
export const tableConstraints = {
  user_info: 'PRIMARY KEY(eid, timestamp)',
  resumes: 'PRIMARY KEY(eid, timestamp)',
  attendance: 'PRIMARY KEY(eid, timestamp)',
  hcb_donations: 'PRIMARY KEY(id)'
};

// Define SQL for creating views
export const viewDefinitions = [
  {
    name: 'ui_latest',
    create: `CREATE VIEW ui_latest AS
SELECT ui.*
FROM user_info ui
JOIN (
  SELECT eid, MAX(timestamp) AS last_ts
  FROM user_info
  GROUP BY eid
) lu ON ui.eid = lu.eid AND ui.timestamp = lu.last_ts;`
  },
  {
    name: 'resume_latest',
    create: `CREATE VIEW resume_latest AS
SELECT r.*
FROM resumes r
JOIN (
  SELECT eid, MAX(timestamp) AS last_ts
  FROM resumes
  GROUP BY eid
) lr ON r.eid = lr.eid AND r.timestamp = lr.last_ts;`
  },
  {
    name: 'latest_user_resume',
    create: `CREATE VIEW latest_user_resume AS
SELECT
  ui.eid,
  ui.firstname,
  ui.lastname,
  ui.email,
  ui.dues,
  ui.discord,
  ui.waiver,
  ui.committee_interest,
  ui.major,
  ui.minor,
  ui.gradsem,
  ui.gender,
  ui.hispanic_latino,
  ui.race,
  r.resumelink
FROM ui_latest ui
LEFT JOIN resume_latest r ON ui.eid = r.eid;`  
  },
  {
    name: 'attendance_unique',
    create: `CREATE VIEW attendance_unique AS
SELECT
  eid,
  event,
  COALESCE(
    NULLIF(TRIM(date_of_attendance), ''),
    strftime('%Y-%m-%d', timestamp)
  ) AS attendance_date
FROM attendance
GROUP BY eid, event, attendance_date;`
  }
];

// tableViews.js: Defines all table views and their SQL queries
export const tableViews = [
  {
    name: 'user_info',
    label: 'All User Info',
    query: 'SELECT * FROM user_info'
  },
  {
    name: 'resumes',
    label: 'All Resumes',
    query: 'SELECT * FROM resumes'
  },
  {
    name: 'ui_latest',
    label: 'Latest User Info per EID',
    query: 'SELECT * FROM ui_latest'
  },
  {
    name: 'resume_latest',
    label: 'Latest Resume per EID',
    query: 'SELECT * FROM resume_latest'
  },
  {
    name: 'attendance',
    label: 'All Attendance',
    query: 'SELECT * FROM attendance'
  },
  {
    name: 'attendance_unique',
    label: 'Normalized Attendance Events',
    query: 'SELECT * FROM attendance_unique ORDER BY attendance_date'
  },
  {
    name: 'hcb_donations',
    label: 'All HCB Donations',
    query: 'SELECT * FROM hcb_donations ORDER BY date DESC'
  },
  {
    name: 'latest_user_resume',
    label: 'Latest user_info + resume per EID',
    query: 'SELECT * FROM latest_user_resume'
  },
  {
    name: 'hcb_donations_summary',
    label: 'HCB Donations Summary since 2025-06-01',
    query: `SELECT dues_eid, SUM(amount_cents)/100.0 AS amount, SUM(amount_cents) > 150 AS good
FROM hcb_donations
WHERE date > '2025-06-01' 
      AND dues_eid IS NOT NULL
GROUP BY dues_eid;`
  },
  {
    name: 'hcb_donations_summary_with_names',
    label: 'HCB Donations Summary with Names since 2025-06-01',
    query: `SELECT ui.firstname, ui.lastname, ui.major, hds.dues_eid, hds.amount, hds.good
FROM (
  SELECT dues_eid, SUM(amount_cents)/100.0 AS amount, SUM(amount_cents) > 150 AS good
  FROM hcb_donations
  WHERE date > '2025-06-01' AND dues_eid IS NOT NULL
  GROUP BY dues_eid
) hds
LEFT JOIN ui_latest ui ON ui.eid = hds.dues_eid;`
  },
  {
    name: 'hcb_complete_summary',
    label: 'HCB Complete Donations + User Info',
    query: `-- 1) Aggregate HCB donations per dues_eid
WITH hds AS (
  SELECT
    dues_eid        AS eid,
    SUM(amount_cents) / 100.0 AS amount,
    SUM(amount_cents) > 150    AS good
  FROM hcb_donations
  WHERE dues_eid IS NOT NULL
  GROUP BY dues_eid
),
-- 2) Collect all distinct eids
all_eids AS (
  SELECT eid FROM ui_latest
  UNION
  SELECT eid FROM hds
)
-- 3) Combine everything
SELECT
  all_eids.eid,
  ui.firstname,
  ui.lastname,
  ui.major,
  COALESCE(hds.amount, 0) AS amount,
  COALESCE(hds.good,   0) AS good
FROM all_eids
LEFT JOIN ui_latest ui
  ON ui.eid = all_eids.eid
LEFT JOIN hds
  ON hds.eid = all_eids.eid;`
  },
  {
    name: 'attendance_count_by_event_date',
    label: 'Attendance Count by Event and Week',
    query: `SELECT event, strftime('%Y-%W', attendance_date) AS week, COUNT(*) AS attendance_count
FROM attendance_unique
GROUP BY event, week
ORDER BY event, week;`
  },
  {
    name: 'attendance_count_by_event_eid',
    label: 'Attendance Days by Event and EID',
    query: `SELECT event, eid, COUNT(attendance_date) AS unique_attendance_days
FROM attendance_unique
GROUP BY event, eid
ORDER BY event, eid;`
  }
];
