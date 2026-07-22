-- Projects seed — all remaining domains (Mechanical, Civil, Aerospace,
-- Chemical, Materials, Biomedical, CS). Aggregation model: each project
-- links out to a verified, live source guide. Every source_url below was
-- confirmed via web search/fetch before inclusion (real, live, on-topic).
--
-- The materials/instructions columns are NOT NULL in the schema but are no
-- longer displayed (cards link straight to the source), so they carry a
-- short pointer string rather than a full write-up.

INSERT INTO projects (title, summary, difficulty, materials, instructions, source_url, source_name) VALUES

-- ===== MECHANICAL (HowToMechatronics) =====
('SCARA Robot (3D Printed)',
 'A 3D-printed selective-compliance robot arm driven by four stepper motors and a CNC shield, with a custom control GUI.',
 'advanced',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://howtomechatronics.com/projects/scara-robot-how-to-build-your-own-arduino-based-robot/', 'HowToMechatronics'),

('DIY Camera Slider with Pan & Tilt',
 'A motorized three-axis camera slider with pan and tilt, using NEMA 17 steppers and joystick control for cinematic shots.',
 'advanced',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://howtomechatronics.com/tutorials/arduino/diy-motorized-camera-slider-pan-tilt-head-project/', 'HowToMechatronics'),

('DIY Arduino Gimbal / Self-Stabilizing Platform',
 'A two-axis self-stabilizing platform that keeps its top level using an MPU6050 sensor and two servos.',
 'intermediate',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://howtomechatronics.com/projects/diy-arduino-gimbal-self-stabilizing-platform/', 'HowToMechatronics'),

('Arduino Mecanum Wheels Robot',
 'A four-wheel robot with omnidirectional mecanum wheels that can move in any direction, controlled wirelessly.',
 'advanced',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://howtomechatronics.com/projects/arduino-mecanum-wheels-robot/', 'HowToMechatronics'),

('DIY Vending Machine',
 'A working coin-operated vending machine built from MDF, with stepper-driven carriers and infrared coin detection.',
 'advanced',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://howtomechatronics.com/projects/diy-vending-machine-arduino-based-mechatronics-project/', 'HowToMechatronics'),

('Simplest CNC Laser Engraver',
 'A minimal two-axis CNC laser engraver built from MDF and just two linear rails, driven by an Arduino and CNC shield.',
 'intermediate',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://howtomechatronics.com/projects/simplest-cnc-machine-with-minimum-parts-possible-diy-laser-engraver/', 'HowToMechatronics'),

-- ===== CIVIL (Science Buddies, TeachEngineering) =====
('The Right Bridge Design',
 'Design and build model bridges from popsicle sticks or straws, then load-test them to see which geometry carries the most weight.',
 'beginner',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.sciencebuddies.org/science-fair-projects/project-ideas/CE_p024/civil-engineering/avoiding-disaster-the-right-bridge-design', 'Science Buddies'),

('Build the Best Paper Bridge',
 'Fold and shape paper into bridges of different designs and test how much weight each can hold before it collapses.',
 'beginner',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.sciencebuddies.org/stem-activities/build-best-bridge', 'Science Buddies'),

('Water Filtration Column',
 'Build and test a multi-layer water filter to see how effectively it removes color and particles from dirty water.',
 'intermediate',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.sciencebuddies.org/science-fair-projects/project-ideas/EnvEng_p030/environmental-engineering/how-filtering-can-clean-water', 'Science Buddies'),

('Dam Design',
 'Build a small dam and explore how the potential energy of stored water can be turned into hydroelectric power.',
 'beginner',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.sciencebuddies.org/stem-activities/dam-design', 'Science Buddies'),

('The Dirty Water Project',
 'Design, build, and test your own water-treatment filters from everyday materials to clean up a polluted water sample.',
 'beginner',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.teachengineering.org/activities/view/cub_environ_lesson06_activity2', 'TeachEngineering'),

-- ===== AEROSPACE (NASA JPL, Science Buddies) =====
('Make a Straw Rocket',
 'Build a paper rocket launched from a soda straw, then tweak the design to make it fly farther.',
 'beginner',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.jpl.nasa.gov/edu/resources/project/make-a-straw-rocket/', 'NASA JPL'),

('Build and Launch a Foam Rocket',
 'Construct a foam rocket and investigate how launch angle affects its range in a controlled experiment.',
 'beginner',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.jpl.nasa.gov/edu/resources/lesson-plan/build-and-launch-a-foam-rocket/', 'NASA JPL'),

('Stomp Rockets',
 'Build a stomp-powered rocket and launcher from PVC and paper, then track how high it flies.',
 'beginner',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.jpl.nasa.gov/edu/resources/lesson-plan/stomp-rockets/', 'NASA JPL'),

('Design and Launch Bottle Rockets',
 'Build a water-and-air bottle rocket with fins, a nose cone, and a parachute, and see how each part changes its flight.',
 'beginner',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.sciencebuddies.org/stem-activities/bottle-rocket-design', 'Science Buddies'),

('Rocket Payload Challenge',
 'Design a bottle rocket with a payload bay and test how high it can carry a load using Newton''s third law.',
 'intermediate',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.sciencebuddies.org/science-fair-projects/project-ideas/Phys_p098/physics/rocket-how-high-can-you-send-a-payload', 'Science Buddies'),

-- ===== CHEMICAL (Science Buddies, TeachEngineering) — some cross-tagged with Materials =====
('Splitting Water',
 'Use electrolysis to split water into hydrogen and oxygen and explore the basics of electrochemistry.',
 'beginner',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.sciencebuddies.org/stem-activities/splitting-water', 'Science Buddies'),

('Water Desalination Plant',
 'Design, build, and test a small thermal desalination plant that removes salt from seawater.',
 'intermediate',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.teachengineering.org/activities/view/cub_desal_lesson01_activity2', 'TeachEngineering'),

('Turn Milk into Plastic',
 'Turn hot milk and vinegar into moldable casein plastic and explore polymers and chemical reactions.',
 'beginner',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.sciencebuddies.org/science-fair-projects/project-ideas/Chem_p101/chemistry/turn-milk-into-plastic', 'Science Buddies'),

('Grow the Largest Crystals',
 'Grow large, pure crystals from solution and learn how temperature affects crystal size through recrystallization.',
 'beginner',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.sciencebuddies.org/science-fair-projects/project-ideas/Chem_p082/chemistry/how-to-grow-the-best-and-the-largest-crystals', 'Science Buddies'),

-- ===== MATERIALS (Science Buddies) — cross-tagged with Chemical =====
('Biodegradable Plastics',
 'Make and test biodegradable plastics from natural ingredients and investigate how polymer type affects how they break down.',
 'intermediate',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.sciencebuddies.org/science-fair-projects/project-ideas/MatlSci_p034/materials-science/biodegradable-plastics', 'Science Buddies'),

-- ===== BIOMEDICAL (Backyard Brains, Hackster, Arduino) =====
('EMG Claw Neuroprosthetic',
 'Build a mechanical claw and control it in real time with the electrical (EMG) signals from your own forearm muscles.',
 'intermediate',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://backyardbrains.com/pages/experiment-control-a-claw-neuroprosthetic', 'Backyard Brains'),

('EMG-Controlled Prosthetic Hand (Cardboard)',
 'Build a cardboard prosthetic hand driven by an Arduino EMG shield that responds to your muscle contractions.',
 'intermediate',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.hackster.io/upsidedownlabs/controlling-prosthetic-hand-cardboard-using-emg-sensor-66b35e', 'Hackster.io'),

('3D-Printed EMG Bionic Hand',
 'Build a low-cost, open-source 3D-printed bionic hand with myoelectric control based on the InMoov design.',
 'advanced',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://blog.arduino.cc/2022/11/25/designing-a-3d-printed-emg-bionic-hand-as-a-low-cost-alternative-to-prosthetic-limbs/', 'Arduino Blog'),

-- ===== COMPUTER SCIENCE (freeCodeCamp) =====
('Build a Python Web Scraper',
 'Build a web scraper with BeautifulSoup and Selenium to extract data from any website and save it as JSON or CSV.',
 'beginner',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.freecodecamp.org/news/how-to-scrape-websites-with-python-2/', 'freeCodeCamp'),

('25 Python Projects for Beginners',
 'A curated set of beginner Python builds — from a multiplayer game and weather app to a Discord bot — each with a full tutorial.',
 'beginner',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.freecodecamp.org/news/python-projects-for-beginners/', 'freeCodeCamp'),

('Data Structures via a Flask API',
 'Learn core data structures by building a real REST API with Python and Flask backed by a database.',
 'intermediate',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.freecodecamp.org/news/learn-data-structures-flask-api-python/', 'freeCodeCamp'),

('Flask E-commerce Platform',
 'Build a full e-commerce web app in Flask, complete with its own user authentication system.',
 'intermediate',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.freecodecamp.org/news/learn-the-flask-python-web-framework-by-building-a-market-platform/', 'freeCodeCamp'),

('Python + Flask Web App',
 'An in-depth walkthrough of building a web application backend from scratch using Python and Flask.',
 'intermediate',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'Full build guide, materials list, and step-by-step instructions are available at the linked source.',
 'https://www.freecodecamp.org/news/how-to-use-python-and-flask-to-build-a-web-app-an-in-depth-tutorial-437dbfe9f1c6/', 'freeCodeCamp');

-- ---------- Domain tagging (multi-domain where a project genuinely spans domains) ----------

-- Mechanical
INSERT INTO project_domains (project_id, domain_slug)
SELECT id, 'me' FROM projects WHERE title IN (
  'SCARA Robot (3D Printed)',
  'DIY Camera Slider with Pan & Tilt',
  'DIY Arduino Gimbal / Self-Stabilizing Platform',
  'Arduino Mecanum Wheels Robot',
  'DIY Vending Machine',
  'Simplest CNC Laser Engraver'
);

-- Civil
INSERT INTO project_domains (project_id, domain_slug)
SELECT id, 'ce' FROM projects WHERE title IN (
  'The Right Bridge Design',
  'Build the Best Paper Bridge',
  'Water Filtration Column',
  'Dam Design',
  'The Dirty Water Project'
);

-- Aerospace
INSERT INTO project_domains (project_id, domain_slug)
SELECT id, 'aero' FROM projects WHERE title IN (
  'Make a Straw Rocket',
  'Build and Launch a Foam Rocket',
  'Stomp Rockets',
  'Design and Launch Bottle Rockets',
  'Rocket Payload Challenge'
);

-- Chemical
INSERT INTO project_domains (project_id, domain_slug)
SELECT id, 'chem' FROM projects WHERE title IN (
  'Splitting Water',
  'Water Desalination Plant',
  'Turn Milk into Plastic',
  'Grow the Largest Crystals',
  'Biodegradable Plastics'
);

-- Materials (cross-tag the polymer/crystal projects so the Materials filter is well populated)
INSERT INTO project_domains (project_id, domain_slug)
SELECT id, 'materials' FROM projects WHERE title IN (
  'Turn Milk into Plastic',
  'Grow the Largest Crystals',
  'Biodegradable Plastics'
);

-- Biomedical
INSERT INTO project_domains (project_id, domain_slug)
SELECT id, 'biomed' FROM projects WHERE title IN (
  'EMG Claw Neuroprosthetic',
  'EMG-Controlled Prosthetic Hand (Cardboard)',
  '3D-Printed EMG Bionic Hand'
);

-- Computer Science
INSERT INTO project_domains (project_id, domain_slug)
SELECT id, 'cs' FROM projects WHERE title IN (
  'Build a Python Web Scraper',
  '25 Python Projects for Beginners',
  'Data Structures via a Flask API',
  'Flask E-commerce Platform',
  'Python + Flask Web App'
);
