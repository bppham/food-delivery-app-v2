const RABBIT_EXCHANGES = {
    NOTIFICATION: "fod.notification.direct",
}

const RABBIT_QUEUES = {
    EMAIL_OTP: "fod.email.otp.queue",
};

const RABBIT_ROUTING_KEYS = {
    EMAIL_OTP: "email.otp",
};
module.exports = {
    RABBIT_EXCHANGES,
    RABBIT_QUEUES,
    RABBIT_ROUTING_KEYS,
};