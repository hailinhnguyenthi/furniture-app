import { useEffect, useState } from "react";
import { useStore } from "../../../store/store";

// ─── Toast component ─────────────────────────────────────────────────────────
// Reads `toast` from store: { message, type } | null
// type: "success" | "error" | "info"

const COLORS = {
    success: { bg: "#F0F5EC", border: "#8FA67A", icon: "✓", text: "#4A2C1A" },
    error: { bg: "#FBF0ED", border: "#C47B5A", icon: "✕", text: "#4A2C1A" },
    info: { bg: "#FAF7F2", border: "#B7957F", icon: "i", text: "#4A2C1A" },
};

export default function Toast() {
    const { toast } = useStore();
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        if (!toast) {
            setVisible(false);
            setExiting(false);
            return;
        }
        setExiting(false);
        setVisible(true);
        // start exit animation 300ms before store clears it
        const exitTimer = setTimeout(() => setExiting(true), 2200);
        return () => clearTimeout(exitTimer);
    }, [toast]);

    if (!visible || !toast) return null;

    const msg = typeof toast === "string" ? toast : toast.message;
    const type = typeof toast === "string" ? "success" : (toast.type || "success");
    const c = COLORS[type] || COLORS.info;

    return (
        <>
            <style>{`
        @keyframes toastIn  { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes toastOut { from { opacity:1; transform:translateY(0) scale(1); } to { opacity:0; transform:translateY(8px) scale(0.97); } }
        .toast-enter { animation: toastIn  0.28s cubic-bezier(0.22,1,0.36,1) forwards; }
        .toast-exit  { animation: toastOut 0.22s ease-in forwards; }
      `}</style>
            <div
                className={exiting ? "toast-exit" : "toast-enter"}
                style={{
                    position: "fixed",
                    bottom: 32,
                    right: 32,
                    zIndex: 9999,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    borderRadius: 8,
                    padding: "14px 20px",
                    minWidth: 260,
                    maxWidth: 380,
                    boxShadow: "0 8px 32px rgba(74,44,26,0.10)",
                    fontFamily: "'Poppins', sans-serif",
                }}
                role="alert"
                aria-live="polite"
            >
                {/* Icon */}
                <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: c.border,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                }}>
                    {c.icon}
                </div>

                {/* Message */}
                <p style={{
                    margin: 0,
                    fontSize: 13,
                    color: c.text,
                    lineHeight: 1.5,
                    flex: 1,
                }}>
                    {msg}
                </p>
            </div>
        </>
    );
}