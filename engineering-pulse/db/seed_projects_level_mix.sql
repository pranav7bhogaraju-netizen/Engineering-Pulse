-- Run order: migration_add_project_level.sql  ->  seed_projects_all_domains.sql  ->  THIS FILE.
-- This (1) labels the 29 all-domains projects with a level, and
--      (2) adds 19 new projects so every domain has BOTH tiers.

-- ---------- (1) Classify the existing all-domains seed ----------
UPDATE projects SET level = 'collegiate' WHERE title IN (
  'SCARA Robot (3D Printed)', 'DIY Camera Slider with Pan & Tilt',
  'DIY Arduino Gimbal / Self-Stabilizing Platform', 'Arduino Mecanum Wheels Robot',
  'DIY Vending Machine', 'Simplest CNC Laser Engraver',
  'EMG Claw Neuroprosthetic', 'EMG-Controlled Prosthetic Hand (Cardboard)', '3D-Printed EMG Bionic Hand',
  'Build a Python Web Scraper', '25 Python Projects for Beginners', 'Data Structures via a Flask API',
  'Flask E-commerce Platform', 'Python + Flask Web App'
);
UPDATE projects SET level = 'fair' WHERE title IN (
  'The Right Bridge Design', 'Build the Best Paper Bridge', 'Water Filtration Column', 'Dam Design', 'The Dirty Water Project',
  'Make a Straw Rocket', 'Build and Launch a Foam Rocket', 'Stomp Rockets', 'Design and Launch Bottle Rockets', 'Rocket Payload Challenge',
  'Splitting Water', 'Water Desalination Plant', 'Turn Milk into Plastic', 'Grow the Largest Crystals', 'Biodegradable Plastics'
);

-- ---------- (2) New mixed-tier projects ----------
INSERT INTO projects (title, summary, difficulty, level, materials, instructions, source_url, source_name) VALUES

