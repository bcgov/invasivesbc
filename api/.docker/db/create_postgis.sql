-- Enable PostGIS (includes raster)
CREATE EXTENSION IF NOT EXISTS postgis;
-- Enable Topology
CREATE EXTENSION IF NOT EXISTS postgis_topology;
-- -- Enable PostGIS Advanced 3D
-- -- and other geoprocessing algorithms
-- -- sfcgal not available with all distributions
-- CREATE EXTENSION IF NOT EXISTS postgis_sfcgal;
-- -- fuzzy matching needed for Tiger
-- CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
-- -- rule based standardizer
-- CREATE EXTENSION IF NOT EXISTS address_standardizer;
-- -- example rule data set
-- CREATE EXTENSION IF NOT EXISTS address_standardizer_data_us;
-- -- Enable US Tiger Geocoder
-- CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;
