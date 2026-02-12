import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, RadialBarChart, RadialBar } from "recharts";

// ===== PRODUCT DATA (synced from MANIFEST.md) =====
const PRODUCTS = [
  {
    id: 1,
    slug: "new-manager-kit",
    name: "The New Manager's 90-Day Kit",
    brand: "LeaderLaunch",
    price: 29,
    category: "Management",
    status: "live",
    stripeProductId: "prod_Txyc3z80uM5ref",
    stripePriceId: "price_1T02f8Q32c2nzfSVq4hgzhaG",
    paymentLink: "https://buy.stripe.com/7sYaEZ8YE15r6HY3qgaIM03",
    vercelUrl: "pending",
    pages: 14,
    createdDate: "2026-02-12",
  },
  { id: 2, slug: "homebuyer-checklist", name: "First-Time Homebuyer Checklist Kit", brand: "HomeReady", price: 19, category: "Real Estate", status: "queued", createdDate: null },
  { id: 3, slug: "small-business-sop", name: "Small Business SOP Template Pack", brand: "OpsReady", price: 39, category: "Business", status: "queued", createdDate: null },
  { id: 4, slug: "wedding-planning-kit", name: "Wedding Planning Timeline & Checklist", brand: "EverAfter", price: 14, category: "Lifestyle", status: "queued", createdDate: null },
  { id: 5, slug: "osha-safety-pack", name: "OSHA Safety Training Quick-Reference", brand: "SafetyFirst", price: 29, category: "Compliance", status: "queued", createdDate: null },
  { id: 6, slug: "airbnb-host-kit", name: "The Airbnb Host Startup Kit", brand: "HostPro", price: 29, category: "Real Estate", status: "queued", createdDate: null },
  { id: 7, slug: "real-estate-listing", name: "Real Estate Listing Presentation Templates", brand: "AgentEdge", price: 39, category: "Real Estate", status: "queued", createdDate: null },
  { id: 8, slug: "freelancer-onboarding", name: "Freelancer Client Onboarding Pack", brand: "IndieReady", price: 19, category: "Business", status: "queued", createdDate: null },
  { id: 9, slug: "teacher-sub-plans", name: "Substitute Teacher Plan Template Bundle", brand: "ClassReady", price: 14, category: "Education", status: "queued", createdDate: null },
  { id: 10, slug: "rental-inspection", name: "Rental Property Inspection Checklist Kit", brand: "PropertyPro", price: 19, category: "Real Estate", status: "queued", createdDate: null },
];

const STATUS_CONFIG = {
  live: { color: "#34d399", label: "Live", glow: "0 0 12px rgba(52,211,153,0.4)" },
  built: { color: "#60a5fa", label: "Built", glow: "0 0 12px rgba(96,165,250,0.4)" },
  queued: { color: "#475569", label: "Queued", glow: "none" },
  paused: { color: "#f59e0b", label: "Paused", glow: "0 0 12px rgba(245,158,11,0.4)" },
};

const CATEGORY_COLORS = {
  Management: "#c8973e",
  "Real Estate": "#60a5fa",
  Business: "#34d399",
  Lifestyle: "#f472b6",
  Compliance: "#fb923c",
  Education: "#a78bfa",
};

// ===== ANIMATED NUMBER =====
function AnimNum({ target, prefix = "", suffix = "", duration = 1200 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ===== PROGRESS RING =====
function ProgressRing({ value, max, size = 120, stroke = 10, color = "#c8973e", label, sublabel }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = value / max;
  const [offset, setOffset] = useState(circumference);
  
  useEffect(() => {
    const timer = setTimeout(() => setOffset(circumference * (1 - pct)), 100);
    return () => clearTimeout(timer);
  }, [pct, circumference]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }} />
      </svg>
      <div style={{ position: "relative", marginTop: -size/2 - 18, textAlign: "center", height: size/2 + 18 }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "var(--display)" }}>
          <AnimNum target={value} />
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{sublabel}</div>
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

// ===== PIPELINE NODE =====
function PipelineNode({ product, index, isLast }) {
  const st = STATUS_CONFIG[product.status];
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80 * index);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 0,
      opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-20px)",
      transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.03)", border: `1px solid ${product.status === "live" ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 16, padding: "16px 20px", width: 260, position: "relative",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
            color: st.color, background: `${st.color}15`, padding: "3px 10px", borderRadius: 100,
          }}>{st.label}</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "var(--display)" }}>${product.price}</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 3, lineHeight: 1.3 }}>{product.name}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            fontSize: 10, color: CATEGORY_COLORS[product.category] || "#888",
            fontWeight: 600,
          }}>● {product.category}</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{product.brand}</span>
        </div>
      </div>
      {!isLast && (
        <div style={{ width: 32, height: 2, background: `linear-gradient(90deg, ${st.color}40, rgba(255,255,255,0.06))` }} />
      )}
    </div>
  );
}

