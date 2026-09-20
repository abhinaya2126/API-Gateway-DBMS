const errorHandler = (err, req, res, next) => {
    console.error(err);

    const statusCode = err.statusCode || (
        err.code === "ER_DUP_ENTRY" ? 409 :
            err.code === "ER_NO_REFERENCED_ROW_2" ? 404 :
                err.code === "ER_ROW_IS_REFERENCED_2" ? 409 :
                    err.code === "ER_CHECK_CONSTRAINT_VIOLATED" ? 400 :
                        500
    );

    const message = err.code === "ER_NO_REFERENCED_ROW_2"
        ? "Referenced record not found"
        : err.code === "ER_ROW_IS_REFERENCED_2"
            ? "Record is still referenced and cannot be deleted"
            : err.code === "ER_CHECK_CONSTRAINT_VIOLATED"
                ? "Request violates a database constraint"
                : err.message || "Internal server error";

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorHandler;