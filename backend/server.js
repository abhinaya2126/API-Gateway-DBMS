const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const pool = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const userRoutes = require("./routes/userRoutes");
const apiRoutes = require("./routes/apiRoutes");
const versionRoutes = require("./routes/versionRoutes");
const routeRoutes = require("./routes/routeRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const apiKeyRoutes = require("./routes/apiKeyRoutes");
const usageRoutes = require("./routes/usageRoutes");
const auditRoutes = require("./routes/auditRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/users", userRoutes);
app.use("/api/apis", apiRoutes);
app.use("/api/versions", versionRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/keys", apiKeyRoutes);
app.use("/api/usage", usageRoutes);
app.use("/api/audit", auditRoutes);

app.get("/api/health", async (req, res, next) => {
    try {
        const [result] = await pool.query(
            "SELECT 1 AS database_status"
        );

        res.status(200).json({
            success: true,
            message: "API Gateway Management Backend is running",
            database: result[0].database_status === 1
                ? "connected"
                : "not connected"
        });
    } catch (error) {
        next(error);
    }
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        const connection = await pool.getConnection();

        console.log("MySQL database connected successfully.");

        connection.release();

        app.listen(PORT, () => {
            console.log(
                `Server running on http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "Unable to connect to MySQL:",
            error.message
        );

        process.exit(1);
    }
};

startServer();