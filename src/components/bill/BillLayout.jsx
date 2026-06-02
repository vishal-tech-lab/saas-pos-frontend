import React from "react";

function BillLayout({
  billNo,
  paymentMethod,
  cartItems = [],
  subtotal = 0,
  total = 0
}) {

  const getCurrentDateTime = () => {

    return new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (

    <div
      style={{
        width: "80mm",
        margin: "0 auto",
        backgroundColor: "#fff",
        color: "#000",
        padding: "10px",
        fontFamily: "Arial, sans-serif",
        fontSize: "13px",
        fontWeight: "bold",
        lineHeight: "1.4",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact"
      }}
    >

      {/* LOGO */}
      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <img
          src="/assets/logo.jpg"
          alt="logo"
          style={{
            width: "80px",
            height: "80px",
            objectFit: "contain",
            marginBottom: "6px"
          }}
        />

        <h2
          style={{
            margin: "0",
            fontSize: "20px",
            fontWeight: "bold"
          }}
        >
          MASALAROAST
        </h2>

        <p style={{ margin: "2px 0" }}>
          Chennai, Tamil Nadu
        </p>

        <p style={{ margin: "2px 0" }}>
          9876543210
        </p>

      </div>

      {/* DIVIDER */}
      <hr style={{ borderTop: "1px dashed black", margin: "10px 0" }} />

      {/* BILL INFO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px"
        }}
      >
        <span>Bill No</span>
        <strong
          style={{
            color: "#000",
            fontWeight: "900"
          }}
        >
          {billNo}
        </strong>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px"
        }}
      >
        <span>Date</span>
        <strong
          style={{
            color: "#000",
            fontWeight: "900"
          }}
        >
          {getCurrentDateTime()}
        </strong>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <span>Payment</span>
        <strong
          style={{
            color: "#000",
            fontWeight: "900"
          }}
        >
          {paymentMethod}
        </strong>
      </div>

      {/* DIVIDER */}
      <hr style={{ borderTop: "1px dashed black", margin: "10px 0" }} />

      {/* TABLE HEADER */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 45px 55px",
          fontWeight: "bold",
          marginBottom: "6px"
        }}
      >
        <span>Item</span>
        <span style={{ textAlign: "center" }}>Qty</span>
        <span style={{ textAlign: "right" }}>Total</span>
      </div>

      {/* ITEMS */}
      {
        cartItems.map((item, index) => (

          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 45px 55px",
              marginBottom: "6px",
              alignItems: "center"
            }}
          >

            <div>

              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "13px",
                  color: "#000"
                }}
              >
                {item.itemname}
              </div>

              <div
                style={{
                  fontSize: "10px",
                  color: "#000",
                  fontWeight: "bold"
                }}
              >
                ₹{item.price}
              </div>

            </div>

            <div
              style={{
                textAlign: "center"
              }}
            >
              {item.qty}
            </div>

            <div
              style={{
                textAlign: "right",
                fontWeight: "bold"
              }}
            >
              ₹{(item.price * item.qty).toFixed(2)}
            </div>

          </div>

        ))
      }

      {/* DIVIDER */}
      <hr style={{ borderTop: "1px dashed black", margin: "10px 0" }} />

      {/* TOTALS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "16px",
          fontWeight: "900",
          marginTop: "8px"
        }}
      >
        <span>Total</span>
        <span>₹{total.toFixed(2)}</span>
      </div>

      {/* DIVIDER */}
      <hr style={{ borderTop: "1px dashed black", margin: "12px 0" }} />

      {/* FOOTER */}
      <div
        style={{
          textAlign: "center",
          marginTop: "10px"
        }}
      >

        <p
          style={{
            margin: "3px 0",
            fontWeight: "bold"
          }}
        >
          THANK YOU ❤️
        </p>

        <p
          style={{
            margin: "3px 0",
            fontSize: "10px"
          }}
        >
          Visit Again
        </p>

      </div>

    </div>
  );
}

export default BillLayout;