import { useState } from "react";
import "./App.css";

const demoQuotes = [
  {
    supplier: "TechSource India",
    initials: "TS",
    price: "₹4,82,500",
    unitPrice: "₹48,250 / unit",
    delivery: "7 days",
    warranty: "3 years",
    score: 94,
    status: "Best Match",
    accent: "blue",
  },
  {
    supplier: "Prime Electronics",
    initials: "PE",
    price: "₹4,96,000",
    unitPrice: "₹49,600 / unit",
    delivery: "10 days",
    warranty: "3 years",
    score: 89,
    status: "Qualified",
    accent: "purple",
  },
  {
    supplier: "Global Devices",
    initials: "GD",
    price: "₹5,14,000",
    unitPrice: "₹51,400 / unit",
    delivery: "6 days",
    warranty: "2 years",
    score: 82,
    status: "Qualified",
    accent: "cyan",
  },
];

function App() {
  const [page, setPage] = useState("home");

  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [warrantyYears, setWarrantyYears] = useState("");

  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleStart = () => {
    setPage("compare");
    setShowResults(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setIsRunning(true);
    setShowResults(false);

    // Demo loading state.
    // Replace this with your backend/API call later.
    setTimeout(() => {
      setIsRunning(false);
      setShowResults(true);
    }, 2200);
  };

  const resetComparison = () => {
    setProduct("");
    setQuantity("");
    setDeliveryDays("");
    setWarrantyYears("");
    setShowResults(false);
    setIsRunning(false);
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <header className="navbar">
        <div
          className="brand"
          onClick={() => {
            setPage("home");
            resetComparison();
          }}
        >
          <div className="brand-mark">
            Q
          </div>

          <div>
            <div className="brand-name">QuotePilot</div>
            <div className="brand-subtitle">
              Supplier Intelligence
            </div>
          </div>
        </div>

        <div className="nav-right">
          <div className="agent-status">
            <span className="status-dot"></span>
            Agent Ready
          </div>

          {page === "compare" && (
            <button
              className="nav-back"
              onClick={() => setPage("home")}
            >
              ← Home
            </button>
          )}
        </div>
      </header>


      {/* ================= HOME PAGE ================= */}

      {page === "home" && (
        <main className="landing-page">

          <section className="hero">

            <div className="hero-badge">
              <span>✦</span>
              AI-powered procurement intelligence
            </div>

            <h1>
              Find the right supplier.
              <br />
              <span>Make the right decision.</span>
            </h1>

            <p className="hero-description">
              QuotePilot researches supplier websites, collects
              quotes, checks your requirements, and turns scattered
              procurement information into one clear recommendation.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={handleStart}
              >
                Start a comparison
                <span>→</span>
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See how it works
              </button>
            </div>

            <div className="hero-note">
              No account required · Start with your requirements
            </div>

          </section>


          {/* HERO VISUAL */}

          <section className="hero-preview">

            <div className="preview-window">

              <div className="preview-topbar">
                <div className="window-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <span className="preview-title">
                  Quote comparison
                </span>

                <span className="preview-live">
                  ● Live
                </span>
              </div>

              <div className="preview-body">

                <div className="preview-heading">
                  <div>
                    <span className="preview-label">
                      PROCUREMENT REQUEST
                    </span>

                    <h3>
                      Business laptops
                    </h3>
                  </div>

                  <span className="requirement-chip">
                    100 units
                  </span>
                </div>

                <div className="preview-metrics">

                  <div>
                    <span>Max delivery</span>
                    <strong>10 days</strong>
                  </div>

                  <div>
                    <span>Min warranty</span>
                    <strong>3 years</strong>
                  </div>

                  <div>
                    <span>Suppliers</span>
                    <strong>3 qualified</strong>
                  </div>

                </div>

                <div className="preview-supplier">

                  <div className="supplier-avatar">
                    TS
                  </div>

                  <div className="supplier-info">
                    <strong>TechSource India</strong>
                    <span>Best overall match</span>
                  </div>

                  <div className="preview-price">
                    <strong>₹4,82,500</strong>
                    <span>94 / 100</span>
                  </div>

                </div>

                <div className="preview-bar">
                  <div></div>
                </div>

                <div className="preview-footer">
                  <span>✓ Meets all requirements</span>
                  <span>Recommended supplier</span>
                </div>

              </div>
            </div>

          </section>


          {/* HOW IT WORKS */}

          <section
            className="how-section"
            id="how-it-works"
          >

            <div className="section-heading">
              <span className="eyebrow">
                HOW QUOTEPILOT WORKS
              </span>

              <h2>
                From requirement to recommendation.
              </h2>

              <p>
                Let the agent handle the research while you focus
                on the decision.
              </p>
            </div>


            <div className="steps">

              <div className="step-card">
                <div className="step-number">01</div>

                <div className="step-icon">⌕</div>

                <h3>Define your need</h3>

                <p>
                  Enter the product, quantity, delivery requirements
                  and warranty expectations.
                </p>
              </div>


              <div className="step-card">
                <div className="step-number">02</div>

                <div className="step-icon">◎</div>

                <h3>Agent researches</h3>

                <p>
                  QuotePilot explores supplier websites and learns
                  how each supplier handles quotations.
                </p>
              </div>


              <div className="step-card">
                <div className="step-number">03</div>

                <div className="step-icon">↗</div>

                <h3>Compare & decide</h3>

                <p>
                  Quotes are normalized, requirements are checked,
                  and the strongest option is highlighted.
                </p>
              </div>

            </div>

          </section>


          {/* BOTTOM CTA */}

          <section className="bottom-cta">

            <div>
              <span className="eyebrow">
                READY WHEN YOU ARE
              </span>

              <h2>
                Turn your next procurement request
                into a decision.
              </h2>
            </div>

            <button
              className="primary-button"
              onClick={handleStart}
            >
              Start comparing
              <span>→</span>
            </button>

          </section>

        </main>
      )}


      {/* ================= COMPARISON PAGE ================= */}

      {page === "compare" && (
        <main className="compare-page">

          <div className="page-header">

            <div>
              <span className="eyebrow">
                PROCUREMENT WORKSPACE
              </span>

              <h1>
                Compare supplier quotes
              </h1>

              <p>
                Tell QuotePilot what you need and let the agent
                find the strongest qualifying supplier.
              </p>
            </div>

            <button
              className="reset-button"
              onClick={resetComparison}
            >
              ↻ New request
            </button>

          </div>


          {/* REQUIREMENTS */}

          <section className="workspace-card">

            <div className="card-header">

              <div>
                <span className="card-kicker">
                  STEP 01
                </span>

                <h2>
                  Procurement requirements
                </h2>
              </div>

              <span className="card-status">
                {isRunning ? "Running" : "Ready"}
              </span>

            </div>


            <form onSubmit={handleSubmit}>

              <div className="input-grid">

                <div className="input-group large">
                  <label>
                    Product or service
                  </label>

                  <div className="input-wrapper">
                    <span>⌕</span>

                    <input
                      type="text"
                      placeholder="e.g. Business laptops"
                      value={product}
                      onChange={(e) =>
                        setProduct(e.target.value)
                      }
                      required
                    />
                  </div>
                </div>


                <div className="input-group">
                  <label>
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(e.target.value)
                    }
                    required
                  />
                </div>


                <div className="input-group">
                  <label>
                    Max delivery
                  </label>

                  <div className="input-suffix">
                    <input
                      type="number"
                      min="1"
                      placeholder="10"
                      value={deliveryDays}
                      onChange={(e) =>
                        setDeliveryDays(e.target.value)
                      }
                      required
                    />

                    <span>days</span>
                  </div>
                </div>


                <div className="input-group">
                  <label>
                    Min warranty
                  </label>

                  <div className="input-suffix">
                    <input
                      type="number"
                      min="0"
                      placeholder="3"
                      value={warrantyYears}
                      onChange={(e) =>
                        setWarrantyYears(e.target.value)
                      }
                      required
                    />

                    <span>years</span>
                  </div>
                </div>

              </div>


              <button
                className="run-button"
                type="submit"
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <span className="spinner"></span>
                    Agent is researching suppliers...
                  </>
                ) : (
                  <>
                    ✦ Compare supplier quotes
                    <span>→</span>
                  </>
                )}
              </button>

            </form>

          </section>


          {/* AGENT ACTIVITY */}

          <section className="workspace-card activity-card">

            <div className="card-header">

              <div>
                <span className="card-kicker">
                  STEP 02
                </span>

                <h2>
                  Agent activity
                </h2>
              </div>

              <span
                className={`activity-status ${
                  isRunning ? "active" : ""
                }`}
              >
                <span></span>
                {isRunning ? "Working" : "Standing by"}
              </span>

            </div>


            <div className="timeline">

              <div
                className={`timeline-item ${
                  isRunning || showResults ? "completed" : "current"
                }`}
              >
                <div className="timeline-icon">
                  {isRunning || showResults ? "✓" : "1"}
                </div>

                <div>
                  <strong>Understand requirements</strong>
                  <span>
                    Requirements captured and validated
                  </span>
                </div>
              </div>


              <div
                className={`timeline-item ${
                  showResults ? "completed" : isRunning ? "current" : ""
                }`}
              >
                <div className="timeline-icon">
                  {showResults ? "✓" : "2"}
                </div>

                <div>
                  <strong>Explore supplier websites</strong>
                  <span>
                    Discovering relevant supplier options
                  </span>
                </div>
              </div>


              <div
                className={`timeline-item ${
                  showResults ? "completed" : isRunning ? "current" : ""
                }`}
              >
                <div className="timeline-icon">
                  {showResults ? "✓" : "3"}
                </div>

                <div>
                  <strong>Collect supplier quotes</strong>
                  <span>
                    Gathering and normalizing quotation data
                  </span>
                </div>
              </div>


              <div
                className={`timeline-item ${
                  showResults ? "completed" : ""
                }`}
              >
                <div className="timeline-icon">
                  {showResults ? "✓" : "4"}
                </div>

                <div>
                  <strong>Compare qualifying quotes</strong>
                  <span>
                    Evaluating price, delivery and warranty
                  </span>
                </div>
              </div>

            </div>

          </section>


          {/* RESULTS */}

          <section className="results-section">

            <div className="results-header">

              <div>
                <span className="card-kicker">
                  STEP 03
                </span>

                <h2>
                  Quote comparison
                </h2>

                <p>
                  {showResults
                    ? "3 suppliers matched your procurement requirements."
                    : "Supplier quotes will appear here once the agent completes its research."}
                </p>
              </div>

              {showResults && (
                <span className="qualified-count">
                  3 Qualified
                </span>
              )}

            </div>


            {!showResults && !isRunning && (
              <div className="results-empty">

                <div className="empty-orb">
                  ◎
                </div>

                <h3>
                  Waiting for supplier research
                </h3>

                <p>
                  Submit your requirements above to start
                  the supplier discovery process.
                </p>

              </div>
            )}


            {isRunning && (
              <div className="results-empty loading-state">

                <div className="loading-ring"></div>

                <h3>
                  Finding the best suppliers...
                </h3>

                <p>
                  QuotePilot is researching supplier websites
                  and collecting quotation information.
                </p>

              </div>
            )}


            {showResults && (
              <div className="quotes-grid">

                {demoQuotes.map((quote, index) => (
                  <div
                    className={`quote-card ${
                      index === 0 ? "recommended-card" : ""
                    }`}
                    key={quote.supplier}
                  >

                    {index === 0 && (
                      <div className="recommended-ribbon">
                        ★ Recommended
                      </div>
                    )}

                    <div className="quote-top">

                      <div
                        className={`supplier-avatar large ${quote.accent}`}
                      >
                        {quote.initials}
                      </div>

                      <div className="quote-supplier">
                        <h3>{quote.supplier}</h3>

                        <span>
                          {quote.status}
                        </span>
                      </div>

                    </div>


                    <div className="quote-price">
                      <span>Total quote</span>

                      <strong>
                        {quote.price}
                      </strong>

                      <small>
                        {quote.unitPrice}
                      </small>
                    </div>


                    <div className="quote-details">

                      <div>
                        <span>Delivery</span>
                        <strong>{quote.delivery}</strong>
                      </div>

                      <div>
                        <span>Warranty</span>
                        <strong>{quote.warranty}</strong>
                      </div>

                    </div>


                    <div className="match-score">

                      <div className="score-header">
                        <span>Requirement match</span>
                        <strong>{quote.score}%</strong>
                      </div>

                      <div className="score-track">
                        <div
                          style={{
                            width: `${quote.score}%`,
                          }}
                        ></div>
                      </div>

                    </div>


                    <button className="view-quote">
                      View quote
                      <span>→</span>
                    </button>

                  </div>
                ))}

              </div>
            )}

          </section>


          {/* RECOMMENDATION */}

          {showResults && (
            <section className="recommendation-card">

              <div className="recommendation-glow"></div>

              <div className="recommendation-content">

                <div className="recommendation-icon">
                  ★
                </div>

                <div className="recommendation-text">

                  <span className="eyebrow">
                    QUOTEPILOT RECOMMENDATION
                  </span>

                  <h2>
                    TechSource India is the strongest match.
                  </h2>

                  <p>
                    It offers the best overall combination of
                    price, delivery time and warranty while meeting
                    all your stated requirements.
                  </p>

                  <div className="recommendation-reasons">

                    <span>✓ Lowest qualifying price</span>
                    <span>✓ Meets 10-day delivery target</span>
                    <span>✓ Meets 3-year warranty requirement</span>

                  </div>

                </div>

                <button className="select-button">
                  Select supplier
                  <span>→</span>
                </button>

              </div>

            </section>
          )}

        </main>
      )}


      {/* FOOTER */}

      <footer className="footer">

        <div>
          <strong>QuotePilot</strong>
          <span>
            Procurement intelligence, without the spreadsheet chaos.
          </span>
        </div>

        <span>
          AI-assisted supplier research
        </span>

      </footer>

    </div>
  );
}

export default App;
