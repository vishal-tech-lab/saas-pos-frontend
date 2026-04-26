import React from "react";

function ReportLayout({ 
  title = "SALES BILL", 
  headerData = {}, 
  tableHeaders = [], 
  tableRows = [], 
  footerData = {},
  balanceData = {},
  billSummary = {}
}) {
  const getCurrentDate = () => new Date().toLocaleDateString("en-IN", { 
    day: "2-digit", month: "2-digit", year: "numeric" 
  });

  const formatCurrency = (amt) => {
    const amount = parseFloat(amt || 0);
    return `₹${amount.toLocaleString('en-IN', { 
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <div className="report-layout-root" style={{ 
      fontFamily: "Arial, sans-serif", 
      padding: "12mm",
      width: "210mm",
      margin: "0 auto", 
      backgroundColor: "white", 
      color: "black", 
      fontSize: "13px",
      boxSizing: "border-box"
    }}>

      {/* ✅ HEADER — completely unchanged from your working version */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "stretch", 
        borderBottom: "2px solid #000",
        paddingBottom: "8px",
        marginBottom: "15px",
        gap: "0"
      }}>
        {/* LEFT - Customer Info */}
        <div style={{ 
          fontSize: "12px", display: "flex", flexDirection: "column", 
          justifyContent: "center", paddingRight: "10px",
          borderRight: "1.5px solid #000"
        }}>
          {headerData.customerName != null && (
    <div style={{ marginBottom: "3px" }}>
      <span style={{ fontWeight: "normal" }}>Customer: </span>
      <strong>{headerData.customerName}</strong>
    </div>
  )}
  {headerData.billNo != null && (
    <div>
      <span style={{ fontWeight: "normal" }}>Bill No: </span>
      <strong>{headerData.billNo}</strong>
    </div>
  )}
        </div>

        {/* CENTER - GVV + Business Info */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <div style={{ 
            fontSize: "24px", fontWeight: "bold", padding: "0 10px",
            borderRight: "1.5px solid #000", display: "flex",
            alignItems: "center", alignSelf: "stretch"
          }}>GVV</div>

          <div style={{ 
            textAlign: "center", padding: "4px 12px",
            display: "flex", flexDirection: "column", justifyContent: "center",
            borderRight: "1.5px solid #000"
          }}>
            <div style={{ fontSize: "10px", fontFamily: "'Noto Sans Tamil', Arial", marginBottom: "2px" }}>
              ஸ்ரீ மந்திரமூர்த்தி சுவாமி துணை
            </div>
            <div style={{ fontWeight: "bold", fontSize: "13px", letterSpacing: "0.3px" }}>
              GOVINDAN VEGETABLES
            </div>
            <div style={{ fontSize: "11px" }}>Prop. G. VENKADESH</div>
            <div style={{ fontSize: "11px" }}>9486939786</div>
          </div>

          <div style={{ 
            fontSize: "24px", fontWeight: "bold", padding: "0 10px",
            display: "flex", alignItems: "center", alignSelf: "stretch"
          }}>GVV</div>
        </div>

        {/* RIGHT - Date & Shop */}
        <div style={{ 
          fontSize: "12px", display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "flex-start",
          paddingLeft: "12px", borderLeft: "1.5px solid #000", lineHeight: "1.5"
        }}>
          <div>
            <span style={{ fontWeight: "normal" }}>Date: </span>
            <strong>{headerData.date || getCurrentDate()}</strong>
          </div>
          <div style={{ fontWeight: "normal" }}>Shop No:</div>
          <div style={{ fontWeight: "bold" }}>9080536913</div>
          <div style={{ fontWeight: "bold" }}>9994787639</div>
          <div style={{ fontWeight: "bold" }}>9677918077</div>

        </div>
      </div>

      {/* TITLE */}
      {title && (
        <div style={{ 
          textAlign: "center", margin: "10px 0",
          fontSize: "16px", fontWeight: "bold", textTransform: "uppercase"
        }}>
          {title}
        </div>
      )}

      {/* BALANCE INFO */}
      <div style={{ textAlign: "right", marginBottom: "12px", fontSize: "13px" }}>
        <div>Old Balance: {formatCurrency(balanceData.yesterBalance || 0)}</div>
        <div>Cash: {formatCurrency(balanceData.todayPayments || 0)}</div>
        <div style={{ fontWeight: "bold", fontSize: "14px", marginTop: "2px" }}>
          Balance: {formatCurrency(balanceData.currentBalance || 0)}
        </div>
      </div>

      {/* ✅ TABLE — ONLY THIS IS FIXED. tableLayout fixed + nowrap on all cells */}
      <table style={{ 
        width: "100%", 
        borderCollapse: "collapse", 
        tableLayout: "fixed",      // ← KEY FIX: forces columns to respect widths
        border: "1.5px solid #000",
        fontSize: "11px"
      }}>
        {/* ✅ colgroup — explicit width for every column, nothing wraps */}
        <colgroup>
          {tableHeaders.map((h, i) => {
            const widths = {
              "S.No": "38px", "Bill No": "65px", "Date": "82px",
              "Customer": "120px", "Item": "110px",
              "Price": "58px", "Bag": "36px", "Weight": "58px", "Total": "65px"
            };
            return <col key={i} style={{ width: widths[h] || "80px" }} />;
          })}
        </colgroup>

        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            {tableHeaders.map((h, i) => (
              <th key={i} style={{ 
                border: "1px solid #000", 
                padding: "5px 3px", 
                fontSize: "11px",
                textAlign: "center",
                whiteSpace: "nowrap",         // ← no wrap in header
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {tableRows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ 
                  border: "1px solid #000", 
                  padding: "5px 5px", 
                  fontSize: "11px",
                  fontWeight: "600",
                  textAlign: ci <= 2 ? "center" : ci >= 5 ? "right" : "left",
                  whiteSpace: "nowrap",       // ← KEY FIX: no cell wraps to next line
                  overflow: "hidden",
                  textOverflow: "ellipsis",   // ← long text gets ... instead of wrapping
                  lineHeight: "1.3"
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* FOOTER */}
      <div style={{ 
        marginTop: "30px", fontSize: "10px",
        textAlign: "center", color: "#444",
        borderTop: "1px solid #eee", paddingTop: "10px"
      }}>
        Generated on {footerData.generatedOn || getCurrentDate()} | Govindan Vegetables System
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700&display=swap');
      `}</style>
    </div>
  );
}

export default ReportLayout;