const test = require("node:test");
const assert = require("node:assert/strict");
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
