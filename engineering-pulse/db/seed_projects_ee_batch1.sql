-- First batch: Electrical & Computer (EE/CS). Based on verified,
-- established sources — HowToMechatronics (run by a credentialed
-- mechatronics engineer, detailed circuit diagrams + code for every
-- project). Materials lists and instructions below are written/summarized
-- by us from the verified source content; exact wiring diagrams and full
-- code files live at the linked source.

INSERT INTO projects (title, summary, difficulty, materials, instructions, source_url, source_name) VALUES

('Ultrasonic Radar Scanner', 'Build a rotating radar that detects objects and maps them on your computer screen in real time.', 'beginner',
'- 1x Arduino Uno (or compatible)
- 1x HC-SR04 ultrasonic distance sensor
- 1x SG90 micro servo motor
- Breadboard and jumper wires
- USB cable for Arduino-to-PC connection
- Free "Processing" IDE installed on your computer (for the visual display)',
'1. Mount the HC-SR04 sensor on top of the servo motor horn so the sensor rotates with the servo.
2. Wire the HC-SR04: VCC to 5V, GND to GND, Trig to a digital pin, Echo to another digital pin.
3. Wire the servo: signal wire to a PWM-capable digital pin, power and ground to the Arduino''s 5V/GND.
4. Upload the Arduino sketch (available at the source link) that sweeps the servo 0-180 degrees while taking a distance reading at each angle, then sends angle+distance pairs over serial to the computer.
5. Install and open Processing (free, from processing.org), then run the companion Processing sketch (also at the source link) — this draws a rotating radar-style sweep on your screen, plotting a dot wherever an object is detected.
6. Adjust the detection range in the code (default up to ~4 meters) and test by waving objects in front of the sensor at different angles.',
'https://howtomechatronics.com/projects/arduino-radar-project/', 'HowToMechatronics'),

('DIY Wireless RC Transmitter', 'Build your own 14-channel radio transmitter for controlling any Arduino-based project wirelessly, up to 700m range.', 'intermediate',
'- 1x Arduino Pro Mini (smallest Arduino board)
- 1x NRF24L01 wireless transceiver module
- 2x analog joysticks (with built-in push-button, X/Y axis)
- 2x potentiometers
- 4x momentary push buttons
- 1x MPU6050 accelerometer/gyroscope module (optional, for tilt control)
- Custom or generic PCB / perfboard for mounting
- Enclosure material (acrylic or 3D printed case)
- Battery (e.g. 9V or Li-ion pack) and appropriate wiring',
'1. Lay out and wire the two joysticks, two potentiometers, and four push buttons to the Arduino Pro Mini''s analog and digital input pins.
2. Wire the NRF24L01 module to the SPI pins (MOSI, MISO, SCK, CSN, CE) plus 3.3V power and ground — this module is sensitive to voltage, so do not power it from 5V.
3. If using the MPU6050 for tilt-based control, wire it via I2C (SDA/SCL) alongside the other components.
4. Upload the transmitter code (at the source link), which reads all inputs and packages them into a data structure sent over the NRF24L01 radio link.
5. Mount all components onto a PCB or perfboard, then house everything in an enclosure with the joysticks and buttons accessible.
6. Pair this with a matching receiver project (also documented at the source) on your target robot/vehicle to complete the wireless control link.',
'https://howtomechatronics.com/projects/diy-arduino-rc-transmitter/', 'HowToMechatronics'),

('Arduino Robot Car with Joystick Control', 'Build a two-motor robot car from scratch and learn H-Bridge motor control along the way.', 'intermediate',
'- 1x Arduino Uno
- 1x L298N dual H-Bridge motor driver module
- 2x 12V DC gear motors with wheels
- 1x analog joystick module
- 1x robot chassis (or DIY frame)
- 1x caster wheel (for a 3-wheel stable base)
- Li-ion battery pack (appropriately rated for your motors)
- Jumper wires and mounting hardware',
'1. Assemble the chassis with the two DC motors and wheels on either side, plus a caster wheel for balance.
2. Wire both motors to the L298N driver''s output terminals (OUT1-OUT4).
3. Wire the L298N''s control pins (IN1-IN4 and the two ENA/ENB PWM pins) to Arduino digital pins.
4. Connect the joystick module''s X and Y analog outputs to two Arduino analog input pins, and power/ground as usual.
5. Upload the control sketch (at the source link), which reads the joystick position and converts it into differential PWM signals for each motor — pushing forward drives both motors forward, pushing left slows/reverses the left motor for a turn, and so on.
6. Power the whole system from the battery pack (motors typically need more current than the Arduino''s onboard regulator can supply, so the L298N is usually powered directly from the battery, with a separate 5V feed to the Arduino).
7. Test on the ground with the joystick, and tune the PWM speed values in code if turns feel too sharp or too slow.',
'https://howtomechatronics.com/tutorials/arduino/arduino-dc-motor-control-tutorial-l298n-pwm-h-bridge/', 'HowToMechatronics'),

