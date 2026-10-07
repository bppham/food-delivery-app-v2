const RABBIT_EXCHANGES = {
    NOTIFICATION: "fod.notification.direct",
    ORDER: "fod.order.topic"
}

const RABBIT_QUEUES = {
    EMAIL_OTP: "fod.email.otp.queue",
    ORDER_EMAIL_INVOICE: "fod.order.email_invoice.queue",
};

const RABBIT_ROUTING_KEYS = {
    EMAIL_OTP: "email.otp",
    ORDER_PLACED: "order.placed",
};
module.exports = {
    RABBIT_EXCHANGES,
    RABBIT_QUEUES,
    RABBIT_ROUTING_KEYS,
};