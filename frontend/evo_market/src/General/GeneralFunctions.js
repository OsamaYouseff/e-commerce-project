import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { couponRates, FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_COST, PAYMENT_METHODS } from "./GeneralVariables.jsx"
import { GoHome } from "../../../shared_files/General/GeneralFunctions.js";


export function GetUserInfo() {
    if (localStorage.getItem("customerInfo"))
        return JSON.parse(localStorage.getItem("customerInfo"));
    else if (sessionStorage.getItem("customerInfo"))
        return JSON.parse(sessionStorage.getItem("customerInfo"));

    return {
        _id: null,
        firstname: "",
        lastname: "",
        username: "",
        email: "",
        address: "",
        gender: "",
        phone: "",
        createdAt: "",
        updatedAt: "",
    };
}

export function ResetLocalStorage() {
    sessionStorage.removeItem("customerInfo");
    localStorage.removeItem("customerInfo");
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    Cookies.remove("token");
}

export function StoreDataAtLocalStorage(Type = "localStorage", data) {

    if (!data) {
        toast.error("there are some data missing please logout and login again");
        GoHome();
        return
    }

    if (Type === "localStorage") {
        localStorage.setItem('customerInfo', JSON.stringify(data.userInfo));

    } else if (Type === "sessionStorage") {
        sessionStorage.setItem('customerInfo', JSON.stringify(data.userInfo));
    }

    Cookies.set('token', data.accessToken, { expires: 7 });


}

export function GetAddressInfo() {
    if (sessionStorage.getItem("edited-address"))
        return JSON.parse(sessionStorage.getItem("edited-address"));

    return {
        userId: null,
        firstName: null,
        lastName: null,
        fullAddress: null,
        label: null,
        phoneNumber: null,
        isDefault: null,
    };
}

export function GetTokenAndUserId() {
    const customerData = localStorage.getItem('customerInfo') || sessionStorage.getItem('customerInfo');
    const accessToken = Cookies.get('token');


    if (!customerData) {
        toast("there are some data missing please login again");
        setTimeout(() => {
            ResetLocalStorage()
            GoHome();
        }, 1500)
        return;
    }

    if (!customerData || !accessToken) {
        toast.error("Your session has expired please login again");
        setTimeout(() => {
            ResetLocalStorage()
            GoHome();
        }, 1500)
        return;
    }
    const customerId = JSON.parse(customerData)["_id"];


    return { customerId, accessToken };
}

/**
 * Mirrors the API's pricing policy so the preview matches the charged order.
 * The API recomputes these values from catalog prices and is the source of
 * truth; a mismatch is reported by the order response as `staleCart`.
 */
export function CalcTotalCartPrice(subtotalPrice, couponCode = "") {
    const subtotalInCents = Math.round(Number(subtotalPrice || 0) * 100);
    const rate = GetCouponDiscount(couponCode);
    const discountInCents = Math.round(subtotalInCents * rate);
    const shippingInCents = subtotalInCents === 0 || subtotalInCents >= FREE_SHIPPING_THRESHOLD
        ? 0
        : FLAT_SHIPPING_COST;
    const shippingCalc = shippingInCents / 100;
    const shippingCost = shippingInCents === 0 ? "Free" : `$${(shippingInCents / 100).toFixed(2)}`;
    const finalPrice = (subtotalInCents - discountInCents + shippingInCents) / 100;

    return {
        finalPrice: finalPrice.toFixed(2),
        shippingCost,
        discount: discountInCents / 100,
        shippingCalc,
        discountInCents,
        shippingInCents,
    };
}

export function IsDiscountValid(couponCode) {
    return Boolean(couponCode) && Object.prototype.hasOwnProperty.call(couponRates, String(couponCode).trim().toUpperCase());
}

/** Payment methods the API actually accepts, in display order. */
export function GetAvailablePaymentMethods() {
    return [...PAYMENT_METHODS];
}

/**
 * Creates an idempotency key for one checkout attempt. The caller keeps the
 * value for the whole attempt so retries reuse it; a new attempt gets a new key.
 */
