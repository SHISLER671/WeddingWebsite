-- Create some sample seating assignments for testing
INSERT INTO seating_assignments (guest_name, guest_email, table_name, seat_number, position_x, position_y) VALUES
('Douglas', 'doug@pretend.com', 'Table 1', 'Seat A1', 25, 30),
('Bernadette Shisler', 'bmprshisler@gmail.com', 'Table 2', 'Seat B3', 75, 45),
('John Smith', 'john@example.com', 'Table 3', 'Seat C2', 50, 60),
('Jane Doe', 'jane@example.com', 'Table 1', 'Seat A2', 30, 30),
('Test Guest', 'test@wedding.com', 'Table 4', 'Seat D1', 40, 75)
ON CONFLICT (guest_email) DO UPDATE SET
  guest_name = EXCLUDED.guest_name,
  table_name = EXCLUDED.table_name,
  seat_number = EXCLUDED.seat_number,
  position_x = EXCLUDED.position_x,
  position_y = EXCLUDED.position_y;
