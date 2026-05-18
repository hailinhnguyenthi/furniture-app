import { useEffect, useState } from "react";
import { useStore } from "../../../store/store";
import { checkPaymentStatus } from "../services/paymentService";

const colors = {
  cream: "#FAF7F2",
  beige: "#F0E8DC",
  dark: "#4A2C1A",
  wood: "#8B5E3C",
  success: "#6B7C5C",
  error: "#C47B5A",
};

export default function PaymentReturn() {
  const { setPage } = useStore();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPayment = async () => {
      try {
        // Get order code from URL
        const params = new URLSearchParams(window.location.search);
        const orderCode = params.get("vnp_TxnRef");

        if (!orderCode) {
          setPaymentStatus({
            success: false,
            message: "Không tìm thấy mã đơn hàng",
          });
          setLoading(false);
          return;
        }

        // Check payment status
        const result = await checkPaymentStatus(orderCode);
        setPaymentStatus(result);
      } catch (error) {
        console.error("Error checking payment status:", error);
        setPaymentStatus({
          success: false,
          message: "Lỗi kiểm tra trạng thái thanh toán",
        });
      } finally {
        setLoading(false);
      }
    };

    checkPayment();
  }, []);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.spinner}>⏳</div>
          <p style={styles.text}>Đang xử lý thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {paymentStatus?.success ? (
          // SUCCESS
          <>
            <div style={styles.successIcon}>✓</div>
            <h1 style={styles.title}>Thanh toán thành công!</h1>
            <div style={styles.infoBox}>
              <div style={styles.infoRow}>
                <span>Mã đơn hàng:</span>
                <strong>{paymentStatus.orderCode}</strong>
              </div>
              <div style={styles.infoRow}>
                <span>Số tiền:</span>
                <strong>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(paymentStatus.amount)}
                </strong>
              </div>
              <div style={styles.infoRow}>
                <span>Mã giao dịch:</span>
                <strong>{paymentStatus.transactionNo}</strong>
              </div>
              <div style={styles.infoRow}>
                <span>Thời gian:</span>
                <strong>{paymentStatus.payDate}</strong>
              </div>
            </div>
            <p style={styles.message}>
              Cảm ơn bạn đã mua hàng. Chúng tôi sẽ gửi hàng trong vòng 24h.
            </p>
          </>
        ) : (
          // FAILED
          <>
            <div style={styles.errorIcon}>✕</div>
            <h1 style={styles.title}>Thanh toán thất bại</h1>
            <p style={styles.message}>{paymentStatus?.message}</p>
            <div style={styles.infoBox}>
              <div style={styles.infoRow}>
                <span>Mã đơn hàng:</span>
                <strong>{paymentStatus?.orderCode}</strong>
              </div>
              <div style={styles.infoRow}>
                <span>Trạng thái:</span>
                <strong style={{ color: colors.error }}>
                  {paymentStatus?.message}
                </strong>
              </div>
            </div>
            <p style={styles.message}>
              Vui lòng kiểm tra lại thông tin thanh toán hoặc liên hệ hỗ trợ.
            </p>
          </>
        )}

        {/* Buttons */}
        <div style={styles.buttonGroup}>
          <button
            onClick={() => {
              setPage("cart");
            }}
            style={{
              ...styles.button,
              backgroundColor: colors.wood,
              color: "#fff",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            Quay lại giỏ hàng
          </button>
          <button
            onClick={() => {
              setPage("home");
            }}
            style={{
              ...styles.button,
              backgroundColor: colors.beige,
              color: colors.dark,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: colors.cream,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
  },
  container: {
    maxWidth: 600,
    background: "#fff",
    borderRadius: 16,
    padding: 60,
    textAlign: "center",
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
  },
  spinner: {
    fontSize: 48,
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 64,
    color: colors.success,
    marginBottom: 20,
    fontWeight: "bold",
  },
  errorIcon: {
    fontSize: 64,
    color: colors.error,
    marginBottom: 20,
    fontWeight: "bold",
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 32,
    fontWeight: 600,
    color: colors.dark,
    marginBottom: 20,
    margin: 0,
  },
  infoBox: {
    background: colors.beige,
    borderRadius: 8,
    padding: 20,
    margin: "20px 0",
    textAlign: "left",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 12,
    borderBottom: `1px solid ${colors.cream}`,
    fontSize: 14,
  },
  message: {
    fontSize: 15,
    color: "#666",
    lineHeight: 1.6,
    marginBottom: 30,
  },
  buttonGroup: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
  },
  button: {
    padding: "12px 28px",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.3s",
    flex: 1,
  },
  text: {
    fontSize: 16,
    color: colors.dark,
  },
};
