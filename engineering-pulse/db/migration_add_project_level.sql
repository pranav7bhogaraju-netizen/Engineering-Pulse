-- Adds a two-tier "level" to projects so each build is clearly labeled as
-- Fair-Level (school / science-fair) or Collegiate (university / advanced).
-- This is separate from difficulty (beginner/intermediate/advanced).

ALTER TABLE projects ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('fair', 'collegiate'));

-- Classify the projects already live (the first Electrical & Computer batch,
-- HowToMechatronics Arduino builds) — all Collegiate.
UPDATE projects SET level = 'collegiate' WHERE title IN (
  'Ultrasonic Radar Scanner',
  'DIY Wireless RC Transmitter',
  'Arduino Robot Car with Joystick Control',
  'Color-Sorting Machine',
  'RFID-Based Door Lock System'
);
