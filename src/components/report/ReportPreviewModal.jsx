import React, { useRef, useEffect, useState } from "react";
import { downloadPDF, printReport, exportToExcel } from "../../components/report/reportUtils";
import { Download, Printer, FileSpreadsheet, X, Maximize, Minimize } from 'lucide-react';

function ReportPreviewModal({
  isOpen,
  onClose,
  reportRef,
  title,
  children,
  tableHeaders = [],
  tableRows = [],
  balanceData = {},
  billSummary = {}
}) {
  const innerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (reportRef && innerRef.current && isOpen) {
      reportRef.current = innerRef.current;
    }
  }, [reportRef, isOpen, children]);

  if (!isOpen) return null;

  const handlePDFDownload = async () => {
    if (!innerRef.current) return;
    setIsLoading(true);
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
      await downloadPDF(innerRef, `${cleanTitle}-${timestamp}.pdf`);
    } catch (error) {
      console.error('PDF Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  return (
    <div style={{
      position: "fixed", inset: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        width: isFullscreen ? "99vw" : "90vw",
        maxWidth: isFullscreen ? "99vw" : "900px",
        height: isFullscreen ? "99vh" : "92vh",
        overflow: "hidden"
      }}>

        {/* HEADER BAR */}
        <div style={{
          background: "linear-gradient(to right, #16a34a, #059669)",
          color: "white",
          padding: "12px 16px",
          borderRadius: "12px 12px 0 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0
        }}>
          <h2 style={{ margin: 0, fontSize: "17px", fontWeight: "bold" }}>{title}</h2>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={handlePDFDownload} disabled={isLoading} style={btnStyle("#2563eb")}>
              <Download size={15}/> PDF
            </button>
            <button onClick={() => printReport(innerRef)} style={btnStyle("#16a34a")}>
              <Printer size={15}/> Print
            </button>
            <button onClick={() => exportToExcel(tableHeaders, tableRows, `${title}.xlsx`)} style={btnStyle("#d97706", "#000")}>
              <FileSpreadsheet size={15}/> Excel
            </button>
            <button onClick={toggleFullscreen} style={btnStyle("#7c3aed")}>
              {isFullscreen ? <Minimize size={15}/> : <Maximize size={15}/>}
            </button>
            <button onClick={onClose} style={btnStyle("#dc2626")}>
              <X size={15}/>
            </button>
          </div>
        </div>

        {/* ✅ SCROLL AREA — centers the bill, scrolls if needed */}
        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "auto",
            backgroundColor: "#e5e7eb",
            padding: "24px 16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start"
          }}
        >
          {/* ✅ Bill wrapper — A4 size, centered, white */}
          <div
            ref={innerRef}
            className="pdf-content"
            style={{
              width: "210mm",
              minWidth: "210mm",
              backgroundColor: "white",
              minHeight: "297mm",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              border: "1px solid #ccc",
              flexShrink: 0
            }}
          >
            {children}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; -webkit-print-color-adjust: exact !important; }
          .pdf-content, .report-layout-root {
            width: 210mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          .report-layout-root { page-break-after: always !important; }
        }
      `}</style>
    </div>
  );
}

const btnStyle = (bg, color = "white") => ({
  display: "flex",
  alignItems: "center",
  gap: "5px",
  padding: "7px 12px",
  backgroundColor: bg,
  color: color,
  border: "none",
  borderRadius: "7px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "500"
});

export default ReportPreviewModal;