-- EE (fair)
('Build a Simple Electric Motor', 'Wind a coil and use magnets to build a spinning motor, then test how voltage affects its speed.', 'beginner', 'fair', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://www.sciencebuddies.org/science-fair-projects/project-ideas/Elec_p051/electricity-electronics/build-a-simple-electric-motor', 'Science Buddies'),
('Build a Reed Switch Motor', 'Build a simple reed-switch motor and test how supply voltage changes its speed.', 'beginner', 'fair', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://www.sciencebuddies.org/science-fair-projects/project-ideas/Elec_p057/electricity-electronics/build-a-reed-switch-motor', 'Science Buddies'),
('Efficient LED Circuit Design', 'Design an LED lighting circuit for maximum efficiency, choosing the right battery and resistors.', 'beginner', 'fair', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://www.sciencebuddies.org/science-fair-projects/project-ideas/Elec_p101/electricity-electronics/efficient-led-circuit-design', 'Science Buddies'),

-- Mechanical (fair)
('Rubber Band-Powered Car', 'Build a car powered by a wound rubber band and see how far it travels as you change the design.', 'beginner', 'fair', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://www.sciencebuddies.org/stem-activities/rubber-band-car', 'Science Buddies'),
('Popsicle Stick Catapult', 'Build a catapult from craft sticks and rubber bands and launch soft projectiles.', 'beginner', 'fair', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://www.sciencebuddies.org/stem-activities/popsicle-stick-catapult', 'Science Buddies'),

-- Biomedical (fair)
('Make Your Own Stethoscope', 'Build homemade stethoscopes from different tubing and test which design carries heart sounds best.', 'beginner', 'fair', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://www.sciencebuddies.org/science-fair-projects/project-ideas/HumBio_p033/human-biology-health/make-your-own-stethoscope', 'Science Buddies'),
('Build a Robot Hand', 'Build a working robotic hand from straws, string, and other household materials.', 'beginner', 'fair', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://www.sciencebuddies.org/stem-activities/build-a-robot-hand', 'Science Buddies'),
('Build a Helping Hand', 'Design and build a model prosthetic hand and iterate on it using the engineering design process.', 'beginner', 'fair', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://www.sciencebuddies.org/science-fair-projects/project-ideas/HumBio_p042/human-biology-health/build-prosthetic-hand', 'Science Buddies'),

-- CS (fair)
('Make a Game in Scratch', 'Build your first interactive game with Scratch''s drag-and-drop blocks — no typing required.', 'beginner', 'fair', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://www.create-learn.us/blog/how-to-create-a-game-on-scratch/', 'Create & Learn'),
('micro:bit Beginner Projects', 'Code the BBC micro:bit''s LED grid and sensors to build flashing hearts, dice, and simple games.', 'beginner', 'fair', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://www.create-learn.us/blog/microbit-introduction/', 'Create & Learn'),

-- Civil (collegiate)
('IoT Flood & Water-Level Alert System', 'Build a LoRaWAN water-level and flood-alert system with environmental sensors and cloud dashboards.', 'advanced', 'collegiate', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://www.hackster.io/migmonve/water-level-monitoring-and-flood-alert-system-cf73d2', 'Hackster.io'),
('Arduino Smart Traffic Light', 'Build an ultrasonic-sensing adaptive traffic light that responds to real vehicle presence.', 'intermediate', 'collegiate', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://www.hackster.io/daniel-ramsgard/arduino-smart-traffic-light-3825ad', 'Hackster.io'),
('IoT Flood Monitoring & Alerting', 'Build an Arduino flood monitor that senses water level and sends SMS/email alerts past set thresholds.', 'intermediate', 'collegiate', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://www.hackster.io/vaibhavshanbhag467/iot-based-flood-monitoring-and-alerting-system-e03cff', 'Hackster.io'),

-- Aerospace (collegiate)
('Arduino RC Airplane (100% DIY)', 'Build a Styrofoam RC airplane and a complete NRF24L01-based radio control system from scratch.', 'advanced', 'collegiate', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://howtomechatronics.com/projects/arduino-rc-airplane-diy/', 'HowToMechatronics'),
('DIY RC Hovercraft', 'Build a 3D-printed RC hovercraft with brushless lift and thrust motors, controlled wirelessly.', 'advanced', 'collegiate', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://howtomechatronics.com/projects/diy-arduino-based-rc-hovercraft/', 'HowToMechatronics'),

-- Chemical (collegiate)
('ESP32 Water Quality Analyzer', 'Build an ESP32 analyzer combining pH, conductivity, and turbidity sensors to assess water pollution.', 'intermediate', 'collegiate', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://www.hackster.io/lucasfernando/build-a-water-quality-analyzer-from-esp32-dd317a', 'Hackster.io'),
('Arduino Water Quality Monitoring System', 'Build a deployable monitor logging TDS, temperature, pH, and turbidity of a water body to an SD card.', 'intermediate', 'collegiate', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://www.instructables.com/Arduino-Water-Quality-Monitoring-System/', 'Instructables'),

-- Materials (collegiate)
('Digital Force Gauge & Load Cell Tester', 'Build a digital force gauge from a load cell and HX711 amp — the basis of a materials strength tester.', 'intermediate', 'collegiate', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://www.hackster.io/electropeak/digital-force-gauge-weight-scale-w-loadcell-arduino-7a7fd5', 'Hackster.io'),
('Arduino Load Cell Weighing Machine', 'Build a precise digital weighing machine with a strain-gauge load cell, HX711 amplifier, and Arduino.', 'intermediate', 'collegiate', 'See the linked source for the full build guide.', 'See the linked source for the full build guide.', 'https://www.hackster.io/electronicsworkshop111/make-weighing-machine-using-arduino-load-cell-hx711-module-974143', 'Hackster.io');

-- ---------- Domain tags for the 19 new projects ----------
INSERT INTO project_domains (project_id, domain_slug)
SELECT id, 'ee' FROM projects WHERE title IN ('Build a Simple Electric Motor', 'Build a Reed Switch Motor', 'Efficient LED Circuit Design');
INSERT INTO project_domains (project_id, domain_slug)
SELECT id, 'me' FROM projects WHERE title IN ('Rubber Band-Powered Car', 'Popsicle Stick Catapult');
INSERT INTO project_domains (project_id, domain_slug)
SELECT id, 'biomed' FROM projects WHERE title IN ('Make Your Own Stethoscope', 'Build a Robot Hand', 'Build a Helping Hand');
INSERT INTO project_domains (project_id, domain_slug)
SELECT id, 'cs' FROM projects WHERE title IN ('Make a Game in Scratch', 'micro:bit Beginner Projects');
INSERT INTO project_domains (project_id, domain_slug)
SELECT id, 'ce' FROM projects WHERE title IN ('IoT Flood & Water-Level Alert System', 'Arduino Smart Traffic Light', 'IoT Flood Monitoring & Alerting');
INSERT INTO project_domains (project_id, domain_slug)
SELECT id, 'aero' FROM projects WHERE title IN ('Arduino RC Airplane (100% DIY)', 'DIY RC Hovercraft');
INSERT INTO project_domains (project_id, domain_slug)
SELECT id, 'chem' FROM projects WHERE title IN ('ESP32 Water Quality Analyzer', 'Arduino Water Quality Monitoring System');
INSERT INTO project_domains (project_id, domain_slug)
SELECT id, 'materials' FROM projects WHERE title IN ('Digital Force Gauge & Load Cell Tester', 'Arduino Load Cell Weighing Machine');
-- structural load testing spans civil too:
INSERT INTO project_domains (project_id, domain_slug)
SELECT id, 'ce' FROM projects WHERE title = 'Digital Force Gauge & Load Cell Tester';
