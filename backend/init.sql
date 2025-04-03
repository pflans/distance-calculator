DROP TABLE IF EXISTS distance_queries;

CREATE TABLE distance_queries (
    id SERIAL PRIMARY KEY,
    source_address TEXT NOT NULL,
    destination_address TEXT NOT NULL,
    distance_miles DECIMAL,
    distance_kilometers DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Test data
INSERT INTO distance_queries 
(source_address, destination_address, distance_miles, distance_kilometers, created_at) 
VALUES
('123 Main St, New York, NY', '456 Park Ave, Boston, MA', 215.6, 347.0, NOW() - INTERVAL '2 days'),
('789 Beach Rd, Miami, FL', '321 Ocean Dr, Key West, FL', 125.8, 202.5, NOW() - INTERVAL '1 day'),
('555 Market St, San Francisco, CA', '777 Hollywood Blvd, Los Angeles, CA', 383.1, 616.5, NOW() - INTERVAL '12 hours'),
('42 Bourbon St, New Orleans, LA', '100 Broadway St, Nashville, TN', 471.2, 758.3, NOW() - INTERVAL '6 hours'),
('1600 Pennsylvania Ave, Washington, DC', '350 Fifth Ave, New York, NY', 225.3, 362.6, NOW() - INTERVAL '1 hour'); 