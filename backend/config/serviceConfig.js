const services = {
    1: {
        name: "User Service",
        baseUrl: "http://localhost:6001"
    },

    2: {
        name: "Product Service",
        baseUrl: "http://localhost:6002"
    },

    3: {
        name: "Order Service",
        baseUrl: "http://localhost:6003"
    },

    4: {
        name: "Payment Service",
        baseUrl: "http://localhost:6004"
    }
};

const getServiceByApiId = (apiId) => {
    return services[Number(apiId)] || null;
};

module.exports = {
    getServiceByApiId
};