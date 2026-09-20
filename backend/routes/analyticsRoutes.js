const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {
    getAnalyticsSummary,
    getByApi,
    getByStatus,
    getTimeseries,
    getTopRoutes,
    getSlowestRoutes
} = require("../controllers/analyticsController");

const router = express.Router();
router.use(authenticateToken);
router.get("/summary", getAnalyticsSummary);
router.get("/by-api", getByApi);
router.get("/by-status", getByStatus);
router.get("/timeseries", getTimeseries);
router.get("/top-routes", getTopRoutes);
router.get("/slowest-routes", getSlowestRoutes);

module.exports = router;
