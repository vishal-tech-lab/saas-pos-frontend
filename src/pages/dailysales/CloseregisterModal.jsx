import { useEffect, useState } from "react";
import instances from "../../components/axios";
import DailysalesPrint from "./DailysalesPrint";
import html2pdf from "html2pdf.js";

export default function CloseregisterModal({
  isOpen,
  onClose
}) {
const [downloading, setDownloading] =
  useState(false);
  const [report, setReport] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [cashCount, setCashCount] =
    useState("");

  const [upiCount, setUpiCount] =
    useState("");

  useEffect(() => {

    if (isOpen) {

      fetchReport();
    }

  }, [isOpen]);

  const fetchReport = async () => {

    try {

      const res =
        await instances.get(
          "/salesitem/report"
        );

      setReport(res.data);

      setCashCount(
        res.data.cashSales || 0
      );

      setUpiCount(
        res.data.upiSales || 0
      );

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

const handleDownloadDailySale =
  async () => {

    const element =
      document.getElementById(
        "daily-sales-report"
      );

    if (!element) {

      alert(
        "Report not ready"
      );

      return;
    }

    const options = {

      margin: 0.1,

      filename: "Daily Sales.pdf",

      image: {
        type: "jpeg",
        quality: 0.7
      },

      html2canvas: {
        scale: 1
      },

      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait"
      }
    };

    await new Promise((resolve) =>
      setTimeout(resolve, 500)
    );

    await html2pdf()
      .set(options)
      .from(element)
      .save();
};

const handleConfirmClose = async () => {
  try {
    setDownloading(true);

    await handleDownloadDailySale();

    await instances.post(
      "/salesitem/closeregister"
    );

    await fetchReport();

    onClose();
  } catch (error) {
    console.error(error);
  } finally {
    setDownloading(false);
  }
};

  if (!isOpen) return null;

  const cashDifference =
    Number(cashCount || 0) -
    Number(report?.cashSales || 0);

  const upiDifference =
    Number(upiCount || 0) -
    Number(report?.upiSales || 0);

  return (

    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">

      <div className="w-full max-w-5xl h-[90vh] overflow-hidden bg-white rounded-2xl flex flex-col">

        {/* HEADER */}
        <div className="border-b px-6 py-5 flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-semibold text-black">
              Closing Register
            </h1>

            <p className="text-slate-500 mt-1">
              Verify today's closing
            </p>

          </div>

          <div className="text-right">

            <h2 className="text-2xl font-bold text-black">
              ₹{report?.totalSales?.toFixed(2)}
            </h2>

            <p className="text-slate-500">
              {report?.totalBills} Orders
            </p>

          </div>

        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f8f9fb]">

          {
            loading ? (

              <div className="h-full flex items-center justify-center text-black">
                Loading...
              </div>

            ) : (

              <div className="space-y-6">

                {/* CASH */}
               

                {/* SUMMARY */}
                <div className="bg-white rounded-2xl border p-5">

                  <h2 className="text-2xl font-semibold text-black mb-5">
                    Summary
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    {/* TOTAL ORDERS */}
                    <div className="border rounded-2xl p-5">

                      <p className="text-slate-500">
                        Total Orders
                      </p>

                      <h2 className="text-3xl font-bold text-black mt-2">
                        {report?.totalBills}
                      </h2>

                    </div>

                    {/* TOTAL SALES */}
                    <div className="border rounded-2xl p-5">

                      <p className="text-slate-500">
                        Total Sales
                      </p>

                      <h2 className="text-3xl font-bold text-green-600 mt-2">
                        ₹{report?.totalSales?.toFixed(2)}
                      </h2>

                    </div>

                    {/* CASH SALES */}
                    <div className="border rounded-2xl p-5">

                      <p className="text-slate-500">
                        Cash Sales
                      </p>

                      <h2 className="text-3xl font-bold text-blue-600 mt-2">
                        ₹{report?.cashSales?.toFixed(2)}
                      </h2>

                    </div>

                    {/* UPI SALES */}
                    <div className="border rounded-2xl p-5">

                      <p className="text-slate-500">
                        UPI Sales
                      </p>

                      <h2 className="text-3xl font-bold text-purple-600 mt-2">
                        ₹{report?.upiSales?.toFixed(2)}
                      </h2>

                    </div>

                  </div>

                </div>

              </div>
            )
          }

        </div>

        {/* FOOTER */}
        <div className="border-t bg-white px-6 py-4 flex items-center justify-between">

          <div className="flex gap-3">

            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl border font-semibold text-black"
            >
              Discard
            </button>

          </div>

          <div className="flex gap-3">

           <button
  onClick={handleDownloadDailySale}
  className="px-6 py-3 rounded-xl bg-blue-500 text-white font-semibold"
>
  ⬇ Daily Sale
</button>

            <button
              onClick={handleConfirmClose}
              disabled={downloading}
              className="px-6 py-3 rounded-xl bg-[#6d3c5b] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? "Processing..." : "🔒 Close Register"}
            </button>

          </div>

        </div>

      </div>
<div className="hidden">

  <DailysalesPrint
    report={report}
  />

</div>
    </div>
  );
}