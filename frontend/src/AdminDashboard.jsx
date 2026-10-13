
import { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API = "https://qube-cinema-backend.onrender.com";

function AdminDashboard() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [enquiries, setEnquiries] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loginLoading, setLoginLoading] = useState(false);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  async function login(event) {
    event.preventDefault();
    setLoginLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed.");
      }

      setToken(data.access_token);
      setLoggedIn(true);
      setPassword("");
    } catch (err) {
      setError(err.message || "Could not connect to backend.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function loadEnquiries(authToken = token) {
    setEnquiriesLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/api/admin/enquiries`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setLoggedIn(false);
          setToken("");
        }
        throw new Error(data.detail || "Could not load enquiries.");
      }

      setEnquiries(data.enquiries || []);
    } catch (err) {
      setError(err.message || "Could not load enquiries.");
    } finally {
      setEnquiriesLoading(false);
    }
  }

  async function loadBookings(authToken = token) {
    setBookingsLoading(true);

    try {
      const response = await fetch(`${API}/api/admin/bookings`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setLoggedIn(false);
          setToken("");
        }
        throw new Error(data.detail || "Could not load demo bookings.");
      }

      setBookings(data.demo_bookings || []);
    } catch (err) {
      setError((previous) =>
        previous
          ? `${previous} | ${err.message}`
          : err.message || "Could not load demo bookings."
      );
    } finally {
      setBookingsLoading(false);
    }
  }

  async function refreshDashboard() {
    if (!token) return;

    await Promise.all([
      loadEnquiries(token),
      loadBookings(token),
    ]);
  }

  useEffect(() => {
    if (loggedIn && token) {
      loadEnquiries(token);
      loadBookings(token);
    }
  }, [loggedIn, token]);

  function logout() {
    setLoggedIn(false);
    setToken("");
    setEnquiries([]);
    setBookings([]);
    setError("");
    setUsername("");
    setPassword("");
  }

  if (!loggedIn) {
    return (
      <main className="admin-page">
        <section className="admin-table-section">
          <p className="admin-label">QUBE CINEMA · MANAGEMENT</p>
          <h1>Admin Login</h1>
          <p>Sign in to access enquiries and demo bookings.</p>

          <form onSubmit={login}>
            <p>
              <label htmlFor="admin-username">Username</label>
              <br />
              <input
                id="admin-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </p>

            <p>
              <label htmlFor="admin-password">Password</label>
              <br />
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </p>

            {error && <p role="alert">{error}</p>}

            <button type="submit" disabled={loginLoading}>
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-label">QUBE CINEMA · MANAGEMENT</p>
          <h1>Admin Dashboard</h1>
          <p>Manage website enquiries and demo bookings.</p>
        </div>

        <div>
          <button
            onClick={refreshDashboard}
            disabled={enquiriesLoading || bookingsLoading}
          >
            {enquiriesLoading || bookingsLoading
              ? "Loading..."
              : "↻ Refresh"}
          </button>{" "}
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {error && <p role="alert">{error}</p>}

      <div className="admin-stat-grid">
        <section className="admin-stat">
          <span>Total Enquiries</span>
          <strong>{enquiries.length}</strong>
        </section>

        <section className="admin-stat">
          <span>Demo Bookings</span>
          <strong>{bookings.length}</strong>
        </section>
      </div>

      <section className="admin-table-section">
        <h2>Recent Demo Bookings</h2>
        <p>
          These are locally saved demo records, not confirmed real cinema
          tickets.
        </p>

        {bookingsLoading && <p>Loading demo bookings...</p>}

        {!bookingsLoading && bookings.length === 0 && (
          <p>No demo bookings saved yet. Complete a demo booking in Qube AI first.</p>
        )}

        {!bookingsLoading && bookings.length > 0 && (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>City</th>
                  <th>Movie</th>
                  <th>Theatre</th>
                  <th>Showtime</th>
                  <th>Tickets</th>
                  <th>Seats</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((item) => (
                  <tr key={item.id}>
                    <td>{item.booking_ref}</td>
                    <td>{item.city}</td>
                    <td>{item.movie}</td>
                    <td>{item.theatre}</td>
                    <td>{item.showtime}</td>
                    <td>{item.tickets}</td>
                    <td>{item.seats}</td>
                    <td>
                      {item.currency === "USD" ? "$" : "₹"}
                      {item.total}
                    </td>
                    <td>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-table-section">
        <h2>Recent Enquiries</h2>

        {enquiriesLoading && <p>Loading enquiries...</p>}

        {!enquiriesLoading && enquiries.length === 0 && (
          <p>No enquiries received yet.</p>
        )}

        {!enquiriesLoading && enquiries.length > 0 && (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Message</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {enquiries.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.message}</td>
                    <td>{item.request_type}</td>
                    <td>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;
