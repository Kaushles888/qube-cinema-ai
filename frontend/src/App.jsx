import { useState } from "react";
import "./App.css";
import AdminDashboard from "./AdminDashboard";

const products = [
  {
    number: "01",
    title: "Qube Wire",
    category: "CONTENT DISTRIBUTION",
    description:
      "Explore digital cinema content distribution solutions designed for the cinema ecosystem.",
  },
  {
    number: "02",
    title: "Qube XP",
    category: "CINEMA TECHNOLOGY",
    description:
      "Discover cinema technology solutions and learn how they support modern exhibition.",
  },
  {
    number: "03",
    title: "QubeMaster",
    category: "CONTENT PREPARATION",
    description:
      "Explore tools associated with preparing digital cinema content for distribution.",
  },
];

const services = [
  {
    title: "Cinema Technology",
    description:
      "Discover technology and solutions for cinema operators and exhibition partners.",
  },
  {
    title: "Content Services",
    description:
      "Explore digital cinema content preparation, delivery and related services.",
  },
  {
    title: "Advertising Solutions",
    description:
      "Learn about cinema advertising opportunities and audience engagement.",
  },
];

const demoMovies = [
  {
    id: 1,
    city: "Delhi",
    country: "India",
    title: "Jawan",
    poster: "/posters/jawan.jpg",
    language: "Hindi",
    price: 250,
    theatre: "Qube Demo Cinemas - Delhi",
    showtimes: ["12:00 PM", "3:30 PM", "7:00 PM"],
  },
  {
    id: 2,
    city: "Delhi",
    country: "India",
    title: "Fighter",
    poster: "/posters/fighter.jpg",
    language: "Hindi",
    price: 220,
    theatre: "Qube Demo Cinemas - Delhi",
    showtimes: ["11:00 AM", "4:00 PM", "8:00 PM"],
  },
  {
    id: 3,
    city: "Delhi",
    country: "India",
    title: "3 Idiots",
    poster: "/posters/3-idiots.jpg",
    language: "Hindi",
    price: 180,
    theatre: "Qube Demo Cinemas - Delhi",
    showtimes: ["10:00 AM", "2:00 PM", "6:00 PM"],
  },
  {
    id: 4,
    city: "Chennai",
    country: "India",
    title: "Leo",
    poster: "/posters/leo.jpg",
    language: "Tamil",
    price: 200,
    theatre: "Qube Demo Cinemas - Chennai",
    showtimes: ["11:00 AM", "3:00 PM", "7:30 PM"],
  },
  {
    id: 5,
    city: "Chennai",
    country: "India",
    title: "Vikram",
    poster: "/posters/vikram.jpg",
    language: "Tamil",
    price: 180,
    theatre: "Qube Demo Cinemas - Chennai",
    showtimes: ["10:30 AM", "2:30 PM", "6:30 PM"],
  },
  {
    id: 6,
    city: "Chennai",
    country: "India",
    title: "Master",
    poster: "/posters/master.jpg",
    language: "Tamil",
    price: 190,
    theatre: "Qube Demo Cinemas - Chennai",
    showtimes: ["12:00 PM", "4:00 PM", "8:00 PM"],
  },
  {
    id: 7,
    city: "Bengaluru",
    country: "India",
    title: "Kantara",
    poster: "/posters/kantara.jpg",
    language: "Kannada",
    price: 220,
    theatre: "Qube Demo Cinemas - Bengaluru",
    showtimes: ["11:30 AM", "3:30 PM", "7:30 PM"],
  },
  {
    id: 8,
    city: "Bengaluru",
    country: "India",
    title: "KGF Chapter 2",
    poster: "/posters/KGF ch 2.jpg",
    language: "Kannada",
    price: 250,
    theatre: "Qube Demo Cinemas - Bengaluru",
    showtimes: ["10:00 AM", "2:00 PM", "6:00 PM"],
  },
  {
    id: 9,
    city: "Bengaluru",
    country: "India",
    title: "777 Charlie",
    poster: "/posters/charlie.jpg",
    language: "Kannada",
    price: 180,
    theatre: "Qube Demo Cinemas - Bengaluru",
    showtimes: ["12:00 PM", "4:00 PM", "8:00 PM"],
  },
  {
    id: 10,
    city: "New York",
    country: "USA",
    title: "Interstellar",
    poster: "/posters/interstellar.jpg",
    language: "English",
    price: 18,
    theatre: "Qube Demo Cinemas - New York",
    showtimes: ["12:00 PM", "4:00 PM", "8:00 PM"],
  },
  {
    id: 11,
    city: "Los Angeles",
    country: "USA",
    title: "Inception",
    poster: "/posters/inception.jpg",
    language: "English",
    price: 20,
    theatre: "Qube Demo Cinemas - Los Angeles",
    showtimes: ["11:00 AM", "3:00 PM", "7:00 PM"],
  },
  {
    id: 12,
    city: "Chicago",
    country: "USA",
    title: "The Dark Knight",
    poster: "/posters/tdk.jpg",
    language: "English",
    price: 16,
    theatre: "Qube Demo Cinemas - Chicago",
    showtimes: ["12:30 PM", "4:30 PM", "8:30 PM"],
  },
  {
    id: 13,
    city: "San Francisco",
    country: "USA",
    title: "Dune",
    poster: "/posters/dune.jpg",
    language: "English",
    price: 19,
    theatre: "Qube Demo Cinemas - San Francisco",
    showtimes: ["11:30 AM", "3:30 PM", "7:30 PM"],
  },
];

