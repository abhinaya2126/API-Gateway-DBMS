
const express = require("express");

const app = express();

app.use(express.json());

const PORT = 6001;

const users = [
    {
        id: 1,
        name: "Alice Johnson",
        email: "alice@example.com"
    },
    {
        id: 2,
        name: "Bob Smith",
        email: "bob@example.com"
    },
    {
        id: 3,
        name: "Charlie Brown",
        email: "charlie@example.com"
    }
];

app.get("/users", (req, res) => {
    res.status(200).json({
        success: true,
        service: "User Service",
        data: users
    });
});

app.post("/users", (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: "Name and email are required"
        });
    }

    const newUser = {
        id: users.length + 1,
        name,
        email
    };

    users.push(newUser);

    return res.status(201).json({
        success: true,
        message: "User created successfully",
        service: "User Service",
        data: newUser
    });
});

app.get("/users/:id", (req, res) => {
    const user = users.find(
        (item) => item.id === Number(req.params.id)
    );

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    res.status(200).json({
        success: true,
        service: "User Service",
        data: user
    });
});

app.listen(PORT, () => {
    console.log(
        `User Service running on http://localhost:${PORT}`
    );
});