('Color-Sorting Machine', 'Build a machine that automatically detects and sorts objects by color — the same working principle used in real industrial sorting lines.', 'intermediate',
'- 1x Arduino Uno
- 1x TCS230/TCS3200 color sensor module
- 1-2x servo motors (for the sorting gate/chute mechanism)
- Small items to sort (e.g. colored candy or beads)
- A feeder mechanism (gravity chute or small conveyor — can be 3D printed or built from cardboard/wood for a first version)
- Breadboard and jumper wires',
'1. Wire the TCS230/TCS3200 sensor to the Arduino: power, ground, and its four digital output/control pins (S0-S3 for frequency scaling, OUT for the sensor reading).
2. Position the sensor directly above or beside the point where objects pass single-file through your feeder mechanism, close enough for accurate color reads.
3. Upload the calibration/reading sketch (at the source link) and test it first with the Serial Monitor open — confirm the sensor returns distinguishably different RGB values for each color you want to sort.
4. Mount a servo-controlled gate or flap at the end of the feeder, positioned to direct items into different bins depending on which way it swings.
5. Upload the full sorting sketch, which reads each item''s color as it passes the sensor, compares it against your calibrated thresholds, then moves the servo gate to route it to the correct bin.
6. Fine-tune the color thresholds in code — lighting conditions significantly affect readings, so calibrate in the same lighting you''ll actually use the machine in.',
'https://howtomechatronics.com/projects/arduino-color-sorter-project/', 'HowToMechatronics'),

('RFID-Based Door Lock System', 'Build an access-control system that unlocks a door only for authorized RFID cards or key fobs.', 'intermediate',
'- 1x Arduino Uno
- 1x MFRC522 RFID reader module
- MIFARE-compatible RFID cards/key fobs (usually included with the reader)
- 1x 5V relay module (to control the actual lock mechanism)
- 1x electric door strike or solenoid lock (rated for your relay)
- 1x servo motor (alternative to a relay/solenoid, for a simpler demo lock)
- Jumper wires and breadboard',
'1. Wire the MFRC522 reader to the Arduino via SPI (SDA, SCK, MOSI, MISO, RST pins) plus 3.3V power and ground — this module runs on 3.3V, not 5V.
2. Upload the card-reading sketch (at the source link) first, and use the Serial Monitor to scan each authorized card/fob and record its unique ID number.
3. Add each authorized card''s ID into an array in the main access-control sketch.
4. Wire the relay module to a digital output pin, and connect the electric door strike/solenoid to the relay''s switched output (following the relay module''s voltage/current rating for your specific lock hardware).
5. Upload the full access-control sketch — when a card is scanned, it checks the ID against your authorized list, and if it matches, energizes the relay for a few seconds to unlock, then re-locks automatically.
6. For a safer first test without wiring real door hardware, substitute a servo motor that visibly rotates to an "unlocked" position instead of driving a relay.',
'https://howtomechatronics.com/tutorials/arduino/rfid-works-make-arduino-based-rfid-door-lock/', 'HowToMechatronics');

-- Tag each project with its domain(s)
INSERT INTO project_domains (project_id, domain_slug)
SELECT id, 'ee' FROM projects WHERE title IN (
    'Ultrasonic Radar Scanner',
    'DIY Wireless RC Transmitter',
    'Arduino Robot Car with Joystick Control',
    'Color-Sorting Machine',
    'RFID-Based Door Lock System'
)
UNION ALL
SELECT id, 'cs' FROM projects WHERE title IN (
    'Ultrasonic Radar Scanner',
    'DIY Wireless RC Transmitter',
    'Arduino Robot Car with Joystick Control',
    'Color-Sorting Machine',
    'RFID-Based Door Lock System'
);
