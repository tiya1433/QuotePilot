import { useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "₹0";
  }

  return `₹${Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function getInitials(name) {
  if (!name) return "SP";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function getAccent(index) {
  const accents = ["blue", "purple", "cyan"];
  return accents[index % accents.length];
}

function getMatchScore(quote, comparisonItem) {
  if (!comparisonItem?.meets_requirements) {
    return 0;
  }

  /*
   * This is only a UI score.
   *
   * The actual qualification decision comes from the backend:
   * comparisonItem.meets_requirements
   *
   * Qualified suppliers receive a score based on their price
   * ranking so the UI can visually communicate ranking without
   * inventing a new backend decision.
   */

  const rank = comparisonItem.rank;

  if (rank === 1) return 100;
  if (rank === 2) return 94;
  if (rank === 3) return 89;

  return Math.max(70, 100 - (rank - 1) * 5);
}

function App() {
  const [page, setPage] = useState("home");

  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [warrantyYears, setWarrantyYears] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");

  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const quotes = useMemo(() => {
    if (!result?.quotes) {
      return [];
    }

    return result.quotes.map((quote, index) => {
      const comparisonItem =
        result.comparison?.find(
          (item) => item.quote_id === quote.quote_id
        ) || {};

      return {
        ...quote,
        initials: getInitials(quote.supplier),
        accent: getAccent(index),
        meetsRequirements:
          comparisonItem.meets_requirements ?? false,
        status: comparisonItem.meets_requirements
          ? quote.quote_id === result.best_quote?.quote_id
            ? "Best Match"
            : "Qualified"
          : "Disqualified",
        score: getMatchScore(
          quote,
          comparisonItem
        ),
        reasons: comparisonItem.reasons || [],
        rank: comparisonItem.rank,
        unitPrice:
          quote.quantity > 0
            ? formatCurrency(
                quote.price / quote.quantity
              ) + " / unit"
            : "",
      };
    });
  }, [result]);

  const qualifiedQuotes = quotes.filter(
    (quote) => quote.meetsRequirements
  );

  const bestQuote = result?.best_quote || null;

  const handleStart = () => {
    setPage("compare");
    setShowResults(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRunning) {
      return;
    }

    setIsRunning(true);
    setShowResults(false);
    setError("");
    setResult(null);

    const requestText =
      `I need ${quantity} ${product} ` +
      `delivered to ${deliveryLocation} ` +
      `within ${deliveryDays} days ` +
      `with at least ${warrantyYears} years warranty.`;

    try {
      const response = await fetch(
        `${API_URL}/api/quotes/compare`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            request: requestText,
          }),
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The backend returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            `Backend request failed with status ${response.status}.`
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Quote comparison failed."
        );
      }

      setResult(data);
      setShowResults(true);
    } catch (err) {
      console.error("QuotePilot API error:", err);

      setError(
        err.message ||
          "Could not connect to QuotePilot backend."
      );

      setShowResults(false);
    } finally {
      setIsRunning(false);
    }
  };

  const resetComparison = () => {
    setProduct("");
    setQuantity("");
    setDeliveryDays("");
    setWarrantyYears("");
    setDeliveryLocation("");

    setShowResults(false);
    setIsRunning(false);
    setResult(null);
    setError("");
  };

  const goHome = () => {
    setPage("home");
    resetComparison();
  };

  return (
    <div className="app">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="navbar">

        <div
          className="brand"
          onClick={goHome}
        >
          <div className="brand-mark">
            Q
          </div>

          <div>
            <div className="brand-name">
              QuotePilot
            </div>

            <div className="brand-subtitle">
              Supplier Intelligence
            </div>
          </div>
        </div>

        <div className="nav-right">

          <div className="agent-status">
            <span className="status-dot"></span>
            {isRunning
              ? "Agent Working"
              : "Agent Ready"}
          </div>

          {page === "compare" && (
            <button
              className="nav-back"
              onClick={goHome}
            >
              ← Home
            </button>
          )}

        </div>

      </header>


      {/* =====================================================
          LANDING PAGE
      ===================================================== */}

      {page === "home" && (
        <main className="landing-page">

          {/* HERO */}

          <section className="hero">

            <div className="hero-badge">
              <span>✦</span>
              AI-POWERED PROCUREMENT
            </div>

            <h1>
              Stop comparing quotes.
              <br />
              <span>Let the agent do it.</span>
            </h1>

            <p className="hero-description">
              QuotePilot researches supplier websites,
              collects real quotations, checks your
              requirements and recommends the strongest
              option automatically.
            </p>

            <div className="hero-actions">

              <button
                className="primary-button"
                onClick={handleStart}
              >
                Start comparing
                <span>→</span>
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                How it works
              </button>

            </div>

            <div className="hero-note">
              Real supplier research · Automated comparison ·
              Requirement-aware recommendation
            </div>

          </section>


          {/* HERO PREVIEW */}

          <section className="hero-preview">

            <div className="preview-window">

              <div className="preview-topbar">

                <div className="window-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="preview-title">
                  QuotePilot / Supplier Intelligence
                </div>

                <div className="preview-live">
                  ● Live
                </div>

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
                    <strong>7 days</strong>
                  </div>

                  <div>
                    <span>Min warranty</span>
                    <strong>2 years</strong>
                  </div>

                  <div>
                    <span>Suppliers</span>
                    <strong>3 researched</strong>
                  </div>

                </div>


                <div className="preview-supplier">

                  <div className="supplier-avatar">
                    GT
                  </div>

                  <div className="supplier-info">
                    <strong>
                      GlobalTech Traders
                    </strong>

                    <span>
                      Best overall match
                    </span>
                  </div>

                  <div className="preview-price">
                    <strong>
                      ₹4,95,000
                    </strong>

                    <span>
                      Best price
                    </span>
                  </div>

                </div>


                <div className="preview-bar">
                  <div></div>
                </div>


                <div className="preview-footer">

                  <span>
                    ✓ Meets all requirements
                  </span>

                  <span>
                    Recommended supplier
                  </span>

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
                Let the agent handle the research while
                you focus on the decision.
              </p>

            </div>


            <div className="steps">

              <div className="step-card">

                <div className="step-number">
                  01
                </div>

                <div className="step-icon">
                  ⌕
                </div>

                <h3>
                  Define your need
                </h3>

                <p>
                  Enter the product, quantity,
                  delivery requirements and
                  warranty expectations.
                </p>

              </div>


              <div className="step-card">

                <div className="step-number">
                  02
                </div>

                <div className="step-icon">
                  ◎
                </div>

                <h3>
                  Agent researches
                </h3>

                <p>
                  QuotePilot explores supplier
                  websites and learns how each
                  supplier handles quotations.
                </p>

              </div>


              <div className="step-card">

                <div className="step-number">
                  03
                </div>

                <div className="step-icon">
                  ↗
                </div>

                <h3>
                  Compare & decide
                </h3>

                <p>
                  Quotes are normalized,
                  requirements are checked,
                  and the strongest option
                  is highlighted.
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
                Turn your next procurement
                request into a decision.
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


      {/* =====================================================
          COMPARISON PAGE
      ===================================================== */}

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
                Tell QuotePilot what you need and let
                the agent find the strongest qualifying
                supplier.
              </p>

            </div>


            <button
              className="reset-button"
              onClick={resetComparison}
              disabled={isRunning}
            >
              ↻ New request
            </button>

          </div>


          {/* =================================================
              REQUIREMENTS
          ================================================= */}

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
                {isRunning
                  ? "Running"
                  : showResults
                    ? "Completed"
                    : "Ready"}
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
                    Delivery location
                  </label>

                  <input
                    type="text"
                    placeholder="Kolkata"
                    value={deliveryLocation}
                    onChange={(e) =>
                      setDeliveryLocation(
                        e.target.value
                      )
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
                      placeholder="7"
                      value={deliveryDays}
                      onChange={(e) =>
                        setDeliveryDays(
                          e.target.value
                        )
                      }
                      required
                    />

                    <span>
                      days
                    </span>

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
                      step="0.5"
                      placeholder="2"
                      value={warrantyYears}
                      onChange={(e) =>
                        setWarrantyYears(
                          e.target.value
                        )
                      }
                      required
                    />

                    <span>
                      years
                    </span>

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


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <section
              className="workspace-card"
              style={{
                borderColor:
                  "rgba(248,113,113,0.35)",
                marginTop: "17px",
              }}
            >

              <div
                style={{
                  color: "#fca5a5",
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}
              >
                <strong>
                  QuotePilot could not complete the request.
                </strong>

                <div style={{ marginTop: "6px" }}>
                  {error}
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    color: "#8290a5",
                    fontSize: "11px",
                  }}
                >
                  Make sure the FastAPI backend is running
                  on port 8000.
                </div>
              </div>

            </section>
          )}


          {/* =================================================
              AGENT ACTIVITY
          ================================================= */}

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

                {isRunning
                  ? "Working"
                  : showResults
                    ? "Completed"
                    : "Standing by"}

              </span>

            </div>


            <div className="timeline">

              <div
                className={`timeline-item ${
                  isRunning || showResults
                    ? "completed"
                    : "current"
                }`}
              >

                <div className="timeline-icon">
                  {isRunning || showResults
                    ? "✓"
                    : "1"}
                </div>

                <div>
                  <strong>
                    Understand requirements
                  </strong>

                  <span>
                    Requirements captured and validated
                  </span>
                </div>

              </div>


              <div
                className={`timeline-item ${
                  showResults
                    ? "completed"
                    : isRunning
                      ? "current"
                      : ""
                }`}
              >

                <div className="timeline-icon">
                  {showResults
                    ? "✓"
                    : "2"}
                </div>

                <div>
                  <strong>
                    Explore supplier websites
                  </strong>

                  <span>
                    Discovering relevant supplier options
                  </span>
                </div>

              </div>


              <div
                className={`timeline-item ${
                  showResults
                    ? "completed"
                    : isRunning
                      ? "current"
                      : ""
                }`}
              >

                <div className="timeline-icon">
                  {showResults
                    ? "✓"
                    : "3"}
                </div>

                <div>
                  <strong>
                    Collect supplier quotes
                  </strong>

                  <span>
                    Gathering and normalizing quotation data
                  </span>
                </div>

              </div>


              <div
                className={`timeline-item ${
                  showResults
                    ? "completed"
                    : ""
                }`}
              >

                <div className="timeline-icon">
                  {showResults
                    ? "✓"
                    : "4"}
                </div>

                <div>
                  <strong>
                    Compare qualifying quotes
                  </strong>

                  <span>
                    Evaluating price, delivery and warranty
                  </span>
                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              RESULTS
          ================================================= */}

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
                    ? `${quotes.length} supplier${
                        quotes.length === 1
                          ? ""
                          : "s"
                      } researched. ${
                        qualifiedQuotes.length
                      } qualified.`
                    : "Supplier quotes will appear here once the agent completes its research."}
                </p>

              </div>


              {showResults && (
                <span className="qualified-count">
                  {qualifiedQuotes.length} Qualified
                </span>
              )}

            </div>


            {/* EMPTY */}

            {!showResults &&
              !isRunning &&
              !error && (
                <div className="results-empty">

                  <div className="empty-orb">
                    ◎
                  </div>

                  <h3>
                    Waiting for supplier research
                  </h3>

                  <p>
                    Submit your requirements above
                    to start the supplier discovery
                    process.
                  </p>

                </div>
              )}


            {/* LOADING */}

            {isRunning && (
              <div className="results-empty loading-state">

                <div className="loading-ring"></div>

                <h3>
                  Finding the best suppliers...
                </h3>

                <p>
                  QuotePilot is researching supplier
                  websites and collecting quotation
                  information.
                </p>

              </div>
            )}


            {/* REAL QUOTES */}

            {showResults && quotes.length > 0 && (
              <div className="quotes-grid">

                {quotes.map((quote) => {

                  const isBest =
                    quote.quote_id ===
                    bestQuote?.quote_id;

                  return (
                    <div
                      className={`quote-card ${
                        isBest
                          ? "recommended-card"
                          : ""
                      }`}
                      key={quote.quote_id}
                    >

                      {isBest && (
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

                          <h3>
                            {quote.supplier}
                          </h3>

                          <span
                            style={{
                              color:
                                quote.meetsRequirements
                                  ? "var(--green)"
                                  : "#fca5a5",
                            }}
                          >
                            {quote.status}
                          </span>

                        </div>

                      </div>


                      <div className="quote-price">

                        <span>
                          Total quote
                        </span>

                        <strong>
                          {formatCurrency(
                            quote.price
                          )}
                        </strong>

                        <small>
                          {quote.unitPrice}
                        </small>

                      </div>


                      <div className="quote-details">

                        <div>

                          <span>
                            Delivery
                          </span>

                          <strong>
                            {quote.delivery_days} days
                          </strong>

                        </div>


                        <div>

                          <span>
                            Warranty
                          </span>

                          <strong>
                            {quote.warranty_years} years
                          </strong>

                        </div>

                      </div>


                      <div className="match-score">

                        <div className="score-header">

                          <span>
                            Requirement match
                          </span>

                          <strong>
                            {quote.score}%
                          </strong>

                        </div>


                        <div className="score-track">

                          <div
                            style={{
                              width: `${quote.score}%`,
                            }}
                          ></div>

                        </div>

                      </div>


                      <button
                        className="view-quote"
                        type="button"
                        onClick={() => {
                          window.alert(
                            `Quote ID: ${quote.quote_id}\n\n` +
                            `Supplier: ${quote.supplier}\n` +
                            `Product: ${quote.product}\n` +
                            `Quantity: ${quote.quantity}\n` +
                            `Price: ${formatCurrency(
                              quote.price
                            )}\n` +
                            `Delivery: ${quote.delivery_days} days\n` +
                            `Warranty: ${quote.warranty_years} years`
                          );
                        }}
                      >
                        View quote
                        <span>→</span>
                      </button>

                    </div>
                  );
                })}

              </div>
            )}


            {showResults && quotes.length === 0 && (
              <div className="results-empty">

                <div className="empty-orb">
                  !
                </div>

                <h3>
                  No supplier quotes received
                </h3>

                <p>
                  The backend completed the request,
                  but no supplier returned a usable quote.
                </p>

              </div>
            )}

          </section>


          {/* =================================================
              RECOMMENDATION
          ================================================= */}

          {showResults && bestQuote && (
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
                    {bestQuote.supplier} is the
                    strongest match.
                  </h2>

                  <p>
                    It has the lowest qualifying
                    total price while satisfying
                    your delivery and warranty
                    requirements.
                  </p>


                  <div className="recommendation-reasons">

                    <span>
                      ✓ Lowest qualifying price
                    </span>

                    <span>
                      ✓ Meets{" "}
                      {result.requirements
                        ?.max_delivery_days}-
                      day delivery target
                    </span>

                    <span>
                      ✓ Meets{" "}
                      {result.requirements
                        ?.min_warranty_years}-
                      year warranty requirement
                    </span>

                  </div>

                </div>


                <button
                  className="select-button"
                  type="button"
                  onClick={() => {
                    window.alert(
                      `Selected supplier:\n\n` +
                      `${bestQuote.supplier}\n` +
                      `Quote ID: ${bestQuote.quote_id}\n` +
                      `Price: ${formatCurrency(
                        bestQuote.price
                      )}`
                    );
                  }}
                >
                  Select supplier
                  <span>→</span>
                </button>

              </div>

            </section>
          )}


          {/* NO QUALIFYING SUPPLIER */}

          {showResults && !bestQuote && (
            <section className="recommendation-card">

              <div className="recommendation-content">

                <div className="recommendation-icon">
                  !
                </div>

                <div className="recommendation-text">

                  <span className="eyebrow">
                    QUOTEPILOT RESULT
                  </span>

                  <h2>
                    No supplier satisfies all
                    requirements.
                  </h2>

                  <p>
                    The supplier quotes were collected,
                    but none satisfied every requirement
                    you specified.
                  </p>

                </div>

              </div>

            </section>
          )}

        </main>
      )}


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="footer">

        <div>

          <strong>
            QuotePilot
          </strong>

          <span>
            Procurement intelligence,
            without the spreadsheet chaos.
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