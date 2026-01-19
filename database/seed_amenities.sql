-- Seed amenities data
INSERT INTO amenities (name, icon, category) VALUES
  ('Swimming Pool', 'waves', 'Outdoor'),
  ('Home Gym', 'dumbbell', 'Indoor'),
  ('Central A/C', 'snowflake', 'Indoor'),
  ('High-speed WiFi', 'wifi', 'Technology'),
  ('Solar Panels', 'sun', 'Eco'),
  ('EV Charging', 'plug', 'Eco'),
  ('Smart Security', 'shield', 'Security'),
  ('Outdoor Deck', 'fence', 'Outdoor'),
  ('Fireplace', 'flame', 'Indoor'),
  ('Walk-in Closet', 'shirt', 'Indoor'),
  ('Chef Kitchen', 'chef-hat', 'Indoor'),
  ('Laundry Room', 'washing-machine', 'Indoor'),
  ('Garden', 'flower', 'Outdoor'),
  ('Parking Garage', 'car', 'Outdoor'),
  ('Balcony', 'door-open', 'Outdoor'),
  ('Pet Friendly', 'paw-print', 'Other'),
  ('Elevator', 'arrow-up-down', 'Building'),
  ('Concierge', 'bell', 'Building'),
  ('Rooftop Access', 'building', 'Building'),
  ('Storage Unit', 'archive', 'Building')
ON CONFLICT DO NOTHING;
