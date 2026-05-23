import React, { useRef, useEffect } from "react";

function BillPreviewModal({
  isOpen,
  onClose,
  children
}) {

  const billRef = useRef(null);

  useEffect(() => {

    if (isOpen) {

      document.body.style.overflow = "hidden";
    }

    return () => {

      document.body.style.overflow = "auto";
    };

  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {

    const printContents =
      billRef.current.innerHTML;

    const printWindow =
      window.open("", "", "width=400,height=600");

    printWindow.document.write(`
      <html>
        <head>
          <title>Bill Print</title>

          <style>

            body {

              margin: 0;
              padding: 0;
              background: white;
              font-family: Arial, sans-serif;
            }

            @media print {

              body {

                width: 80mm;
              }

              @page {

                size: 80mm auto;
                margin: 0;
              }
            }

          </style>

        </head>

        <body>

          ${printContents}

        </body>

      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {

      printWindow.print();

    }, 500);
  };

  return (

    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999
      }}
    >

      <div
        style={{
          width: "420px",
          maxHeight: "92vh",
          backgroundColor: "white",
          borderRadius: "14px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
        }}
      >

        {/* HEADER */}
        <div
          style={{
            background: "#16a34a",
            color: "white",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >

          <h2
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            Bill Preview
          </h2>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              color: "white",
              fontSize: "20px",
              cursor: "pointer"
            }}
          >
            ×
          </button>

        </div>

        {/* BODY */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#e5e7eb",
            padding: "20px",
            display: "flex",
            justifyContent: "center"
          }}
        >

          <div
            ref={billRef}
            style={{
              background: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}
          >
            {children}
          </div>

        </div>

        {/* FOOTER */}
        <div
          style={{
            padding: "14px",
            display: "flex",
            gap: "10px",
            borderTop: "1px solid #ddd",
            background: "#fff"
          }}
        >

          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              background: "#16a34a",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            🖨 Print Bill
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: "#ef4444",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

export default BillPreviewModal;