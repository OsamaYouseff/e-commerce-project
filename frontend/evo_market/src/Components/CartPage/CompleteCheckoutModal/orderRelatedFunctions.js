export function isOrderInfoValid(orderData) {
    const errors = [];

    // Check userId
    if (!orderData.userId || typeof orderData.userId !== 'string') {
        errors.push('Invalid or missing userId');
    }

    // Check items
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
        errors.push('Items must be a non-empty array');
    } else {
        orderData.items.forEach((item, index) => {
            if (!item.productId || typeof item.productId !== 'string') {
                errors.push(`Invalid or missing productId in item ${index}`);
            }
            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                errors.push(`Invalid quantity in item ${index}`);
            }
            if (!Number.isInteger(item.priceAtOrderInCents) || item.priceAtOrderInCents <= 0) {
                errors.push(`Invalid priceAtOrderInCents in item ${index}`);
            }
        });
    }

    // Check financials
    const financials = orderData.financials;
    if (!financials || typeof financials !== 'object') {
        errors.push('Invalid or missing financials');
    } else {
        if (!Number.isInteger(financials.subtotalInCents) || financials.subtotalInCents < 0) {
            errors.push('Invalid subtotalInCents');
        }
        if (!Number.isInteger(financials.discount) || financials.discount < 0) {
            errors.push('Invalid discount');
        }
        if (!Number.isInteger(financials.shippingCostInCents) || financials.shippingCostInCents < 0) {
            errors.push('Invalid shippingCostInCents');
        }
        if (!Number.isInteger(financials.totalAmountInCents) || financials.totalAmountInCents < 0) {
            errors.push('Invalid totalAmountInCents');
        }
        if (!financials.currency || typeof financials.currency !== 'string') {
            errors.push('Invalid or missing currency');
        }
    }

    // Check shippingAddress
    const shippingAddress = orderData.shippingAddress;
    if (!shippingAddress || typeof shippingAddress !== 'object') {
        errors.push('Invalid or missing shippingAddress');
    } else {
        if (!shippingAddress.fullAddress || typeof shippingAddress.fullAddress !== 'string') {
            errors.push('Invalid or missing fullAddress in shippingAddress');
        }
        if (!shippingAddress.phoneNumber || typeof shippingAddress.phoneNumber !== 'string') {
            errors.push('Invalid or missing phoneNumber in shippingAddress');
        }
        if (!shippingAddress.firstName || typeof shippingAddress.firstName !== 'string') {
            errors.push('Invalid or missing firstName in shippingAddress');
        }
        if (!shippingAddress.lastName || typeof shippingAddress.lastName !== 'string') {
            errors.push('Invalid or missing lastName in shippingAddress');
        }
        if (!shippingAddress.label || typeof shippingAddress.label !== 'string') {
            errors.push('Invalid or missing label in shippingAddress');
        }
    }

    // Check paymentMethod
    if (!orderData.paymentMethod || typeof orderData.paymentMethod !== 'string') {
        errors.push('Invalid or missing paymentMethod');
    }

    // Check shippingInfo
    if (!orderData.shippingInfo || typeof orderData.shippingInfo !== 'object') {
        errors.push('Invalid or missing shippingInfo');
    } else {
        if (!orderData.shippingInfo.estimatedDeliveryDate || isNaN(Date.parse(orderData.shippingInfo.estimatedDeliveryDate))) {
            errors.push('Invalid or missing estimatedDeliveryDate');
        }
    }

    return errors;
}

export function getErrorsMessage(errors) {
    let message = '';
    if (errors.length > 0) {
        message = 'There is some invalid data or missing data :';
        for (let i = 0; i < errors.length; i++) {
            message += `\n${i + 1}. ${errors[i]}`;
        }
    }
    return message;
}