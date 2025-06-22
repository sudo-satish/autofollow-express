const successResponse = ({
    message,
    data,
}) => {
    return {
        success: true,
        message,
        data,
    };
};

const errorResponse = ({
    message,
    error,
}) => {
    return {
        success: false,
        message,
        error,
    };
};

module.exports = {
    successResponse,
    errorResponse,
};