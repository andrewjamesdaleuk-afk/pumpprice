-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
-- Current Live Schema as of 2026-03-22

CREATE TABLE public.motorway_services (
 id uuid NOT NULL DEFAULT gen_random_uuid(),
 motorway character varying NOT NULL,
 name character varying NOT NULL,
 operator character varying,
 postcode character varying NOT NULL UNIQUE,
 created_at timestamp with time zone DEFAULT now(),
 CONSTRAINT motorway_services_pkey PRIMARY KEY (id)
);
CREATE TABLE public.prices (
 id uuid NOT NULL DEFAULT uuid_generate_v4(),
 station_id uuid,
 fuel_type character varying NOT NULL,
 price numeric NOT NULL,
 recorded_at timestamp with time zone NOT NULL,
 created_at timestamp with time zone DEFAULT now(),
 CONSTRAINT prices_pkey PRIMARY KEY (id),
 CONSTRAINT prices_station_id_fkey FOREIGN KEY (station_id) REFERENCES public.stations(id)
);
CREATE TABLE public.spatial_ref_sys (
 srid integer NOT NULL CHECK (srid > 0 AND srid <= 998999),
 auth_name character varying,
 auth_srid integer,
 srtext character varying,
 proj4text character varying,
 CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid)
);
CREATE TABLE public.stations (
 id uuid NOT NULL DEFAULT uuid_generate_v4(),
 site_id character varying NOT NULL UNIQUE,
 brand character varying NOT NULL,
 postcode character varying,
 location USER-DEFINED NOT NULL,
 created_at timestamp with time zone DEFAULT now(),
 updated_at timestamp with time zone DEFAULT now(),
 motorway_name character varying,
 address character varying,
 is_motorway boolean DEFAULT false,
 CONSTRAINT stations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.uk_price_history (
 date date NOT NULL,
 petrol_avg numeric,
 petrol_low numeric,
 petrol_high numeric,
 diesel_avg numeric,
 diesel_low numeric,
 diesel_high numeric,
 sample_size integer,
 created_at timestamp with time zone DEFAULT now(),
 petrol_low_brand character varying,
 petrol_low_address character varying,
 petrol_high_brand character varying,
 petrol_high_address character varying,
 diesel_low_brand character varying,
 diesel_low_address character varying,
 diesel_high_brand character varying,
 diesel_high_address character varying,
 CONSTRAINT uk_price_history_pkey PRIMARY KEY (date)
);