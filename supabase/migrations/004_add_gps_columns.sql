-- Add GPS coordinate columns to time_entries for clock-in/out location verification
ALTER TABLE time_entries
  ADD COLUMN clock_in_lat DOUBLE PRECISION,
  ADD COLUMN clock_in_lng DOUBLE PRECISION,
  ADD COLUMN clock_out_lat DOUBLE PRECISION,
  ADD COLUMN clock_out_lng DOUBLE PRECISION,
  ADD COLUMN clock_in_accuracy DOUBLE PRECISION,
  ADD COLUMN clock_out_accuracy DOUBLE PRECISION;
