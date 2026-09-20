const pool = require("../config/db");

const usageScope = (req) =>
    req.user.role === "ADMIN"
        ? { clause: "", values: [] }
        : { clause: "WHERE l.user_id = ?", values: [req.user.user_id] };

const getAnalyticsSummary = async (req, res, next) => {
    try {
        const scope = usageScope(req);
        const [[summary]] = await pool.execute(`
            SELECT
                COUNT(*) AS total_requests,
                SUM(CASE WHEN l.status_code BETWEEN 200 AND 399 THEN 1 ELSE 0 END) AS successful_requests,
                SUM(CASE WHEN l.status_code >= 400 THEN 1 ELSE 0 END) AS failed_requests,
                COALESCE(AVG(l.response_time_ms), 0) AS average_response_time_ms
            FROM api_usage_logs l
            ${scope.clause}
        `, scope.values);
        res.json({ success: true, summary });
    } catch (error) {
        next(error);
    }
};

const getByApi = async (req, res, next) => {
    try {
        const scope = usageScope(req);
        const [rows] = await pool.execute(`
            SELECT l.api_id, a.api_name, COUNT(*) AS request_count, COALESCE(AVG(l.response_time_ms), 0) AS average_response_time_ms
            FROM api_usage_logs l
            INNER JOIN apis a ON a.api_id = l.api_id
            ${scope.clause}
            GROUP BY l.api_id, a.api_name
            ORDER BY request_count DESC
        `, scope.values);
        res.json({ success: true, apis: rows });
    } catch (error) {
        next(error);
    }
};

const getByStatus = async (req, res, next) => {
    try {
        const scope = usageScope(req);
        const [rows] = await pool.execute(`
            SELECT l.status_code, COUNT(*) AS request_count
            FROM api_usage_logs l
            ${scope.clause}
            GROUP BY l.status_code
            ORDER BY l.status_code
        `, scope.values);
        res.json({ success: true, statuses: rows });
    } catch (error) {
        next(error);
    }
};

const getTimeseries = async (req, res, next) => {
    try {
        const range = req.query.range === "7d" ? "7 DAY" : "24 HOUR";
        const scope = usageScope(req);
        const where = scope.clause ? `${scope.clause} AND` : "WHERE";
        const [rows] = await pool.execute(`
            SELECT DATE_FORMAT(l.request_timestamp, '%Y-%m-%d %H:00:00') AS bucket, COUNT(*) AS request_count
            FROM api_usage_logs l
            ${where} l.request_timestamp >= DATE_SUB(NOW(), INTERVAL ${range})
            GROUP BY bucket
            ORDER BY bucket
        `, scope.values);
        res.json({ success: true, range: req.query.range === "7d" ? "7d" : "24h", timeseries: rows });
    } catch (error) {
        next(error);
    }
};

const getTopRoutes = async (req, res, next) => {
    try {
        const scope = usageScope(req);
        const [rows] = await pool.execute(`
            SELECT l.route_id, r.path, r.http_method, COUNT(*) AS request_count
            FROM api_usage_logs l
            INNER JOIN routes r ON r.route_id = l.route_id
            ${scope.clause}
            GROUP BY l.route_id, r.path, r.http_method
            ORDER BY request_count DESC
            LIMIT 10
        `, scope.values);
        res.json({ success: true, routes: rows });
    } catch (error) {
        next(error);
    }
};

const getSlowestRoutes = async (req, res, next) => {
    try {
        const scope = usageScope(req);
        const [rows] = await pool.execute(`
            SELECT l.route_id, r.path, r.http_method, COALESCE(AVG(l.response_time_ms), 0) AS average_response_time_ms
            FROM api_usage_logs l
            INNER JOIN routes r ON r.route_id = l.route_id
            ${scope.clause}
            GROUP BY l.route_id, r.path, r.http_method
            ORDER BY average_response_time_ms DESC
            LIMIT 10
        `, scope.values);
        res.json({ success: true, routes: rows });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAnalyticsSummary,
    getByApi,
    getByStatus,
    getTimeseries,
    getTopRoutes,
    getSlowestRoutes
};
