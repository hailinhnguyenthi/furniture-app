import crypto from "crypto";

// ─── Create VNPay Payment URL ───────────────────────────────────────────
export function createVNPayPaymentUrl({
  amount,
  orderCode,
  orderDescription,
  returnUrl,
  ipAddress,
  tmnCode,
  hashSecret,
  vnpayUrl,
}) {
  const date = new Date();
  const createDate = formatDate(date);
  const expireDate = formatDate(new Date(date.getTime() + 15 * 60000)); // 15 minutes

  const params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderCode,
    vnp_OrderInfo: encodeURIComponent(orderDescription),
    vnp_OrderType: "other",
    vnp_Amount: amount * 100, // VNPay requires amount in smallest unit
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddress,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  // Sort params and build signature
  const sortedParams = sortObject(params);
  const signData = buildSignData(sortedParams);
  const hmac = crypto
    .createHmac("sha512", hashSecret)
    .update(signData)
    .digest("hex");

  const paymentUrl =
    vnpayUrl +
    "?" +
    querystring(sortedParams) +
    "&vnp_SecureHash=" +
    hmac;

  return paymentUrl;
}

// ─── Verify VNPay Response ──────────────────────────────────────────────
export function verifyVNPayResponse(vnpParams, hashSecret) {
  const secureHash = vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHashType;

  const sortedParams = sortObject(vnpParams);
  const signData = buildSignData(sortedParams);
  const hmac = crypto
    .createHmac("sha512", hashSecret)
    .update(signData)
    .digest("hex");

  return hmac === secureHash;
}

// ─── Parse Response Data ────────────────────────────────────────────────
export function parseVNPayResponse(data) {
  return {
    amount: data.vnp_Amount / 100,
    orderCode: data.vnp_TxnRef,
    responseCode: data.vnp_ResponseCode,
    transactionNo: data.vnp_TransactionNo,
    bankCode: data.vnp_BankCode,
    payDate: data.vnp_PayDate,
    message: getResponseMessage(data.vnp_ResponseCode),
    isSuccess: data.vnp_ResponseCode === "00",
  };
}

// ─── Helper Functions ───────────────────────────────────────────────────
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return year + month + day + hours + minutes + seconds;
}

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();

  keys.forEach((key) => {
    sorted[key] = obj[key];
  });

  return sorted;
}

function buildSignData(data) {
  const keys = Object.keys(data);
  let signData = "";

  keys.forEach((key) => {
    if (signData !== "") {
      signData += "&";
    }
    signData += key + "=" + String(data[key]);
  });

  return signData;
}

function querystring(data) {
  const keys = Object.keys(data);
  let queryStr = "";

  keys.forEach((key) => {
    if (queryStr !== "") {
      queryStr += "&";
    }
    queryStr += key + "=" + String(data[key]);
  });

  return queryStr;
}

function getResponseMessage(code) {
  const messages = {
    "00": "Giao dịch thành công",
    "01": "Gọi API không hợp lệ",
    "02": "Merchant invalid",
    "03": "Dữ liệu gửi đi không hợp lệ",
    "04": "Merchant được khóa",
    "05": "Giao dịch không tồn tại",
    "06": "Giao dịch đã được hoàn tiền",
    "07": "Giao dịch bị từ chối",
    "08": "URI là bắt buộc",
    "09": "Merchant tên không hợp lệ",
    "10": "Yêu cầu HTTP không hợp lệ",
    "11": "Sai checksum",
    "12": "Ngày giao dịch không hợp lệ",
    "13": "Số tiền không hợp lệ",
    "14": "Số lần gọi API vượt quá giới hạn",
    "15": "Tài khoản bị khóa",
    "99": "Lỗi không xác định",
  };

  return messages[code] || "Lỗi không xác định";
}