// ===== CUSTOM TOOLTIP =====
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1e1e38", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
      padding: "10px 14px", fontSize: 12, color: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontSize: 11 }}>{p.name}: {typeof p.value === 'number' && p.name !== 'Products' ? `$${p.value}` : p.value}</div>
      ))}
    </div>
  );
}

// ===== MAIN DASHBOARD =====
export default function CommandCenter() {
  const [activeView, setActiveView] = useState("overview");
  
  const liveProducts = PRODUCTS.filter(p => p.status === "live");
  const builtProducts = PRODUCTS.filter(p => p.status === "built");
  const queuedProducts = PRODUCTS.filter(p => p.status === "queued");
  
  const totalPotentialMonthly = PRODUCTS.reduce((s, p) => s + p.price * 5, 0);
  const totalPortfolioValue = PRODUCTS.reduce((s, p) => s + p.price, 0);
  const avgPrice = Math.round(totalPortfolioValue / PRODUCTS.length);
  
  // Category distribution
  const categories = {};
  PRODUCTS.forEach(p => { categories[p.category] = (categories[p.category] || 0) + 1; });
  const categoryData = Object.entries(categories).map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] || "#888" }));

  // Price distribution
  const priceRanges = [
    { range: "$10–19", count: PRODUCTS.filter(p => p.price >= 10 && p.price <= 19).length, fill: "#60a5fa" },
    { range: "$20–29", count: PRODUCTS.filter(p => p.price >= 20 && p.price <= 29).length, fill: "#c8973e" },
    { range: "$30–39", count: PRODUCTS.filter(p => p.price >= 30 && p.price <= 39).length, fill: "#34d399" },
    { range: "$40+", count: PRODUCTS.filter(p => p.price >= 40).length, fill: "#a78bfa" },
  ];

  // Revenue projection (5 sales/mo per live product, scaling over months)
  const revenueProjection = Array.from({ length: 12 }, (_, i) => {
    const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i];
    const productsLive = Math.min(PRODUCTS.length, Math.ceil((i + 1) * 1.2));
    const avgSales = 3 + i * 0.8;
    const revenue = Math.round(productsLive * avgPrice * avgSales);
    return { month, revenue, products: productsLive };
  });

  // Pipeline status for radial
  const pipelineRadial = [
    { name: "Queued", value: (queuedProducts.length / PRODUCTS.length) * 100, fill: "#475569" },
    { name: "Built", value: ((builtProducts.length) / PRODUCTS.length) * 100, fill: "#60a5fa" },
    { name: "Live", value: (liveProducts.length / PRODUCTS.length) * 100, fill: "#34d399" },
  ];

  const navItems = [
    { id: "overview", label: "Overview" },
    { id: "pipeline", label: "Pipeline" },
    { id: "projections", label: "Projections" },
  ];

  return (
    <div style={{
      "--display": "'Bricolage Grotesque', 'DM Sans', system-ui, sans-serif",
      "--body": "'DM Sans', system-ui, sans-serif",
      minHeight: "100vh",
      background: "#0c0c1d",
      color: "#fff",
      fontFamily: "var(--body)",
      position: "relative",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      {/* Ambient background */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse at 20% 0%, rgba(200,151,62,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(96,165,250,0.04) 0%, transparent 50%)",
      }} />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 1, padding: "32px 40px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%", background: "#34d399",
                boxShadow: "0 0 12px rgba(52,211,153,0.5)", animation: "pulse 2s infinite",
              }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Product Factory</span>
            </div>
            <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
              Command Center
            </h1>
          </div>
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 4 }}>
            {navItems.map(n => (
              <button key={n.id} onClick={() => setActiveView(n.id)} style={{
                padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer",
                background: activeView === n.id ? "rgba(200,151,62,0.15)" : "transparent",
                color: activeView === n.id ? "#c8973e" : "rgba(255,255,255,0.4)",
                fontFamily: "var(--body)", fontSize: 13, fontWeight: 600,
                transition: "all 0.2s ease",
              }}>{n.label}</button>
            ))}
          </div>
        </div>

        {/* KPI Rings */}
        <div style={{ display: "flex", justifyContent: "center", gap: "clamp(24px, 5vw, 64px)", padding: "40px 0 32px", flexWrap: "wrap" }}>
          <ProgressRing value={liveProducts.length} max={PRODUCTS.length} color="#34d399" label="Products Live" sublabel={`of ${PRODUCTS.length}`} />
          <ProgressRing value={totalPortfolioValue} max={500} size={120} color="#c8973e" label="Portfolio Value" sublabel="per sale" />
          <ProgressRing value={avgPrice} max={50} size={120} color="#60a5fa" label="Avg Price Point" sublabel="per product" />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ position: "relative", zIndex: 1, padding: "0 40px 40px" }}>
        
        {activeView === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24 }}>
            {/* Category Breakdown */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20, padding: 28,
            }}>
              <h3 style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 700, margin: "0 0 24px", color: "rgba(255,255,255,0.7)" }}>
                Category Mix
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {categoryData.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{c.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginLeft: "auto" }}>{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Distribution */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20, padding: 28,
            }}>
              <h3 style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 700, margin: "0 0 24px", color: "rgba(255,255,255,0.7)" }}>
                Price Distribution
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={priceRanges} barCategoryGap="25%">
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Products" radius={[8, 8, 0, 0]}>
                    {priceRanges.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Status Breakdown */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20, padding: 28, gridColumn: "1 / -1",
            }}>
              <h3 style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: "rgba(255,255,255,0.7)" }}>
                Factory Status
              </h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "0 0 20px" }}>Build pipeline progress</p>
              <div style={{ display: "flex", gap: 4, height: 40, borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,0.03)" }}>
                {liveProducts.length > 0 && (
                  <div style={{
                    flex: liveProducts.length, background: "linear-gradient(135deg, #34d399, #2dd4a0)", borderRadius: "12px 0 0 12px",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#0c0c1d",
                    minWidth: 60,
                  }}>{liveProducts.length} Live</div>
                )}
                {builtProducts.length > 0 && (
                  <div style={{
                    flex: builtProducts.length, background: "linear-gradient(135deg, #60a5fa, #3b82f6)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#0c0c1d",
                    minWidth: 60,
                  }}>{builtProducts.length} Built</div>
                )}
                <div style={{
                  flex: queuedProducts.length, background: "rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)",
                  borderRadius: liveProducts.length === 0 && builtProducts.length === 0 ? 12 : "0 12px 12px 0",
                }}>{queuedProducts.length} Queued</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{Math.round((liveProducts.length / PRODUCTS.length) * 100)}% live</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{PRODUCTS.length} total products</span>
              </div>
            </div>
          </div>
        )}

        {activeView === "pipeline" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Product Pipeline</h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0 }}>Every product in the factory, from queued to live</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {[...PRODUCTS].sort((a, b) => {
                const order = { live: 0, built: 1, queued: 2, paused: 3 };
                return order[a.status] - order[b.status];
              }).map((p, i) => (
                <PipelineNode key={p.id} product={p} index={i} isLast={i === PRODUCTS.length - 1} />
              ))}
            </div>
          </div>
        )}

        {activeView === "projections" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24 }}>
            {/* Revenue Projection */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20, padding: 28, gridColumn: "1 / -1",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <h3 style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Revenue Projection</h3>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0 }}>Conservative estimate: 3–12 sales/product/month as catalog grows</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Month 12 Target</div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 800, color: "#c8973e" }}>
                    ${revenueProjection[11].revenue.toLocaleString()}<span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>/mo</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueProjection}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c8973e" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#c8973e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#c8973e" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Per Product */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20, padding: 28,
            }}>
              <h3 style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "rgba(255,255,255,0.7)" }}>
                Revenue per Product
              </h3>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: "0 0 20px" }}>At 5 sales/month each</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[...PRODUCTS].sort((a, b) => b.price - a.price).slice(0, 6).map((p, i) => {
                  const monthly = p.price * 5;
                  const maxMonthly = 39 * 5;
                  return (
                    <div key={p.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>${monthly}/mo</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${(monthly / maxMonthly) * 100}%`, borderRadius: 3,
                          background: `linear-gradient(90deg, ${CATEGORY_COLORS[p.category] || "#c8973e"}, ${CATEGORY_COLORS[p.category] || "#c8973e"}aa)`,
                          transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scale Milestones */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20, padding: 28,
            }}>
              <h3 style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 700, margin: "0 0 20px", color: "rgba(255,255,255,0.7)" }}>
                Scale Milestones
              </h3>
              {[
                { target: 10, label: "First 10 Products", desc: "Foundation catalog", revenue: "$1,300/mo" },
                { target: 25, label: "25 Products", desc: "Niche authority", revenue: "$3,250/mo" },
                { target: 50, label: "50 Products", desc: "Portfolio scale", revenue: "$6,500/mo" },
                { target: 100, label: "100 Products", desc: "Passive income engine", revenue: "$13,000/mo" },
              ].map((m, i) => {
                const pct = Math.min(100, (PRODUCTS.length / m.target) * 100);
                return (
                  <div key={i} style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: pct >= 100 ? "#34d399" : "#fff" }}>{m.label}</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>{m.desc}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#c8973e" }}>{m.revenue}</span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${pct}%`, borderRadius: 3,
                        background: pct >= 100 ? "linear-gradient(90deg, #34d399, #2dd4a0)" : "linear-gradient(90deg, #c8973e, #c8973eaa)",
                        transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>
    </div>
  );
}
