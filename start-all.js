const { spawn } = require("child_process");
const path = require("path");

const services = [
    ["backend", "backend"],
    ["user-service", "services/user-service"],
    ["product-service", "services/product-service"],
    ["order-service", "services/order-service"],
    ["payment-service", "services/payment-service"]
];

const processes = services.map(([name, directory]) => {
    const child = spawn(process.execPath, ["server.js"], {
        cwd: path.join(__dirname, directory),
        stdio: "inherit",
        windowsHide: false
    });

    child.on("exit", (code) => {
        console.log(`${name} exited with code ${code}`);
    });

    return child;
});

const shutdown = () => {
    for (const child of processes) {
        child.kill();
    }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
