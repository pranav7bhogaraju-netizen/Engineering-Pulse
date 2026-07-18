-- Resources feature: curated links, multi-domain tagging, upvotes, saves

CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('course', 'video', 'reference', 'tool', 'database')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE resource_domains (
    resource_id INT REFERENCES resources(id) ON DELETE CASCADE,
    domain_slug TEXT REFERENCES domains(slug),
    PRIMARY KEY (resource_id, domain_slug)
);

CREATE TABLE resource_votes (
    resource_id INT REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (resource_id, user_id)
);

CREATE TABLE saved_resources (
    resource_id INT REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (resource_id, user_id)
);

CREATE INDEX idx_resource_domains_domain ON resource_domains(domain_slug);

-- Seed data — every URL below was verified via web search before inclusion
-- (confirmed live and correct as of the search, not guessed).

INSERT INTO resources (title, url, description, resource_type) VALUES
    ('MIT 6.002 — Circuits and Electronics', 'https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/', 'Full MIT course: lumped circuit abstraction, circuit analysis, amplifiers, diodes. Lecture videos, notes, problem sets.', 'course'),
    ('Khan Academy — Electrical Engineering', 'https://www.khanacademy.org/science/electrical-engineering', 'Free video course covering circuit analysis fundamentals from the ground up.', 'course'),
    ('All About Circuits', 'https://www.allaboutcircuits.com/', 'Huge free reference library and community covering analog, digital, and power electronics.', 'reference'),
    ('MIT OpenCourseWare — Mechanical Engineering', 'https://ocw.mit.edu/courses/mechanical-engineering/', 'Full catalog of MIT''s free mechanical engineering course materials.', 'course'),
    ('MIT 1.050 — Engineering Mechanics I', 'https://ocw.mit.edu/courses/1-050-engineering-mechanics-i-fall-2007/', 'Introduction to mechanics of materials and structures for civil/mechanical engineers.', 'course'),
    ('MIT OpenCourseWare — Civil and Environmental Engineering', 'https://ocw.mit.edu/courses/civil-and-environmental-engineering', 'Full catalog of MIT''s free civil and environmental engineering course materials.', 'course'),
    ('NASA Technical Reports Server (NTRS)', 'https://ntrs.nasa.gov/', 'Free access to 500,000+ aerospace research reports, papers, and historical NACA documents.', 'database'),
    ('MIT OpenCourseWare — Aeronautics and Astronautics', 'https://ocw.mit.edu/courses/aeronautics-and-astronautics/', 'Full catalog of MIT''s free aerospace engineering course materials.', 'course'),
    ('NIST Chemistry WebBook', 'https://webbook.nist.gov/', 'Free thermochemical, thermophysical, and spectral data for thousands of compounds.', 'database'),
    ('Khan Academy — Chemistry', 'https://www.khanacademy.org/science/chemistry', 'Free video course covering general and physical chemistry fundamentals.', 'course'),
    ('MIT 3.012 — Fundamentals of Materials Science', 'https://ocw.mit.edu/courses/3-012-fundamentals-of-materials-science-fall-2005/', 'Thermodynamics, bonding, and structure of materials — a core MIT materials science course.', 'course'),
    ('MatWeb', 'https://www.matweb.com/', 'Searchable database of material properties for metals, polymers, ceramics, and composites.', 'database'),
    ('MIT 20.010J — Introduction to Bioengineering', 'https://ocw.mit.edu/courses/20-010j-introduction-to-bioengineering-be-010j-spring-2006/', 'Introductory bioengineering course covering core biomedical engineering concepts.', 'course'),
    ('PubMed Central', 'https://www.ncbi.nlm.nih.gov/pmc/', 'Free full-text archive of biomedical and life sciences research literature, run by the NIH.', 'database'),
    ('MIT OpenCourseWare — EECS', 'https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/', 'Full catalog of MIT''s free electrical engineering and computer science course materials.', 'course'),
    ('CS50', 'https://cs50.harvard.edu/', 'Harvard''s free, famous introduction to computer science, available online via edX.', 'course'),
    ('Big-O Cheat Sheet', 'https://www.bigocheatsheet.com/', 'Quick-reference chart of time/space complexity for common algorithms and data structures.', 'reference'),
    ('Paul''s Online Math Notes — Cheat Sheets & Tables', 'https://tutorial.math.lamar.edu/cheat_table.aspx', 'Printable cheat sheets for Calculus I/II/III, Differential Equations, and Algebra — a staple for engineering students.', 'reference'),
    ('Engineering ToolBox', 'https://www.engineeringtoolbox.com/', 'Thousands of free reference pages covering mechanics, thermodynamics, fluid mechanics, and materials.', 'reference'),
    ('Engineer''s Edge', 'https://www.engineersedge.com/', 'Free design data, GD&T references, and calculators for fasteners, welding, springs, and beams.', 'reference');

-- Tag each resource with the domain(s) it applies to (multi-domain overlap allowed by design)
INSERT INTO resource_domains (resource_id, domain_slug)
SELECT id, 'ee' FROM resources WHERE title LIKE 'MIT 6.002%' OR title LIKE 'Khan Academy — Electrical%' OR title = 'All About Circuits'
UNION ALL
SELECT id, 'me' FROM resources WHERE title LIKE 'MIT OpenCourseWare — Mechanical%' OR title LIKE 'MIT 1.050%'
UNION ALL
SELECT id, 'ce' FROM resources WHERE title LIKE 'MIT 1.050%' OR title LIKE 'MIT OpenCourseWare — Civil%'
UNION ALL
SELECT id, 'aero' FROM resources WHERE title LIKE 'NASA Technical%' OR title LIKE 'MIT OpenCourseWare — Aeronautics%'
UNION ALL
SELECT id, 'chem' FROM resources WHERE title LIKE 'NIST Chemistry%' OR title LIKE 'Khan Academy — Chemistry%'
UNION ALL
SELECT id, 'materials' FROM resources WHERE title LIKE 'MIT 3.012%' OR title = 'MatWeb'
UNION ALL
SELECT id, 'biomed' FROM resources WHERE title LIKE 'MIT 20.010J%' OR title = 'PubMed Central'
UNION ALL
SELECT id, 'cs' FROM resources WHERE title LIKE 'MIT OpenCourseWare — EECS' OR title = 'CS50' OR title = 'Big-O Cheat Sheet'
UNION ALL
-- Cross-cutting reference resources, tagged across the domains they genuinely serve
SELECT id, domain FROM resources, unnest(ARRAY['ee','me','ce','aero','chem','materials']) AS domain
    WHERE title LIKE 'Paul''s Online Math Notes%'
UNION ALL
SELECT id, domain FROM resources, unnest(ARRAY['me','ce','chem','materials']) AS domain
    WHERE title = 'Engineering ToolBox'
UNION ALL
SELECT id, domain FROM resources, unnest(ARRAY['me','ce']) AS domain
    WHERE title = 'Engineer''s Edge';
