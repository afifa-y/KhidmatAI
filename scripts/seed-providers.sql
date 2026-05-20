-- Run this in the Supabase SQL Editor AFTER running 'pnpm db:push'
-- It populates the providers and reviews tables with realistic mock data for Islamabad.

INSERT INTO "providers" ("name", "phone", "email", "category", "specialty", "locationText", "latitude", "longitude", "hourlyRate", "availabilityStatus", "isVerified", "yearsExperience", "totalJobsDone", "avatarUrl") VALUES
('Ahmed Electric Works', '0300-1234567', 'ahmed.elec@example.com', 'electrician', 'Excellent at fan installation, wiring repairs, and UPS setup. Specializes in residential work.', 'G-13, Islamabad', 33.6595, 73.0227, 800, 'available', true, 8, 340, 'https://i.pravatar.cc/150?u=ahmed'),
('Cool Tech AC Services', '0321-9876543', 'cooltech@example.com', 'ac_technician', 'Expert in split AC installation, gas refilling, and regular maintenance. Quick troubleshooting.', 'F-7, Islamabad', 33.7195, 73.0427, 1200, 'available', true, 5, 210, 'https://i.pravatar.cc/150?u=cooltech'),
('Bismillah Plumbing', '0333-5551234', 'plumbing@example.com', 'plumber', 'Specialist in fixing leakages, geyser repairs, and water motor installation.', 'G-9, Islamabad', 33.6995, 73.0627, 600, 'available', true, 12, 850, 'https://i.pravatar.cc/150?u=bismillah'),
('Tariq AC Master', '0345-4449999', 'tariq.ac@example.com', 'ac_technician', 'DC Inverter specialist. Fixes cooling issues quickly.', 'G-10, Islamabad', 33.6895, 73.0527, 1000, 'busy', true, 6, 120, 'https://i.pravatar.cc/150?u=tariq'),
('Zain Electricians', '0312-8887777', 'zain.elec@example.com', 'electrician', 'Main board wiring, 3-phase connections, and commercial electrical work.', 'Blue Area, Islamabad', 33.7215, 73.0627, 1500, 'available', true, 15, 900, 'https://i.pravatar.cc/150?u=zain'),
('Islamabad Home Fix', '0301-1112222', 'homefix@example.com', 'carpenter', 'Door lock repairs, custom wood polish, and furniture assembly.', 'F-10, Islamabad', 33.6995, 73.0127, 900, 'available', true, 4, 85, 'https://i.pravatar.cc/150?u=homefix'),
('Al-Madina Tutors', '0334-9998888', 'tutor@example.com', 'tutor', 'Maths and Physics tutoring for O/A levels.', 'G-11, Islamabad', 33.6795, 73.0427, 2000, 'available', false, 3, 50, 'https://i.pravatar.cc/150?u=almadina'),
('Nisa Beauty Salon (At Home)', '0322-3334444', 'nisa@example.com', 'beautician', 'Bridal makeup, party makeup, and hair styling at your doorstep.', 'DHA, Islamabad', 33.5271, 73.1062, 3000, 'available', true, 7, 300, 'https://i.pravatar.cc/150?u=nisa');

-- Insert reviews matching the providers above (assuming the IDs are 1 through 8 sequentially)
INSERT INTO "reviews" ("providerId", "reviewerName", "rating", "comment") VALUES
(1, 'Ali K.', 5, 'Fixed my fan in 30 mins! Very professional.'),
(1, 'Sara', 4, 'Good work but arrived 10 mins late.'),
(2, 'Kamran', 5, 'AC is freezing cold now. Highly recommended.'),
(2, 'Omer', 5, 'Very clean work during gas refill.'),
(3, 'Usman', 4, 'Fixed the geyser leak quickly.'),
(3, 'Zahra', 5, 'Polite and efficient plumber.'),
(4, 'Bilal', 3, 'He was busy so had to wait 2 hours, but work was good.'),
(5, 'Company X', 5, 'Did the entire office wiring perfectly.'),
(6, 'Ayesha', 4, 'Fixed my wardrobe door neatly.'),
(7, 'Student', 5, 'Helped me get an A in Physics!'),
(8, 'Fatima', 5, 'Amazing makeup and very punctual.');
