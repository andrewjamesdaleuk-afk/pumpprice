
ALTER TABLE stations ADD COLUMN IF NOT EXISTS is_motorway BOOLEAN DEFAULT FALSE;

UPDATE stations SET is_motorway = FALSE;

UPDATE stations s
SET is_motorway = TRUE
FROM motorway_services m
WHERE s.postcode ILIKE SUBSTRING(m.postcode FROM 1 FOR LENGTH(m.postcode)-2) || '%';

SELECT COUNT(*) as motorway_stations_found FROM stations WHERE is_motorway = TRUE;
