const BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

async function req(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

/** Tạo đơn hàng mới */
export async function createOrder(payload) {
    return req("/orders", { method: "POST", body: JSON.stringify(payload) });
}

/** Lấy lịch sử đơn hàng của user hiện tại */
export async function getMyOrders({ status, page = 1, limit = 10 } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.set("status", status);
    return req(`/orders/my?${params}`);
}

/** Chi tiết một đơn hàng */
export async function getOrderDetail(orderCode) {
    return req(`/orders/my/${orderCode}`);
}

/** Huỷ đơn hàng */
export async function cancelOrder(orderCode, reason = "") {
    return req(`/orders/my/${orderCode}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
    });
}

// ─── Voucher ──────────────────────────────────────────────────────────────────

/** Kiểm tra và tính giảm giá từ voucher */
export async function validateVoucher(code, orderTotal) {
    return req("/orders/validate-voucher", {
        method: "POST",
        body: JSON.stringify({ code, orderTotal }),
    });
}

// ─── Products ─────────────────────────────────────────────────────────────────

/** Tìm kiếm + lọc sản phẩm */
export async function fetchProducts({ q, category, minPrice, maxPrice, sort, page, limit } = {}) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);
    if (page) params.set("page", page);
    if (limit) params.set("limit", limit);
    return req(`/products?${params}`);
}

/** Chi tiết sản phẩm */
export async function fetchProductDetail(id) {
    return req(`/products/${id}`);
}