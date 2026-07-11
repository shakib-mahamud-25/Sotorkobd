-- ============================================================================
-- SOTORKO SEED DATA
-- Run this AFTER schema.sql. Creates ~25 realistic seed reports across Dhaka
-- so the map isn't empty at launch. All rows are tagged is_seed = true, so
-- they auto-purge per-area once real reports cross the threshold (see
-- maybe_purge_seed_data() in schema.sql).
--
-- edit_code_hash is set to a fixed placeholder since seed reports can't be
-- edited by any real user (there's no one holding the code).
-- ============================================================================

insert into reports (
  latitude, longitude, area_name, location_precision, category_id,
  description, severity, time_of_day, incident_date, police_contacted,
  status, is_seed, edit_code_hash
) values
  (23.8069, 90.3687, 'Mirpur 10', 'approximate', 'catcalling', 'Group of men commented loudly near the bus stop during evening rush.', 2, 'evening', '2026-05-12', false, 'published', true, 'seed'),
  (23.8103, 90.3654, 'Mirpur 2', 'approximate', 'following_stalking', 'A man on a motorbike followed slowly for several blocks after leaving work.', 4, 'night', '2026-05-20', false, 'published', true, 'seed'),
  (23.7461, 90.3742, 'Dhanmondi 27', 'approximate', 'poor_lighting', 'Street near the lake has no working lights after 8pm.', 2, 'night', '2026-04-30', false, 'published', true, 'seed'),
  (23.7509, 90.3797, 'Dhanmondi 32', 'approximate', 'verbal_harassment', 'Passing comments from a group outside a tea stall.', 2, 'evening', '2026-05-02', false, 'published', true, 'seed'),
  (23.7925, 90.4078, 'Gulshan 1', 'approximate', 'unwanted_photography', 'Someone took photos without consent near the circle.', 3, 'afternoon', '2026-05-15', false, 'published', true, 'seed'),
  (23.7808, 90.4147, 'Gulshan 2', 'approximate', 'unsafe_transport', 'Rickshaw puller took a longer isolated route despite being told the direct way.', 3, 'night', '2026-05-08', false, 'published', true, 'seed'),
  (23.7325, 90.3960, 'New Market', 'approximate', 'groping_physical', 'Crowded market area, unwanted physical contact while browsing shops.', 4, 'afternoon', '2026-05-18', true, 'published', true, 'seed'),
  (23.7271, 90.4128, 'Jatrabari', 'approximate', 'assault', 'Physical altercation after refusing to give a phone number.', 5, 'night', '2026-04-25', true, 'published', true, 'seed'),
  (23.8759, 90.3795, 'Uttara Sector 7', 'approximate', 'poor_lighting', 'Residential lane behind the market is unlit and quiet at night.', 2, 'night', '2026-05-10', false, 'published', true, 'seed'),
  (23.8698, 90.3987, 'Uttara Sector 4', 'approximate', 'following_stalking', 'Someone followed on foot from the metro station exit.', 3, 'evening', '2026-05-22', false, 'published', true, 'seed'),
  (23.7104, 90.4074, 'Motijheel', 'approximate', 'catcalling', 'Comments shouted from a shop near the main crossing.', 2, 'afternoon', '2026-05-01', false, 'published', true, 'seed'),
  (23.7590, 90.3670, 'Farmgate', 'approximate', 'unsafe_transport', 'Bus conductor made inappropriate comments during a crowded ride.', 3, 'morning', '2026-05-14', false, 'published', true, 'seed'),
  (23.7654, 90.3889, 'Karwan Bazar', 'approximate', 'groping_physical', 'Crowded footover bridge, unwanted contact during rush hour.', 4, 'evening', '2026-05-19', false, 'published', true, 'seed'),
  (23.7461, 90.3897, 'Panthapath', 'approximate', 'verbal_harassment', 'Group loitering outside a restaurant made repeated comments.', 2, 'night', '2026-05-06', false, 'published', true, 'seed'),
  (23.7937, 90.3629, 'Mohammadpur', 'approximate', 'poor_lighting', 'Alley near the bus stand has no streetlights.', 2, 'night', '2026-04-28', false, 'published', true, 'seed'),
  (23.7806, 90.3573, 'Shyamoli', 'approximate', 'following_stalking', 'A stranger followed closely on foot for about ten minutes.', 3, 'evening', '2026-05-11', false, 'published', true, 'seed'),
  (23.7275, 90.4128, 'Sayedabad', 'approximate', 'unsafe_transport', 'Bus terminal area felt unsafe waiting alone after dark.', 3, 'night', '2026-05-03', false, 'published', true, 'seed'),
  (23.8433, 90.3782, 'Mirpur 1', 'approximate', 'indecent_exposure', 'Incident near the market entrance in the evening.', 4, 'evening', '2026-05-16', true, 'published', true, 'seed'),
  (23.7104, 90.3859, 'Lalbagh', 'approximate', 'poor_lighting', 'Narrow street near the fort has minimal lighting at night.', 2, 'night', '2026-04-22', false, 'published', true, 'seed'),
  (23.7383, 90.4173, 'Khilgaon', 'approximate', 'catcalling', 'Group of young men near a corner shop making comments regularly.', 2, 'afternoon', '2026-05-09', false, 'published', true, 'seed'),
  (23.7677, 90.4203, 'Rampura', 'approximate', 'following_stalking', 'Someone on a bicycle followed at walking pace along the main road.', 3, 'evening', '2026-05-13', false, 'published', true, 'seed'),
  (23.8213, 90.3654, 'Kazipara', 'approximate', 'unsafe_transport', 'CNG driver refused to use the meter and became aggressive.', 3, 'night', '2026-05-04', false, 'published', true, 'seed'),
  (23.7461, 90.3801, 'Zigatola', 'approximate', 'verbal_harassment', 'Comments made while waiting for a rickshaw near the crossing.', 2, 'evening', '2026-05-07', false, 'published', true, 'seed'),
  (23.7969, 90.3644, 'Adabor', 'approximate', 'poor_lighting', 'Residential road has broken streetlights, feels isolated at night.', 2, 'night', '2026-04-26', false, 'published', true, 'seed'),
  (23.7515, 90.3714, 'Elephant Road', 'approximate', 'groping_physical', 'Crowded shopping street, unwanted contact while walking.', 4, 'afternoon', '2026-05-17', false, 'published', true, 'seed');

-- ============================================================================
-- DONE. These will disappear automatically, per neighborhood, once real
-- reports in that same area (rounded to ~1.1km grid) reach the threshold
-- set in admin_settings ('seed_threshold_per_area', default 5).
-- ============================================================================
