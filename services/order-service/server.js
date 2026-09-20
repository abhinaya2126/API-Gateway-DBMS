const express = require("express");

const app = express();
const PORT = 6003;
const orders = [
    { id: 1001, customerId: 1, items: [{ productId: 1, quantity: 1 }], status: "confirmed" },
    { id: 1002, customerId: 2, items: [{ productId: 2, quantity: 2 }], status: "processing" }
];

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("X-Request-ID", req.get("X-Request-ID") || "missing");
    next();
});

app.get("/health", (req, res) => res.json({ success: true, service: "Order Service" }));
app.get("/orders", (req, res) => res.json({ success: true, service: "Order Service", data: orders }));

app.post("/orders", (req, res) => {
    const { customerId, items } = req.body;
    if (!Number.isInteger(customerId) || customerId < 1 || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "customerId and a non-empty items array are required" });
    }
    const order = { id: 1001 + orders.length, customerId, items, status: "placed" };
    orders.push(order);
    return res.status(201).json({ success: true, service: "Order Service", data: order });
});

app.listen(PORT, () => console.log(`Order Service running on http://localhost:${PORT}`));
