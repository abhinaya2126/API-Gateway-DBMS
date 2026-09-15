const matchRoute = (routePattern, requestedPath) => {
    const patternParts = routePattern.split("/").filter(Boolean);
    const pathParts = requestedPath.split("/").filter(Boolean);

    // Number of URL parts must match
    if (patternParts.length !== pathParts.length) {
        return false;
    }

    // Compare each part
    return patternParts.every((part, index) => {
        // :id, :userId, etc. can match any value
        if (part.startsWith(":")) {
            return true;
        }

        return part === pathParts[index];
    });
};

module.exports = {
    matchRoute
};