function App() {
  const isAdminPage = window.location.pathname === "/admin";

  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm Qube AI. Ask me about Qube Cinema, products, services or business enquiries.",
    },
  ]);

  const [enquiry, setEnquiry] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [enquiryStatus, setEnquiryStatus] = useState("");
  const [enquiryLoading, setEnquiryLoading] = useState(false);

  const [selectedCity, setSelectedCity] = useState("All");
  const [movieSearch, setMovieSearch] = useState("");

  const cities = [
    "All",
    "Delhi",
    "Chennai",
    "Bengaluru",
    "New York",
    "Los Angeles",
    "Chicago",
    "San Francisco",
  ];

 const filteredMovies = demoMovies.filter((movie) => {
  const cityMatches =
    selectedCity === "All" || movie.city === selectedCity;

  const query = movieSearch.trim().toLowerCase();

  const searchableText = [
    movie.title,
    movie.city,
    movie.language,
    movie.theatre,
  ]
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ");

  const searchMatches = !query || searchableText.includes(query);

  return cityMatches && searchMatches;
});
  async function submitEnquiry(event) {
    event.preventDefault();
    setEnquiryStatus("");
    setEnquiryLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/enquiries",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(enquiry),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.detail || data.error || "Submission failed."
        );
      }

      setEnquiryStatus("Enquiry saved successfully!");
      setEnquiry({ name: "", email: "", message: "" });
    } catch (error) {
      setEnquiryStatus(
        error.message ||
          "Could not submit your enquiry. Please try again."
      );
    } finally {
      setEnquiryLoading(false);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();

    const question = message.trim();
    if (!question) return;

    setMessages((previous) => [
      ...previous,
      { sender: "user", text: question },
    ]);

    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: question }),
        }
      );

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = await response.json();

      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: data.reply || "Sorry, I couldn't answer that.",
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: "I couldn't connect to Qube AI. Please make sure the backend is running and try again.",
        },
      ]);
    }
  }

  if (window.location.pathname === "/admin") {
    return <AdminDashboard />;
  }

  return (
    <div className="site-shell">
      <header className="navbar">
        <a className="brand" href="#home" aria-label="Qube Cinema home">
          <span className="brand-symbol">Q</span>
          <span>
            <strong>QUBE</strong>
            <small>CINEMA TECHNOLOGY</small>
          </span>
        </a>

        <nav className="nav-links">
          <a href="#about">About</a>
          <a href="#products">Products</a>
          <a href="#movies">Movies</a>
          <a href="#services">Solutions</a>
          <a href="#contact">Contact</a>
        </nav>

        <button
          className="nav-cta"
          onClick={() => setChatOpen(true)}
        >
          Ask Qube AI ↗
        </button>
      </header>
            <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="status-dot" />
              TECHNOLOGY FOR THE CINEMA ECOSYSTEM
            </div>

            <h1>
              Cinema,
              <br />
              <span>reimagined.</span>
            </h1>

            <p>
              Discover digital cinema technology, content services and
              solutions built to support the evolving world of cinema.
            </p>

            <div className="hero-actions">
              <a className="button-primary" href="#products">
                Explore our technology ↗
              </a>
              <a className="button-secondary" href="#about">
                Discover Qube
              </a>
            </div>

            <div className="hero-note">
              DIGITAL CINEMA <span>·</span> TECHNOLOGY <span>·</span> SERVICES
            </div>
          </div>

          <div
            className="hero-art"
            aria-label="Abstract cinema technology artwork"
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="glow" />
            <div className="cinema-screen">
              <div className="screen-inner">
                <span className="play-icon">▶</span>
                <span className="screen-label">THE FUTURE OF CINEMA</span>
              </div>
            </div>
            <div className="floating-card">
              <span className="card-dot" />
              DIGITAL CINEMA ECOSYSTEM
              <strong>Connected by technology.</strong>
            </div>
            <div className="art-caption">01 / BEYOND THE SCREEN</div>
          </div>

          <div className="hero-index">Q / 001</div>
        </section>

        <section className="intro section-pad" id="about">
          <div className="section-kicker">01 — ABOUT QUBE</div>
          <div className="intro-grid">
            <h2>
              More than a screen.
              <br />
              <span>A world of cinema technology.</span>
            </h2>
            <div>
              <p>
                Qube Cinema works across digital cinema technology and
                services. Explore the products and solutions presented here
                to learn more about the cinema ecosystem.
              </p>
              <a className="text-link" href="#services">
                Explore our solutions <span>↗</span>
              </a>
            </div>
          </div>
        </section>

        <section className="products section-pad" id="products">
          <div className="section-heading">
            <div>
              <div className="section-kicker">02 — OUR TECHNOLOGY</div>
              <h2>Explore the ecosystem.</h2>
            </div>
            <p>
              A first look at selected products. Visit Qube Cinema's official
              website for authoritative, up-to-date product information.
            </p>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.title}>
                <div className="product-top">
                  <span>{product.number} / PRODUCT</span>
                  <span className="product-arrow">↗</span>
                </div>

                <div className="product-graphic">
                  <div className="graphic-ring" />
                  <div className="graphic-core">Q</div>
                </div>

                <div className="product-category">{product.category}</div>
                <h3>{product.title}</h3>
                <p>{product.description}</p>

                <button
                  className="text-link product-link"
                  onClick={() => {
                    setMessage(`Tell me about ${product.title}`);
                    setChatOpen(true);
                  }}
                >
                  Ask Qube AI <span>↗</span>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="movies section-pad" id="movies">
          <div className="section-heading">
            <div>
              <div className="section-kicker">03 — MOVIE EXPLORER</div>
              <h2>Find your next movie.</h2>
            </div>
            <p>
              Explore sample movie listings by city and start a demo booking
              conversation with Qube AI.
            </p>
          </div>

          <div className="movie-filters">
            <label htmlFor="city-filter">Select a city</label>
            <select
              id="city-filter"
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value)}
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city === "All" ? "All cities" : city}
                </option>
              ))}
            </select>
          </div>
