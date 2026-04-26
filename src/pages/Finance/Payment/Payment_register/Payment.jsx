import { useEffect, useState, useMemo } from "react";
import Customerdropdown from "../../../../components/Customerdropdown";
import insatnces from "../../../../components/axios";
import "./Payment.css";
import useDashboardData from "../../../../components/DashboardWidget";

function Payment() {
  const [date, setDate] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [Customer, setCustomer] = useState("");
  const [payment, setPayment] = useState("");

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const fields = useMemo(() => ["totalbalance"], []);

  const { data, loading } = useDashboardData(Customer, date, fields);

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString("en-IN");
  };

  const formatInput = (value) => {
    if (value === "" || value === null || value === undefined) return "";

    const raw = value.toString().replace(/,/g, "");

    if (!/^\d*\.?\d{0,2}$/.test(raw)) return payment;

    if (raw.endsWith(".")) return raw;

    const num = parseFloat(raw);
    if (isNaN(num)) return "";

    return num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  };

  const normalformat = (value) => {
    if (!value) return "";
    return value.replace(/,/g, "");
  };

  const handlesubmit = async () => {
    if (!Customer || !payment) {
      alert("Please select customer and enter payment amount");
      return;
    }

    try {
      await insatnces.post("payment/register", {
        date: date,
        customername: Customer,
        customerpayment: normalformat(payment),
      });

      alert("Successfully saved");
      setSelectedCustomer(null);
      setCustomer("");
      setPayment("");
    } catch (error) {
      alert("Error while saving customer payment");
    }
  };

  return (
    <div className="payment-container">
      <h2>💰 Customer Payment</h2>

      <label className="custom-label">📅 Date</label>
      <input
        type="date"
        className="custom-input"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <label className="custom-label">👤 Customer Name</label>
      <div className="customer-dropdown-focus">
        <Customerdropdown
          selectedCustomer={selectedCustomer}
          onCustomerSelect={(customer) => {
            setSelectedCustomer(customer);
            setCustomer(customer.customername);
          }}
        />
      </div>

      <label className="custom-label">💸 Amount</label>
      <input
        type="text"
        className="custom-input"
        value={payment}
        onChange={(e) => setPayment(formatInput(e.target.value))}
        placeholder="Enter payment amount"
      />

      {Customer && (
        <h2>
          Balance: ₹{loading ? "loading..." : formatNumber(data?.totalbalance || 0)}
        </h2>
      )}

      <button type="submit" onClick={handlesubmit} className="custom-button">
        Submit
      </button>
    </div>
  );
}

export default Payment;