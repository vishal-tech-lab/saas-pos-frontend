import { useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
export default function DailysalesPrint({
  report,
  onClose
}) {

  const printRef = useRef();

 

  const groupedItems =
    report?.items?.reduce(
      (acc, item) => {

        const category =
          item.category || "OTHERS";

        if (!acc[category]) {

          acc[category] = [];
        }

        acc[category].push(item);

        return acc;

      },
      {}
    ) || {};

  

  return (

    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-white w-[900px] max-h-[90vh] overflow-auto rounded-3xl">

        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b">

          <h2 className="text-2xl font-bold text-black">
            Daily Sales Report
          </h2>

          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded-xl"
          >
            Close
          </button>

        </div>

        {/* BODY */}
       <div
  id="daily-sales-report"
  ref={printRef}
  className="p-10 text-black bg-white">

          <div
            style={{
              background: "#d1d5db",
              padding: "30px",
              marginBottom: "20px"
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >

              {/* LEFT */}
              <div>

        <h2
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: "bold"
          }}
        >
          MASALAROAST
        </h2>

        <p style={{ marginTop: "10px" }}>
          1 nehru nagar
          <br />
          Mambakkam
          <br />
          Chennai 600100
          <br />
          Tamil Nadu TN
          <br />
          India
        </p>

      </div>

      {/* CENTER */}
      <div
        style={{
          textAlign: "center"
        }}
      >

        <h1
          style={{
            fontSize: "24px",
            margin: 0,
            fontWeight: "bold"
          }}
        >
          Daily Sales Report
        </h1>

        <p
          style={{
            marginTop: "15px",
            fontSize: "22px"
          }}
        >
          Session ID:
          Restaurant/00435
        </p>

      </div>

      {/* RIGHT */}
      <div>

        <div
          style={{
            border: "2px solid black",
            padding: "12px 20px",
            fontWeight: "bold",
            fontSize: "22px"
          }}
        >
          {
            new Date()
              .toLocaleDateString()
          }
        </div>

      </div>

    </div>

  </div>

  {/* SALES HEADER */}
  <div
    style={{
      background: "#d1d5db",
      padding: "10px 15px",
      fontWeight: "bold",
      fontSize: "24px",
      marginBottom: "20px"
    }}
  >
    Sales
  </div>

  {/* CATEGORYS */}
  {
    Object.entries(groupedItems).map(
      ([category, items]) => {

        const totalQty =
          items.reduce(
            (sum, item) =>
              sum + item.qty,
            0
          );

        const totalAmount =
          items.reduce(
            (sum, item) =>
              sum + item.total,
            0
          );

        return (

          <div
            key={category}
            style={{
              marginBottom: "30px"
            }}
          >

            {/* CATEGORY HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                fontSize: "24px",
                borderBottom:
                  "2px solid #111827",
                paddingBottom: "8px",
                marginBottom: "10px"
              }}
            >

              <span>
                {category}
              </span>

              <div
                style={{
                  display: "flex",
                  gap: "80px"
                }}
              >

                <span>
                  {totalQty.toFixed(1)}
                </span>

                <span>
                  ₹{totalAmount.toFixed(2)}
                </span>

              </div>

            </div>

            {/* ITEMS */}
            {
              items.map(
                (item, index) => (

                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding:
                        "10px 0",
                      paddingLeft:
                        "20px",
                      borderBottom:
                        "1px solid #d1d5db",
                      fontSize: "22px"
                    }}
                  >

                    <span>
                      {item.itemname}
                    </span>

                    <div
                      style={{
                        display: "flex",
                        gap: "80px"
                      }}
                    >

                      <span>
                        {item.qty}
                      </span>

                      <span>
                        ₹{item.total}
                      </span>

                    </div>

                  </div>
                )
              )
            }

          </div>
        );
      }
    )
  }

  {/* PAYMENTS */}
  <div
    style={{
      marginTop: "50px"
    }}
  >

    <div
      style={{
        background: "#d1d5db",
        padding: "10px 15px",
        fontWeight: "bold",
        fontSize: "24px",
        marginBottom: "20px"
      }}
    >
      Payments
    </div>

    {/* CASH */}
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        fontSize: "24px",
        marginBottom: "15px"
      }}
    >

      <span>
        Cash
      </span>

      <span>
        ₹{report?.cashSales?.toFixed(2) ?? "0.00"}
      </span>

    </div>

    {/* UPI */}
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        fontSize: "24px",
        marginBottom: "15px"
      }}
    >

      <span>
        UPI
      </span>

      <span>
        ₹{report?.upiSales?.toFixed(2) ?? "0.00"}
      </span>

    </div>

    {/* TOTAL */}
    <div
      style={{
        borderTop:
          "2px solid black",
        marginTop: "20px",
        paddingTop: "20px",
        display: "flex",
        justifyContent:
          "space-between",
        fontWeight: "bold",
        fontSize: "34px"
      }}
    >

      <span>Total</span>

      <span>
        ₹{report?.totalSales?.toFixed(2) ?? "0.00"}
      </span>

    </div>

  </div>

</div>

      </div>

    </div>
  );
}