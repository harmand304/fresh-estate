-- ============================================
-- Mood Real Estate Database Schema
-- PostgreSQL Database Creation Script
-- ============================================

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS property_types CASCADE;
DROP TABLE IF EXISTS cities CASCADE;

-- ============================================
-- 1. Cities Table
-- ============================================
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. Locations Table (Neighborhoods/Areas)
-- ============================================
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, city_id)
);

-- ============================================
-- 3. Agents Table
-- ============================================
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. Property Types Table
-- ============================================
CREATE TABLE property_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. Properties Table (Main Table)
-- ============================================
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    purpose VARCHAR(10) NOT NULL CHECK (purpose IN ('SALE', 'RENT')),
    area_sqm INTEGER,
    bedrooms INTEGER DEFAULT 0,
    rooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    has_garage BOOLEAN DEFAULT FALSE,
    has_balcony BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    source_url TEXT,
    location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
    property_type_id INTEGER REFERENCES property_types(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX idx_properties_city ON properties(location_id);
CREATE INDEX idx_properties_purpose ON properties(purpose);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_type ON properties(property_type_id);
CREATE INDEX idx_locations_city ON locations(city_id);

-- ============================================
-- Success Message
-- ============================================
-- Schema created successfully!
-- Run seed_data.sql next to populate with data.
