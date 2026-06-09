-- V1.0.2__LowerUsernameIndex.sql
-- Add function-based indexes to optimize the LOWER(username) queries for case-insensitive authentication

CREATE INDEX idx_users_lower_username ON users (LOWER(username));
CREATE INDEX idx_playerprofile_lower_username ON PlayerProfile (LOWER(username));
