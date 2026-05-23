import { useEffect, useState } from "react";
import instances from "../../components/axios";
import DailysalesPrint from "./DailysalesPrint";

export default function Dailysales() {
 const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);

  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {

    fetchReport();

  }, []);

  const fetchReport = async () => {

    try {

      const res =
        await instances.get(
          "/salesitem/report"
        );

      setReport(res.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  if (loading) {

    return (

      <div className="h-screen flex items-center justify-center bg-[#0d0f12] text-white">

        Loading...

      </div>
    );
  }

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

<div
  id="daily-sales-report"
  className="min-h-screen bg-[#0d0f12] text-white p-6"
>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <div>

          <h1 className="text-3xl font-bold">
            Daily Sales
          </h1>

          <p className="text-slate-400 mt-1">
            Shop closing report
          </p>

        </div>

        <button
          onClick={() => setShowPrint(true)}
          className="bg-green-500 hover:bg-green-400 transition-all text-black font-bold px-5 py-3 rounded-2xl"
        >
          🖨 Print Report
        </button>

      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        <div className="bg-[#1a1e2a] border border-white/10 rounded-3xl p-6">

          <p className="text-slate-400 text-sm">
            Total Sales
          </p>

          <h2 className="text-4xl font-bold text-green-400 mt-2">
            ₹{report?.totalSales?.toFixed(2)}
          </h2>

        </div>

        <div className="bg-[#1a1e2a] border border-white/10 rounded-3xl p-6">

          <p className="text-slate-400 text-sm">
            Total Bills
          </p>

          <h2 className="text-4xl font-bold text-blue-400 mt-2">
            {report?.totalBills}
          </h2>

        </div>

      </div>

      {/* CATEGORY REPORT */}
      <div className="space-y-6">

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
                  className="bg-[#1a1e2a] border border-white/10 rounded-3xl overflow-hidden"
                >

                  {/* CATEGORY HEADER */}
                  <div className="px-6 py-4 border-b border-white/10 bg-[#141720] flex items-center justify-between">

                    <div>

                      <h2 className="text-2xl font-bold text-white">
                        {category}
                      </h2>

                      <p className="text-slate-400 text-sm mt-1">
                        {items.length} items sold
                      </p>

                    </div>

                    <div className="text-right">

                      <h2 className="text-3xl font-bold text-green-400">
                        ₹{totalAmount.toFixed(2)}
                      </h2>

                      <p className="text-slate-400 text-sm">
                        Qty : {totalQty}
                      </p>

                    </div>

                  </div>

                  {/* TABLE */}
                  <div className="overflow-x-auto">

                    <table className="w-full">

                      <thead className="bg-[#11141c]">

                        <tr>

                          <th className="text-left px-6 py-4 text-slate-400 text-sm">
                            Item
                          </th>

                          <th className="text-left px-6 py-4 text-slate-400 text-sm">
                            Qty
                          </th>

                          <th className="text-left px-6 py-4 text-slate-400 text-sm">
                            Total
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {
                          items.map(
                            (item, index) => (

                              <tr
                                key={index}
                                className="border-t border-white/5"
                              >

                                <td className="px-6 py-4 font-semibold text-white">
                                  {item.itemname}
                                </td>

                                <td className="px-6 py-4 text-slate-300">
                                  {item.qty}
                                </td>

                                <td className="px-6 py-4 text-green-400 font-bold">
                                  ₹{item.total}
                                </td>

                              </tr>
                            )
                          )
                        }

                      </tbody>

                    </table>

                  </div>

                </div>
              );
            }
          )
        }

      </div>

      {/* PAYMENT SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

        <div className="bg-[#1a1e2a] border border-white/10 rounded-3xl p-6">

          <p className="text-slate-400 text-sm">
            Cash Sales
          </p>

          <h2 className="text-4xl font-bold text-blue-400 mt-2">
            ₹{report?.cashSales?.toFixed(2)}
          </h2>

        </div>

        <div className="bg-[#1a1e2a] border border-white/10 rounded-3xl p-6">

          <p className="text-slate-400 text-sm">
            UPI Sales
          </p>

          <h2 className="text-4xl font-bold text-purple-400 mt-2">
            ₹{report?.upiSales?.toFixed(2)}
          </h2>

        </div>

      </div>

      {
        showPrint && (

          <DailysalesPrint
            report={report}
            onClose={() => setShowPrint(false)}
          />
        )
      }

    </div>
  );
}