<div className="movie-search-bar">
  <input
    type="search"
    placeholder="Search movies, cities, languages..."
    value={movieSearch}
    onChange={(event) => setMovieSearch(event.target.value)}
    aria-label="Search movies"
  />

  {movieSearch && (
    <button
      type="button"
      onClick={() => setMovieSearch("")}
    >
      Clear
    </button>
  )}
</div>
          <div className="movie-grid">
            {filteredMovies.map((movie) => (
              <article className="movie-card" key={movie.id}>
                <div className="movie-poster">
  {movie.poster ? (
    <img
      className="movie-poster-image"
      src={movie.poster}
      alt={`${movie.title} movie poster`}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  ) : (
    <span className="movie-poster-mark">Q</span>
  )}

  <span className="movie-poster-city">{movie.city}</span>
</div>

                <div className="movie-card-content">
                  <span className="movie-language">
                    {movie.language} · {movie.country}
                  </span>

                  <h3>{movie.title}</h3>

                  <p>{movie.theatre}</p>

                  <div className="movie-showtimes">
                    {movie.showtimes.map((time) => (
                      <span key={time}>{time}</span>
                    ))}
                  </div>

                  <div className="movie-card-bottom">
                    <strong>
                      {movie.country === "USA" ? "$" : "₹"}
                      {movie.price}
                      <small> / ticket</small>
                    </strong>

                    <button
                      className="button-primary movie-book-button"
                      onClick={() => {
                        setMessage(
                          `I want to book ${movie.title} in ${movie.city}. Show me the demo booking steps.`
                        );
                        setChatOpen(true);
                      }}
                    >
                      Book demo
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="movie-disclaimer">
            Demo only: movie listings, theatres, showtimes and prices are
            illustrative and do not represent live availability. No real
            tickets or payments are processed.
          </p>
        </section>

        <section className="services section-pad" id="services">
          <div className="section-kicker">04 — WHAT WE DO</div>
          <h2>Technology that brings cinema together.</h2>

          <div className="service-grid">
            {services.map((service, index) => (
              <article className="service-card" key={service.title}>
                <span className="service-number">0{index + 1}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <a href="#contact" className="text-link">
                  Make an enquiry <span>↗</span>
                </a>
              </article>
            ))}
          </div>
        </section>
                <section className="contact section-pad" id="contact">
          <div className="section-kicker">05 — LET'S CONNECT</div>

          <div className="contact-inner">
            <h2>
              Have a cinema
              <br />
              <span>project in mind?</span>
            </h2>

            <p>
              Share your details and tell us about your business enquiry.
            </p>

            <form className="enquiry-form" onSubmit={submitEnquiry}>
              <input
                type="text"
                placeholder="Your name"
                aria-label="Your name"
                value={enquiry.name}
                onChange={(event) =>
                  setEnquiry({ ...enquiry, name: event.target.value })
                }
                required
              />

              <input
                type="email"
                placeholder="Your email"
                aria-label="Your email"
                value={enquiry.email}
                onChange={(event) =>
                  setEnquiry({ ...enquiry, email: event.target.value })
                }
                required
              />

              <textarea
                placeholder="Tell us about your project or enquiry"
                aria-label="Your message"
                value={enquiry.message}
                onChange={(event) =>
                  setEnquiry({ ...enquiry, message: event.target.value })
                }
                rows={4}
                required
              />

              <button
                className="button-primary"
                type="submit"
                disabled={enquiryLoading}
              >
                {enquiryLoading ? "Submitting..." : "Submit Enquiry ↗"}
              </button>

              {enquiryStatus && (
                <p role="status" aria-live="polite">
                  {enquiryStatus}
                </p>
              )}
            </form>

            <small>
              Independent demo prototype. Submissions are saved to the local
              demo database, not automatically sent to Qube Cinema.
            </small>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-symbol">Q</span>
          <span>
            <strong>QUBE</strong>
            <small>CINEMA TECHNOLOGY</small>
          </span>
        </a>

        <p>
          Independent website prototype · Not an official Qube Cinema website
        </p>

        <a href="#home">Back to top ↑</a>
      </footer>

      <button
        className="chat-launcher"
        onClick={() => setChatOpen(!chatOpen)}
        aria-label="Open Qube AI assistant"
      >
        <span className="chat-launcher-icon">✳</span>
        <span>Ask Qube AI</span>
      </button>

      {chatOpen && (
        <aside className="chat-panel" aria-label="Qube AI chat">
          <div className="chat-header">
            <div className="chat-avatar">Q</div>

            <div>
              <strong>Qube AI</strong>
              <small>
                <span className="status-dot" /> Website assistant demo
              </small>
            </div>

            <button
              className="chat-close"
              onClick={() => setChatOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="chat-messages" aria-live="polite">
            {messages.map((item, index) => (
              <div
                className={`chat-message ${item.sender}`}
                key={`${item.sender}-${index}`}
              >
                {item.text}
              </div>
            ))}
          </div>

          <form className="chat-form" onSubmit={sendMessage}>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about movies or Qube technology..."
              aria-label="Message Qube AI"
            />

            <button type="submit" aria-label="Send message">
              ↑
            </button>
          </form>

          <div className="chat-disclaimer">
            Prototype assistant · Answers are predefined
          </div>
        </aside>
      )}
    </div>
  );
}

export default App;