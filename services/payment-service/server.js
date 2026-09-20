const express = require("express");

const app = express();
const PORT = 6004;
const payments = [
    { id: "pay_1001", orderId: 1001, amount: 89.99, status: "captured" },
    { id: "pay_1002", orderId: 1002, amount: 259, status: "authorized" }
];

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("X-Request-ID", req.get("X-Request-ID") || "missing");
    next();
});

app.get("/health", (req, res) => res.json({ success: true, service: "Payment Service" }));
app.get("/payments", (req, res) => res.json({ success: true, service: "Payment Service", data: payments }));

app.post("/payments", (req, res) => {
    const { orderId, amount, method } = req.body;
    if (!Number.isInteger(orderId) || orderId < 1 || typeof amount !== "number" || amount <= 0 || typeof method !== "string" || !method.trim()) {
        return res.status(400).json({ success: false, message: "orderId, positive amount, and method are required" });
    }
    const payment = { id: `pay_${1001 + payments.length}`, orderId, amount, method: method.trim(), status: "authorized" };
    payments.push(payment);
    return res.status(201).json({ success: true, service: "Payment Service", data: payment });
});

app.listen(PORT, () => console.log(`Payment Service running on http://localhost:${PORT}`));