export function newIdempotencyKey() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    }
    return `k-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * sessionStorage keeps an in-flight checkout key across a modal unmount or a
 * page reload, so a retry after a timeout or a lost response resolves to the
 * order the first request created instead of creating a second one. The entry
 * is per customer, and is only cleared once an order is confirmed placed.
 */
const IDEMPOTENCY_STORAGE_PREFIX = "checkoutIdempotencyKey";

const idempotencyStorageKey = (customerId) =>
    `${IDEMPOTENCY_STORAGE_PREFIX}:${customerId || "anonymous"}`;

/**
 * Resolves the browser storage areas, skipping any whose *property access*
 * throws. Reading `sessionStorage` or `localStorage` is itself a guarded
 * operation in browsers: on an opaque origin, or where a policy blocks storage,
 * the accessor throws `SecurityError`. Building `[sessionStorage, localStorage]`
 * inline evaluated both accessors before any `try` could catch them, so one
 * blocked area took the whole function down — checkout then failed during
 * render, and rotating the key of a successfully placed order could throw too.
 * Each area is therefore resolved inside its own guarded access.
 */
const availableStorages = () => {
    const stores = [];
    for (const name of ["sessionStorage", "localStorage"]) {
        try {
            const store = globalThis[name];
            // A context may expose the name with no usable value at all.
            if (store && typeof store.getItem === "function") stores.push(store);
        } catch {
            // The accessor threw: this area is unavailable, try the next one.
        }
    }
    return stores;
};

/**
 * Last-resort tier, used only when neither `sessionStorage` nor `localStorage`
 * can be used (some private modes and opaque origins block both). It is module
 * scope rather than a `useRef` because the checkout modal is unmounted as soon
 * as a request is sent: a per-render or per-mount key changed under every
 * retry and could create a duplicate order. This keeps the key for the whole
 * page session instead.
 *
 * It is deliberately *not* reload-durable, and callers should not treat it as
 * such: if the order committed and the response was lost, a reload starts a new
 * attempt with a new key. No client-side code can close that gap without durable
 * storage, so it is documented rather than papered over.
 */
const memoryIdempotencyKeys = new Map();

/** Reads a pending key from a Web Storage area, returning null when absent. */
const readStoredKey = (store, storageKey) => store.getItem(storageKey) || null;

/**
 * Returns the pending key for this customer, creating one if there is none.
 *
 * Three tiers, most durable first:
 *  1. `sessionStorage` — survives a reload and stays private to this tab.
 *  2. `localStorage` — also survives a reload, and is reachable when only
 *     `sessionStorage` is blocked. It is shared with this customer's other tabs,
 *     so two tabs checking out different carts at the same time contend for one
 *     pending key and the server refuses the loser with 409. That is the
 *     preferable failure: a visible error rather than a second order.
 *  3. memory — stable for the page session, lost on reload.
 */
export function getCheckoutIdempotencyKey(customerId) {
    const storageKey = idempotencyStorageKey(customerId);

    for (const store of availableStorages()) {
        try {
            const existing = readStoredKey(store, storageKey);
            if (existing) return existing;
            const created = newIdempotencyKey();
            store.setItem(storageKey, created);
            return created;
        } catch {
            // Blocked or over quota: try the next tier.
        }
    }

    const fallback = memoryIdempotencyKeys.get(storageKey);
    if (fallback) return fallback;
    const created = newIdempotencyKey();
    memoryIdempotencyKeys.set(storageKey, created);
    return created;
}

/**
 * Drops the pending key after the order is known to exist, so the next
 * checkout is a genuinely new order. Called only on a confirmed success.
 */
export function rotateCheckoutIdempotencyKey(customerId) {
    const storageKey = idempotencyStorageKey(customerId);
    memoryIdempotencyKeys.delete(storageKey);
    for (const store of availableStorages()) {
        try {
            store.removeItem(storageKey);
        } catch {
            // Never usable for this customer, so there is nothing to remove; the
            // in-memory copy above is already gone.
        }
    }
}

function GetCouponDiscount(couponCode) {
    if (!couponCode) return 0;
    return couponRates[String(couponCode).trim().toUpperCase()] ?? 0;
}

export function GetEstimatedDeliveryDate() {
    return new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
}

export function ValidateSignUpForm(formData, confirmPassword) {
    const errors = {};

    // Username validation
    if (!formData.username || formData.username.trim().length === 0) {
        errors.username = "Username is required";
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
        errors.username = "Username must be 3-20 characters long and can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!formData.email || formData.email.trim().length === 0) {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Invalid email format";
    }

    if (!(formData.password.trim() === confirmPassword.trim())) {
        errors.password = "Passwords do not match";
    } else {
        // Password validation
        if (!formData.password || formData.password.length === 0) {
            errors.password = "Password is required";
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,64}$/.test(formData.password)) {
            errors.password = "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character";
        }
    }

    // Phone validation
    if (!formData.phone || formData.phone.trim().length === 0) {
        errors.phone = "Phone number is required";
    } else if (!/^(01)[0-2,5]{1}[0-9]{8}$/.test(formData.phone)) {
        errors.phone = "Invalid phone number format. Use international format (e.g., 01(0-2,5)XXXXXXXXX)";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}

export function IsUserLoggedIn() {
    if ((localStorage.getItem("customerInfo") || (sessionStorage.getItem("customerInfo")) && Cookies.get('token')))
        return true;
    else
        return false;
}





