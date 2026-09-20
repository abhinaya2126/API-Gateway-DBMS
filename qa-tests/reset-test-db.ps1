$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $PSScriptRoot
$backendEnv = Get-Content (Join-Path $repo "backend\.env")
$envValues = @{}
foreach ($line in $backendEnv) {
    if ($line -match "^(DB_HOST|DB_PORT|DB_USER|DB_PASSWORD)=([^\r\n]*)$") {
        $envValues[$Matches[1]] = $Matches[2]
    }
}

$scratch = Join-Path $PSScriptRoot "scratch-sql"
if (Test-Path $scratch) { Remove-Item $scratch -Recurse -Force }
New-Item -ItemType Directory -Path $scratch | Out-Null

$files = @(
    "schema.sql",
    "seed.sql",
    "indexes.sql",
    "views.sql",
    "procedures.sql",
    "triggers.sql",
    "migrations\001_api_gateway_configuration.sql"
)

foreach ($file in $files) {
    $targetName = $file.Replace("\", "_")
    $sql = Get-Content (Join-Path $repo (Join-Path "database" $file)) -Raw
    $sql = $sql.Replace("api_gateway_mgmt", "api_gateway_test")
    Set-Content (Join-Path $scratch $targetName) $sql -NoNewline
}

$env:MYSQL_PWD = $envValues.DB_PASSWORD
$mysqlArgs = @("--sql", "--host=$($envValues.DB_HOST)", "--port=$($envValues.DB_PORT)", "--user=$($envValues.DB_USER)")

mysqlsh @mysqlArgs --execute "DROP DATABASE IF EXISTS api_gateway_test; CREATE DATABASE api_gateway_test"
foreach ($file in @("schema.sql", "seed.sql", "indexes.sql", "views.sql", "procedures.sql", "triggers.sql", "migrations_001_api_gateway_configuration.sql")) {
    mysqlsh @mysqlArgs --file (Join-Path $scratch $file)
}

mysqlsh @mysqlArgs --execute "SELECT 'api_gateway_test' AS database_name, COUNT(*) AS users FROM api_gateway_test.users;"
Remove-Item Env:MYSQL_PWD