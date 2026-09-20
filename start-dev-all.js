const { spawn } = require("node:child_process");
const path = require("node:path");

const processes = [
  spawn(process.execPath, ["start-all.js"], { cwd: __dirname, stdio: "inherit" }),
  spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "dev"], {
    cwd: path.join(__dirname, "frontend"),
    stdio: "inherit",
    windowsHide: false
  })
];

const shutdown = () => processes.forEach((child) => child.kill());
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
