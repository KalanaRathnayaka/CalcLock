import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState(null);
  const [unlockedResult, setUnlockedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [history, setHistory] = useState([]);

  const buttons = [
    "C", "⌫", "(", ")",
    "7", "8", "9", "/",
    "4", "5", "6", "*",
    "1", "2", "3", "+",
    "0", ".", "-", "=",
  ];

  const loadHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/calculations/history"
      );
      setHistory(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/calculations/history")
      .then((response) => setHistory(response.data))
      .catch((error) => console.error(error));
  }, []);

  const handleButtonClick = (value) => {
    if (value === "C") {
      setExpression("");
      setResult(null);
      setUnlockedResult(null);
      setShowPaymentModal(false);
      return;
    }

    if (value === "⌫") {
      setExpression(expression.slice(0, -1));
      return;
    }

    if (value === "=") {
      handleCalculate();
      return;
    }

    setExpression(expression + value);
  };

  const handleCalculate = async () => {
    if (!expression) {
      alert("Please enter a calculation");
      return;
    }

    try {
      setLoading(true);
      setUnlockedResult(null);
      setResult(null);

      const response = await axios.post(
        "http://localhost:8080/api/calculations",
        { expression }
      );

      setResult(response.data);
      await loadHistory();
    } catch (error) {
      alert(error.response?.data?.message || "Error creating calculation");
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = () => {
    setShowPaymentModal(true);
  };

  const handleDemoPayment = async () => {
    if (!cardNumber || !expiry || !cvv) {
      alert("Please fill all card details");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `http://localhost:8080/api/calculations/pay/${result.orderId}`
      );

      const response = await axios.get(
        `http://localhost:8080/api/calculations/result/${result.orderId}`
      );

      setUnlockedResult(response.data);
      setShowPaymentModal(false);
      setCardNumber("");
      setExpiry("");
      setCvv("");
      await loadHistory();
    } catch (error) {
      alert(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete all calculation history?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete("http://localhost:8080/api/calculations/history");
      setHistory([]);
      alert("History deleted successfully");
    } catch (error) {
      alert("Failed to delete history");
    }
  };

  return (
    <div className="container">
      <div className="card calculator-card">
        <h1>CalcLock</h1>

        <button
          className="history-toggle-btn"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? "🧮 Back to Calculator" : "📜 Show History"}
        </button>

        {!showHistory && (
          <>
            <div className="display">{expression || "0"}</div>

            <div className="keypad">
              {buttons.map((btn) => (
                <button
                  key={btn}
                  className={btn === "=" ? "equals-btn" : "calc-btn"}
                  onClick={() => handleButtonClick(btn)}
                  disabled={loading}
                >
                  {btn}
                </button>
              ))}
            </div>

            {result && !unlockedResult && (
              <div className="result">
                <p>
                  <strong>Order ID:</strong>
                </p>
                <p className="order-id">{result.orderId}</p>
                <p>{result.message}</p>

                <div className="locked-answer">Answer: ******</div>

                <button className="pay-btn" onClick={openPaymentModal}>
                  Pay To Unlock
                </button>
              </div>
            )}

            {unlockedResult && (
              <div className="result">
                <p>
                  <strong>Expression:</strong> {unlockedResult.expression}
                </p>
                <h2>Answer: {unlockedResult.answer}</h2>
                <p>{unlockedResult.message}</p>
              </div>
            )}
          </>
        )}

        {showHistory && (
          <div className="history-section">
            <h2>History</h2>

            {history.length > 0 && (
              <button className="clear-history-btn" onClick={clearHistory}>
                🗑 Clear All History
              </button>
            )}

            {history.length === 0 ? (
              <p className="empty-history">No calculations yet.</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="history-item">
                  <div>
                    <strong>{item.expression}</strong>
                    <p>
                      {item.createdAt?.replace("T", " ").substring(0, 19)}
                    </p>
                  </div>

                  <span className={item.paid ? "paid" : "locked"}>
                    {item.paid ? "Rs.50 Paid" : "Locked"}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="payment-modal">
            <h2>Demo Card Payment</h2>
            <p className="payment-note">
              Use demo card details to unlock the answer.
            </p>

            <input
              type="text"
              placeholder="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />

            <div className="payment-row">
              <input
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />

              <input
                type="password"
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
            </div>

            <button className="pay-btn" onClick={handleDemoPayment}>
              {loading ? "Processing..." : "Pay Rs. 50"}
            </button>

            <button
              className="cancel-btn"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;