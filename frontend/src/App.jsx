import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState(null);
  const [unlockedResult, setUnlockedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
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
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");

    const handleStripeSuccess = async () => {
      if (window.location.pathname === "/success" && orderId) {
        try {
          await axios.post(
            `http://localhost:8080/api/calculations/pay/${orderId}`
          );

          const response = await axios.get(
            `http://localhost:8080/api/calculations/result/${orderId}`
          );

          setUnlockedResult(response.data);
          setExpression(String(response.data.answer));
          await loadHistory();

          window.history.replaceState({}, "", "/");
        } catch (error) {
          alert("Payment completed, but answer unlock failed");
        }
      } else {
        await loadHistory();
      }
    };

    handleStripeSuccess();
  }, []);

  const handleButtonClick = (value) => {
    if (value === "C") {
      setExpression("");
      setResult(null);
      setUnlockedResult(null);
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

  const handleStripePayment = async () => {
    if (!result?.orderId) {
      alert("Order ID not found");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `http://localhost:8080/api/payment/checkout/${result.orderId}`
      );

      window.location.href = response.data.url;
    } catch (error) {
      alert("Failed to start Stripe payment");
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
            <div className="display">
              {unlockedResult ? unlockedResult.answer : expression || "0"}
            </div>

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
                <div className="locked-answer">
                  Answer: ******
                </div>

                <button
                  className="pay-btn"
                  onClick={handleStripePayment}
                >
                  Unlock Answer - Rs.200
                </button>
              </div>
            )}

            {unlockedResult && (
              <div className="success-message">
                ✓ Answer unlocked successfully
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
                    {item.paid ? "Rs.200 Paid" : "Locked"}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;