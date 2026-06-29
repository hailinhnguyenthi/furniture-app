import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Thư mục lưu ảnh ─────────────────────────────────────────────────────────
const UPLOAD_DIR = join(__dirname, "../../uploads/products");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ─── Storage ──────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const name = `${uuidv4()}${ext}`;
        cb(null, name);
    },
});

// ─── Filter: chỉ cho phép ảnh ─────────────────────────────────────────────────
const fileFilter = (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Chỉ chấp nhận file JPG, PNG, WebP, GIF"), false);
    }
};

// ─── Upload instance ──────────────────────────────────────────────────────────
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,  // 5MB per file — FR-08
        files: 10,                // tối đa 10 ảnh 1 lần
    },
});

// ─── Error handler cho multer ─────────────────────────────────────────────────
export function handleUploadError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "File quá lớn. Tối đa 5MB mỗi ảnh." });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({ message: "Tối đa 10 ảnh mỗi lần upload." });
        }
        return res.status(400).json({ message: err.message });
    }
    if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
}

// ─── Helper: xoá file khi cần ─────────────────────────────────────────────────
export function deleteFile(filename) {
    const filePath = join(UPLOAD_DIR, filename);
    fs.unlink(filePath, (err) => {
        if (err && err.code !== "ENOENT") console.error("Delete file error:", err.message);
    });
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export const uploadSingle = upload.single("image");
export const uploadMultiple = upload.array("images", 10);
export default upload;