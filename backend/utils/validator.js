const validMethods = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]);

const validationError = (res, errors) =>
    res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
    });

const isPositiveInteger = (value) =>
    Number.isInteger(Number(value)) && Number(value) > 0;

const isBooleanLike = (value) =>
    value === true || value === false || value === 0 || value === 1;

module.exports = {
    validMethods,
    validationError,
    isPositiveInteger,
    isBooleanLike
};
