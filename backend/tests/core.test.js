const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const { matchRoute } = require("../utils/routeMatcher");
const {
    validMethods,
    isPositiveInteger,
    isBooleanLike
} = require("../utils/validator");

test("route matcher supports static and parameterized paths", () => {
    assert.equal(matchRoute("/users", "/users"), true);
    assert.equal(matchRoute("/users/:id", "/users/42"), true);
    assert.equal(matchRoute("/users/:id", "/users"), false);
    assert.equal(matchRoute("/users/:id", "/users/42/profile"), false);
});

test("write validators accept supported values and reject invalid values", () => {
    assert.equal(validMethods.has("GET"), true);
    assert.equal(validMethods.has("TRACE"), false);
    assert.equal(isPositiveInteger(4), true);
    assert.equal(isPositiveInteger(0), false);
    assert.equal(isBooleanLike(true), true);
    assert.equal(isBooleanLike("true"), false);
});

test("seeded demo credentials match the documented admin and developer passwords", async () => {
    const seedSql = fs.readFileSync(path.join(__dirname, "../../database/seed.sql"), "utf8");
    const expected = [
        ["admin_arjun", "Admin@123"],
        ["dev_priya", "Dev@123"],
        ["dev_karthik", "Dev@456"],
        ["gateway_user", "User@123"]
    ];

    for (const [username, password] of expected) {
        const match = seedSql.match(new RegExp(`\\('${username.replace(/_/g, "_" )}',\\s*'[^']+',\\s*'([^']+)'`, "i"));
        assert.ok(match, `Missing seed entry for ${username}`);
        assert.equal(await bcrypt.compare(password, match[1]), true, `${username} hash does not match ${password}`);
    }
});
