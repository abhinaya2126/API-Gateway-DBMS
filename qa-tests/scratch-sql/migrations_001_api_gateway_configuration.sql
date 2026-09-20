USE api_gateway_test;

SET @add_base_url = (
    SELECT IF(COUNT(*) = 0,
        'ALTER TABLE apis ADD COLUMN base_url VARCHAR(255) NULL AFTER description',
        'SELECT 1')
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'apis'
      AND column_name = 'base_url'
);
PREPARE add_base_url_stmt FROM @add_base_url;
EXECUTE add_base_url_stmt;
DEALLOCATE PREPARE add_base_url_stmt;

SET @add_rate_limit = (
    SELECT IF(COUNT(*) = 0,
        'ALTER TABLE apis ADD COLUMN rate_limit_per_min INT NULL AFTER base_url',
        'SELECT 1')
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'apis'
      AND column_name = 'rate_limit_per_min'
);
PREPARE add_rate_limit_stmt FROM @add_rate_limit;
EXECUTE add_rate_limit_stmt;
DEALLOCATE PREPARE add_rate_limit_stmt;

UPDATE apis
SET base_url = CASE api_id
    WHEN 1 THEN 'http://localhost:6001'
    WHEN 2 THEN 'http://localhost:6002'
    WHEN 3 THEN 'http://localhost:6003'
    WHEN 4 THEN 'http://localhost:6004'
    ELSE base_url
END
WHERE base_url IS NULL;
