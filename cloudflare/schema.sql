CREATE TABLE IF NOT EXISTS progress (
  id TEXT PRIMARY KEY,        -- SHA-256 of the family code
  data TEXT NOT NULL,         -- compressed progress (stars, scores, mistakes); no names or emails
  updated INTEGER NOT NULL    -- last save, ms since epoch
);
