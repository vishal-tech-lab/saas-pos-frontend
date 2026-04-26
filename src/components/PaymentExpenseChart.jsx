import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function PaymentExpenseChart({ data }) {

  // ✅ Add PROFIT to each data point
  const formattedData = data.map(item => ({
    ...item,
    profit: (Number(item.sales) || 0) - (Number(item.expense) || 0)
  }));

  // ✅ Totals
  const totals = formattedData.reduce((acc, item) => ({
    totalSales: acc.totalSales + (item.sales || 0),
    totalExpenses: acc.totalExpenses + (item.expense || 0),
    totalProfit: acc.totalProfit + (item.profit || 0),
    totalPayment: acc.totalPayment + (item.customerPayment || 0),
  }), { totalSales: 0, totalExpenses: 0, totalProfit: 0, totalPayment: 0 });

  // ✅ Format Date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
  };

  // ✅ Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{formatDate(label)}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm">
              <span style={{ color: entry.color }}>●</span>{" "}
              {entry.name}: ₹{entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white">

      {/* ✅ HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Business Overview
        </h2>
        <p className="text-gray-500 text-sm">
          Sales vs Expenses vs Profit vs Cash Flow
        </p>
      </div>

      {/* ✅ CHART */}
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <LineChart data={formattedData}>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />

            <YAxis
              tickFormatter={(value) => `₹${value / 1000}k`}
              tick={{ fontSize: 12 }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* 🔵 Sales */}
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Sales"
            />

            {/* 🔴 Expenses */}
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={2}
              name="Expenses"
            />

            {/* 🟢 Profit */}
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#16a34a"
              strokeWidth={4}
              dot={{ r: 4 }}
              name="Profit"
            />

            {/* 🟣 Customer Payment (Cash Flow) */}
            <Line
              type="monotone"
              dataKey="customerPayment"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Customer Payment"
            />

          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ✅ SUMMARY */}
      <div className="mt-6 flex justify-around bg-gray-50 p-4 rounded-lg">

        <div className="text-center">
          <p className="text-sm text-gray-500">Sales</p>
          <p className="text-xl font-bold text-blue-600">
            ₹{totals.totalSales.toLocaleString()}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">Expenses</p>
          <p className="text-xl font-bold text-red-600">
            ₹{totals.totalExpenses.toLocaleString()}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">Profit</p>
          <p className={`text-xl font-bold ${
            totals.totalProfit >= 0 ? "text-green-600" : "text-red-600"
          }`}>
            ₹{totals.totalProfit.toLocaleString()}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">Cash Received</p>
          <p className="text-xl font-bold text-purple-600">
            ₹{totals.totalPayment.toLocaleString()}
          </p>
        </div>

      </div>
    </div>
  );
}

export default PaymentExpenseChart;