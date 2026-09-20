const pool = require("./db");

const services = {
    1: {
        name: "User Service",
        baseUrl: "http://localhost:6001"
    },

    2: {
        name: "Product Service",
        baseUrl: "http://localhost:6002"
    },

    3: {
        name: "Order Service",
        baseUrl: "http://localhost:6003"
    },

    4: {
        name: "Payment Service",
        baseUrl: "http://localhost:6004"
    }
};

const cache = new Map();
const CACHE_TTL_MS = 30 * 1000;

const getServiceByApiId = async (apiId) => {
    const numericApiId = Number(apiId);
    const cached = cache.get(numericApiId);

    if (cached && cached.expiresAt > Date.now()) {
        return cached.service;
    }

    const [rows] = await pool.execute(
        "SELECT api_name, base_url FROM apis WHERE api_id = ? LIMIT 1",
        [numericApiId]
    );
    const configured = rows[0];
    const fallback = services[numericApiId];

    if (!configured && !fallback) {
        return null;
    }

    const service = {
        name: configured?.api_name || fallback.name,
        baseUrl: configured?.base_url || fallback.baseUrl
    };

    cache.set(numericApiId, {
        service,
        expiresAt: Date.now() + CACHE_TTL_MS
    });

    return service;
};

const invalidateServiceCache = (apiId) => {
    cache.delete(Number(apiId));
};

module.exports = {
    getServiceByApiId,
    invalidateServiceCache
};