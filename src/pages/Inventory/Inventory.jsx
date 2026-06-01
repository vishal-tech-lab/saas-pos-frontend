export default function InventoryHub({ navigate }) {
  const cards = [
    {
      icon: "ti-box",
      title: "Branch Stock",
      desc: "Monitor real-time stock levels across every branch and kitchen location.",
      tag: "Stock levels",
page: "branchstock",
      bar: "#7C5CFC",
      iconBg: "#F4F3FF",
      iconColor: "#7C5CFC",
      tagBg: "#F4F3FF",
      tagColor: "#534AB7",
    },
    {
      icon: "ti-transfer",
      title: "Stock Transfer",
      desc: "Move inventory between branches with full audit trail and quantity tracking.",
      tag: "Transfers",
page: "stocktransfer",
      bar: "#0F6E56",
      iconBg: "#E1F5EE",
      iconColor: "#0F6E56",
      tagBg: "#E1F5EE",
      tagColor: "#085041",
    },
    {
      icon: "ti-tools-kitchen-2",
      title: "Kitchen Production",
      desc: "Log and track food production output from all central kitchen branches.",
      tag: "Production",
page: "kitchen",
      bar: "#BA7517",
      iconBg: "#FAEEDA",
      iconColor: "#BA7517",
      tagBg: "#FAEEDA",
      tagColor: "#633806",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/tabler-icons.min.css');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F4F3FF; font-family: 'DM Sans', sans-serif; }
        .inv-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #EDE9FE;
          overflow: hidden;
          cursor: pointer;
          transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
        }
        .inv-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(124,92,252,0.12);
        }
        .inv-card:hover .card-arrow {
          background: #7C5CFC !important;
          color: #fff !important;
          border-color: #7C5CFC !important;
        }
        .card-arrow {
          transition: all .2s;
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#F4F3FF", fontFamily: "'DM Sans', sans-serif" }}>

        {/* NAV */}
        <div style={{ background: "#fff", borderBottom: "1px solid #EDE9FE", height: 52, display: "flex", alignItems: "center", padding: "0 24px", gap: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: "#7C5CFC", letterSpacing: -0.5 }}>
            NextGen<span style={{ color: "#0F172A" }}>POS</span>
          </div>
          <div style={{ display: "flex", gap: 20, marginLeft: 16 }}>
            {["Dashboard", "Orders", "Kitchen", "Inventory", "Settings"].map(n => (
              <span key={n} style={{ fontSize: 13, color: n === "Inventory" ? "#7C5CFC" : "#94A3B8", fontWeight: n === "Inventory" ? 700 : 500, cursor: "pointer" }}>{n}</span>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "44px 24px 60px" }}>

          {/* EYEBROW + TITLE */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#7C5CFC" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#7C5CFC", letterSpacing: "0.8px", textTransform: "uppercase" }}>Inventory</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", letterSpacing: -0.6, marginBottom: 4 }}>Manage Inventory</h1>
          <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 32 }}>Select a module to get started</p>

          {/* CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {cards.map(c => (
              <div
                key={c.title}
                className="inv-card"
onClick={() => navigate(c.page)}              >
                {/* coloured top bar */}
                <div style={{ height: 4, background: c.bar }} />

                <div style={{ padding: "24px 24px 22px" }}>
                  {/* icon */}
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: c.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <i className={`ti ${c.icon}`} style={{ fontSize: 22, color: c.iconColor }} aria-hidden="true" />
                  </div>

                  <div style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", letterSpacing: -0.3, marginBottom: 6 }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.65, marginBottom: 20 }}>{c.desc}</div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.4px", padding: "4px 10px", borderRadius: 20, background: c.tagBg, color: c.tagColor, textTransform: "uppercase" }}>
                      {c.tag}
                    </span>
                    <div className="card-arrow" style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid #E2E8F0", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#64748B" }}>
                      →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}