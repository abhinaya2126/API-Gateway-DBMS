const express = require("express");

const app = express();
const PORT = 6002;
const products = [
    { id: 1, name: "Mechanical Keyboard", price: 89.99, stock: 24 },
    { id: 2, name: "USB-C Dock", price: 129.5, stock: 12 },
    { id: 3, name: "Studio Headphones", price: 149, stock: 8 }
];

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("X-Request-ID", req.get("X-Request-ID") || "missing");
    next();
});

app.get("/health", (req, res) => res.json({ success: true, service: "Product Service" }));

app.get("/products", (req, res) => res.json({ success: true, service: "Product Service", data: products }));

app.post("/products", (req, res) => {
    const { name, price, stock } = req.body;
    if (typeof name !== "string" || !name.trim() || typeof price !== "number" || price < 0 || !Number.isInteger(stock) || stock < 0) {
        return res.status(400).json({ success: false, message: "name, non-negative price, and integer stock are required" });
    }
    const product = { id: products.length + 1, name: name.trim(), price, stock };
    products.push(product);
    return res.status(201).json({ success: true, service: "Product Service", data: product });
});

app.listen(PORT, () => console.log(`Product Service running on http://localhost:${PORT}`));
