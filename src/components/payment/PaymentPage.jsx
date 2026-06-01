import React, { useState } from "react";

import {
  createOrder,
  verifyPayment
} from "../payment/paymentService";

function PaymentPage() {

  const [amount, setAmount] = useState(500);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("Customer");
  const [customerEmail, setCustomerEmail] = useState("customer@example.com");
  const [customerPhone, setCustomerPhone] = useState("9999999999");

  const handlePayment = async () => {

    try {

      setLoading(true);

      // CREATE ORDER
      const order =
        await createOrder(amount);

      // RAZORPAY OPTIONS
      const options = {

        key:
          import.meta.env
            .VITE_RAZORPAY_KEY,

        amount:
          order.amount * 100,

        currency:
          order.currency,

        name:
          "NextGenPOS",

        description:
          "Restaurant Payment",

        order_id:
          order.orderId,

        handler: async function (response) {

          try {

            // VERIFY PAYMENT
            await verifyPayment({

              razorpay_order_id:
                response.razorpay_order_id,

              razorpay_payment_id:
                response.razorpay_payment_id,

              razorpay_signature:
                response.razorpay_signature
            });

            alert(
              "Payment Successful 😎🔥"
            );

            // Reset form
            setAmount(500);
            setCustomerName("Customer");
            setCustomerEmail("customer@example.com");
            setCustomerPhone("9999999999");

          } catch (verifyError) {

            console.error(
              verifyError
            );

            alert(
              "Payment Verification Failed 😭"
            );
          } finally {

            setLoading(false);
          }
        },

        prefill: {

          name:
            customerName,

          email:
            customerEmail,

          contact:
            customerPhone
        },

        theme: {
          color: "#16A34A"
        }
      };

      // OPEN RAZORPAY
      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.open();

    } catch (error) {

      console.error(error);

      alert(
        "Payment Failed 😭"
      );

      setLoading(false);
    }
  };

  return (

    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-gray-100
        p-4
      "
    >

      <div
        className="
          bg-white
          p-10
          rounded-2xl
          shadow-xl
          w-full
          max-w-md
        "
      >

        <h1
          className="
            text-3xl
            font-bold
            mb-8
            text-center
          "
        >
          Payment
        </h1>

        {/* CUSTOMER NAME */}
        <div
          className="
            mb-4
          "
        >
          <label
            className="
              block
              text-sm
              font-medium
              mb-2
            "
          >
            Customer Name
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) =>
              setCustomerName(e.target.value)
            }
            className="
              w-full
              px-4
              py-2
              border
              rounded-lg
              focus:outline-none
              focus:ring-2
              focus:ring-green-500
            "
            placeholder="Enter name"
          />
        </div>

        {/* CUSTOMER EMAIL */}
        <div
          className="
            mb-4
          "
        >
          <label
            className="
              block
              text-sm
              font-medium
              mb-2
            "
          >
            Email
          </label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) =>
              setCustomerEmail(e.target.value)
            }
            className="
              w-full
              px-4
              py-2
              border
              rounded-lg
              focus:outline-none
              focus:ring-2
              focus:ring-green-500
            "
            placeholder="Enter email"
          />
        </div>

        {/* CUSTOMER PHONE */}
        <div
          className="
            mb-6
          "
        >
          <label
            className="
              block
              text-sm
              font-medium
              mb-2
            "
          >
            Phone
          </label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) =>
              setCustomerPhone(e.target.value)
            }
            className="
              w-full
              px-4
              py-2
              border
              rounded-lg
              focus:outline-none
              focus:ring-2
              focus:ring-green-500
            "
            placeholder="Enter phone"
          />
        </div>

        {/* AMOUNT */}
        <div
          className="
            mb-6
          "
        >
          <label
            className="
              block
              text-sm
              font-medium
              mb-2
            "
          >
            Amount (₹)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) =>
              setAmount(Number(e.target.value))
            }
            min="1"
            className="
              w-full
              px-4
              py-2
              border
              rounded-lg
              focus:outline-none
              focus:ring-2
              focus:ring-green-500
            "
            placeholder="Enter amount"
          />
        </div>

        {/* PAY BUTTON */}
        <button
          onClick={handlePayment}
          disabled={loading || amount < 1}
          className="
            w-full
            bg-green-500
            hover:bg-green-600
            disabled:bg-gray-400
            text-white
            px-6
            py-3
            rounded-xl
            font-semibold
            transition
          "
        >
          {loading ? "Processing..." : `Pay ₹${amount}`}
        </button>

      </div>

    </div>
  );
}

export default PaymentPage;