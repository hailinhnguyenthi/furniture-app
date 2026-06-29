import { useState, useEffect } from "react";
import { useStore } from "../../../store/store";
import FadeUp from "../components/FadeUp";

const C = { cream: "#FAF7F2", beige: "#F0E8DC", dark: "#4A2C1A", wood: "#8B5E3C", sand: "#D9C9B0", tan: "#C4A882" };
const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/blog`;

// ─── Mock data — hiển thị khi chưa có MongoDB ─────────────────────────────────
const MOCK_POSTS = [
    { _id: "1", slug: "tropical-concept", title: "5 Ý tưởng trang trí phòng khách Tropical", excerpt: "Khám phá cách mang hơi thở nhiệt đới vào không gian sống với những gợi ý nội thất độc đáo.", coverImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600", tags: ["tropical", "living room"], category: "Ý tưởng nội thất", createdAt: new Date().toISOString() },
    { _id: "2", slug: "matcha-concept", title: "Matcha Concept — Xu hướng nội thất xanh lá 2024", excerpt: "Màu xanh matcha đang là lựa chọn hàng đầu cho không gian hiện đại và bình yên.", coverImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=600", tags: ["matcha", "trend"], category: "Xu hướng", createdAt: new Date().toISOString() },
    { _id: "3", slug: "chon-ban-an", title: "Cách chọn bàn ăn phù hợp với diện tích bếp", excerpt: "Hướng dẫn chi tiết giúp bạn tìm chiếc bàn ăn hoàn hảo cho mọi kích thước không gian.", coverImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600", tags: ["kitchen", "tips"], category: "Hướng dẫn", createdAt: new Date().toISOString() },
    { _id: "4", slug: "phong-ngu-toi-gian", title: "Phòng ngủ tối giản — Bí quyết không gian nghỉ lý tưởng", excerpt: "Minimalism giúp bạn cảm thấy thư thái và cân bằng hơn mỗi ngày.", coverImage: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600", tags: ["bedroom", "minimal"], category: "Ý tưởng nội thất", createdAt: new Date().toISOString() },
    { _id: "5", slug: "cay-noi-that", title: "Top 10 cây nội thất thanh lọc không khí", excerpt: "Cây xanh trong nhà không chỉ trang trí mà còn mang lại lợi ích sức khỏe tuyệt vời.", coverImage: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600", tags: ["plants", "decor"], category: "Mẹo hay", createdAt: new Date().toISOString() },
    { _id: "6", slug: "luu-tru-thong-minh", title: "Giải pháp lưu trữ thông minh cho căn hộ nhỏ", excerpt: "Những ý tưởng sáng tạo tối ưu không gian, tạo sự gọn gàng cho mọi góc nhà.", coverImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600", tags: ["storage", "tips"], category: "Hướng dẫn", createdAt: new Date().toISOString() },
];

const ALL_TAGS = [...new Set(MOCK_POSTS.flatMap(p => p.tags))];

export default function BlogPage() {
    const { navigate } = useStore();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTag, setActiveTag] = useState("");
    const [detail, setDetail] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch(`${API}?limit=12`, { credentials: "include" })
            .then(r => r.json())
            .then(d => setPosts(d.success ? d.posts : MOCK_POSTS))
            .catch(() => setPosts(MOCK_POSTS))
            .finally(() => setLoading(false));
    }, []);

    const openPost = async (post) => {
        // Try fetch full content
        fetch(`${API}/${post.slug}`, { credentials: "include" })
            .then(r => r.json())
            .then(d => d.success && setDetail(d.post))
            .catch(() => setDetail(post));
        setDetail(post);  // show immediately with excerpt
    };

    const filtered = posts.filter(p => {
        const matchTag = !activeTag || p.tags?.includes(activeTag);
        const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
        return matchTag && matchSearch;
    });

    // ── Detail view ────────────────────────────────────────────────────────
    if (detail) {
        return (
            <div style={{ background: C.cream, minHeight: "100vh" }}>
                {/* Hero */}
                <div style={{ position: "relative", height: 360, overflow: "hidden" }}>
                    <img src={detail.coverImage} alt={detail.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(74,44,26,0.7))" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px" }}>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>{detail.category}</p>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, color: "#fff", margin: "0 0 12px", maxWidth: 720 }}>
                            {detail.title}
                        </h1>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                                {new Date(detail.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}
                            </span>
                            {detail.tags?.map(tag => (
                                <span key={tag} style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: 12 }}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 40px" }}>
                    <button onClick={() => setDetail(null)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.wood, marginBottom: 32, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
                        ← Quay lại Inspirations
                    </button>

                    <div style={{ fontSize: 15, lineHeight: 1.9, color: "#555", fontFamily: "'Poppins', sans-serif" }}
                        dangerouslySetInnerHTML={{ __html: detail.content || `<p>${detail.excerpt}</p><p>Nội dung bài viết đang được cập nhật...</p>` }} />
                </div>
            </div>
        );
    }

    // ── List view ──────────────────────────────────────────────────────────
    return (
        <div style={{ background: C.cream, minHeight: "100vh" }}>

            {/* Hero */}
            <div style={{ position: "relative", background: C.beige, borderBottom: `1px solid ${C.sand}`, padding: "56px 40px 40px", textAlign: "center", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(139,94,60,0.06)" }} />
                <FadeUp>
                    <p style={{ fontSize: 11, fontWeight: 700, color: C.wood, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 12 }}>Inspirations</p>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 700, color: C.dark, margin: "0 0 12px" }}>
                        Ý tưởng nội thất
                    </h1>
                    <p style={{ fontSize: 14, color: "#888", maxWidth: 480, margin: "0 auto" }}>
                        Khám phá các xu hướng, mẹo thiết kế và ý tưởng sắp xếp không gian sống đẹp hơn mỗi ngày.
                    </p>
                </FadeUp>
            </div>

            {/* Filter bar */}
            <div style={{ background: "#fff", borderBottom: `1px solid ${C.sand}`, padding: "16px 40px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                {/* Search */}
                <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
                    <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.wood} strokeWidth="2" strokeLinecap="round">
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input type="search" placeholder="Tìm bài viết..." value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: "100%", paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: `1px solid ${C.sand}`, borderRadius: 6, fontSize: 13, outline: "none", fontFamily: "'Poppins', sans-serif" }} />
                </div>

                {/* Tags */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => setActiveTag("")}
                        style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${!activeTag ? C.dark : C.sand}`, background: !activeTag ? C.dark : "#fff", color: !activeTag ? "#fff" : "#888", fontFamily: "'Poppins', sans-serif" }}>
                        Tất cả
                    </button>
                    {ALL_TAGS.map(tag => (
                        <button key={tag} onClick={() => setActiveTag(tag === activeTag ? "" : tag)}
                            style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${activeTag === tag ? C.wood : C.sand}`, background: activeTag === tag ? C.wood : "#fff", color: activeTag === tag ? "#fff" : "#888", fontFamily: "'Poppins', sans-serif", textTransform: "capitalize" }}>
                            #{tag}
                        </button>
                    ))}
                </div>

                <span style={{ marginLeft: "auto", fontSize: 12, color: "#bbb" }}>{filtered.length} bài viết</span>
            </div>

            {/* Grid */}
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 40px 60px" }}>
                {loading ? (
                    <p style={{ color: "#bbb", textAlign: "center", padding: 60 }}>Đang tải bài viết...</p>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 60 }}>
                        <p style={{ fontSize: 16, color: C.dark }}>Không tìm thấy bài viết</p>
                        <button onClick={() => { setSearch(""); setActiveTag(""); }} style={{ marginTop: 12, background: C.wood, color: "#fff", border: "none", borderRadius: 6, padding: "10px 24px", fontSize: 13, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                            Xem tất cả
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 28 }}>
                        {filtered.map((post) => (
                            <FadeUp key={post._id}>
                                <article
                                    onClick={() => openPost(post)}
                                    style={{ background: "#fff", borderRadius: 10, overflow: "hidden", cursor: "pointer", border: `1px solid ${C.sand}`, transition: "transform 0.2s, box-shadow 0.2s" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(74,44,26,0.10)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                                >
                                    {/* Cover */}
                                    <div style={{ height: 200, overflow: "hidden", background: C.beige, position: "relative" }}>
                                        <img src={post.coverImage} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                                            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                                            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")} />
                                        <span style={{ position: "absolute", top: 12, left: 12, fontSize: 10, fontWeight: 700, color: C.wood, background: "rgba(255,255,255,0.92)", padding: "3px 10px", borderRadius: 12, letterSpacing: "0.05em" }}>
                                            {post.category}
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div style={{ padding: "20px 20px 24px" }}>
                                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 700, color: C.dark, margin: "0 0 10px", lineHeight: 1.4 }}>
                                            {post.title}
                                        </h2>
                                        <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7, margin: "0 0 16px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                            {post.excerpt}
                                        </p>

                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                {post.tags?.slice(0, 2).map(tag => (
                                                    <span key={tag} style={{ fontSize: 10, color: C.wood, background: C.beige, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <span style={{ fontSize: 11, color: "#bbb" }}>
                                                {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            </FadeUp>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}