
import os
import re
import sqlite3
import secrets
from pathlib import Path
from datetime import datetime, timezone, timedelta

import jwt
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

load_dotenv(Path(__file__).with_name(".env"))

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
JWT_SECRET = os.getenv("JWT_SECRET")

if not ADMIN_USERNAME or not ADMIN_PASSWORD or not JWT_SECRET:
    raise RuntimeError("Admin login settings missing. Check backend/.env.")

app = FastAPI(title="Qube AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://qube-cinema-ai.vercel.app",
],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = Path(__file__).with_name("qube_ai.db")
bearer_scheme = HTTPBearer()

# Demo catalogue only: these are NOT live cinema listings.
MOVIES = [
    {"city": "Delhi", "country": "India", "title": "Jawan",
     "language": "Hindi", "price": 250,
     "theatre": "Qube Demo Cinemas - Delhi",
     "showtimes": ["12:00 PM", "3:30 PM", "7:00 PM"]},
    {"city": "Delhi", "country": "India", "title": "Fighter",
     "language": "Hindi", "price": 220,
     "theatre": "Qube Demo Cinemas - Delhi",
     "showtimes": ["11:00 AM", "4:00 PM", "8:00 PM"]},
    {"city": "Delhi", "country": "India", "title": "3 Idiots",
     "language": "Hindi", "price": 180,
     "theatre": "Qube Demo Cinemas - Delhi",
     "showtimes": ["10:00 AM", "2:00 PM", "6:00 PM"]},
    {"city": "Chennai", "country": "India", "title": "Leo",
     "language": "Tamil", "price": 200,
     "theatre": "Qube Demo Cinemas - Chennai",
     "showtimes": ["11:00 AM", "3:00 PM", "7:30 PM"]},
    {"city": "Chennai", "country": "India", "title": "Vikram",
     "language": "Tamil", "price": 180,
     "theatre": "Qube Demo Cinemas - Chennai",
     "showtimes": ["10:30 AM", "2:30 PM", "6:30 PM"]},
    {"city": "Chennai", "country": "India", "title": "Master",
     "language": "Tamil", "price": 190,
     "theatre": "Qube Demo Cinemas - Chennai",
     "showtimes": ["12:00 PM", "4:00 PM", "8:00 PM"]},
    {"city": "Bengaluru", "country": "India", "title": "Kantara",
     "language": "Kannada", "price": 220,
     "theatre": "Qube Demo Cinemas - Bengaluru",
     "showtimes": ["11:30 AM", "3:30 PM", "7:30 PM"]},
    {"city": "Bengaluru", "country": "India", "title": "KGF Chapter 2",
     "language": "Kannada", "price": 250,
     "theatre": "Qube Demo Cinemas - Bengaluru",
     "showtimes": ["10:00 AM", "2:00 PM", "6:00 PM"]},
    {"city": "Bengaluru", "country": "India", "title": "777 Charlie",
     "language": "Kannada", "price": 180,
     "theatre": "Qube Demo Cinemas - Bengaluru",
     "showtimes": ["12:00 PM", "4:00 PM", "8:00 PM"]},
    {"city": "New York", "country": "USA", "title": "Interstellar",
     "language": "English", "price": 18,
     "theatre": "Qube Demo Cinemas - New York",
     "showtimes": ["12:00 PM", "4:00 PM", "8:00 PM"]},
    {"city": "Los Angeles", "country": "USA", "title": "Inception",
     "language": "English", "price": 20,
     "theatre": "Qube Demo Cinemas - Los Angeles",
     "showtimes": ["11:00 AM", "3:00 PM", "7:00 PM"]},
    {"city": "Chicago", "country": "USA", "title": "The Dark Knight",
     "language": "English", "price": 16,
     "theatre": "Qube Demo Cinemas - Chicago",
     "showtimes": ["12:30 PM", "4:30 PM", "8:30 PM"]},
    {"city": "San Francisco", "country": "USA", "title": "Dune",
     "language": "English", "price": 19,
     "theatre": "Qube Demo Cinemas - San Francisco",
     "showtimes": ["11:30 AM", "3:30 PM", "7:30 PM"]},
]

# Simple explanations based on publicly described Qube Cinema products.
KNOWLEDGE = {
    "dcp": (
        "DCP means Digital Cinema Package. In simple terms, it is a "
        "standardised package of a movie's picture, sound and related "
        "files prepared for digital cinema playback."
    ),
    "kdm": (
        "KDM means Key Delivery Message. It carries the security keys "
        "and permissions needed to play encrypted cinema content on "
        "authorised equipment during the permitted period."
    ),
    "qube wire": (
        "Qube Wire is a web-based theatrical distribution service. "
        "It helps distributors manage digital cinema content and deliver "
        "DCPs and KDMs to theatres."
    ),
    "qube xp": (
        "Qube XP is a family of digital cinema servers. In simple terms, "
        "a cinema server stores and plays digital movie content for "
        "the cinema playback system."
    ),
    "qubemaster": (
        "QubeMaster is associated with digital cinema content preparation "
        "and mastering workflows. Exact capabilities depend on the product."
    ),
    "justickets": (
        "Justickets is Qube's movie-ticketing technology platform for "
        "the exhibition industry and movie-going audience."
    ),
    "moviebuff": (
        "Moviebuff is a movie information platform focused on film-related "
        "information, including Indian cinema."
    ),
    "icount": (
        "iCount is software designed to detect how many seats are occupied "
        "in a theatre or auditorium."
    ),
    "slydes": (
        "Slydes is a service for creating dynamic in-screen content "
        "for cinemas."
    ),
    "epiq": (
        "EPIQ is Qube's Premium Large Format cinema concept."
    ),
    "dci": (
        "DCI stands for Digital Cinema Initiatives. It is an industry "
        "organisation associated with specifications for digital cinema."
    ),
    "cpl": (
        "CPL means Composition Playlist. It identifies a composition "
        "within a digital cinema package and tells the playback system "
        "which assets belong together and in what order."
    ),
    "dkdm": (
        "DKDM means Distributor Key Delivery Message. It is used in "
        "digital cinema workflows to securely transfer key information "
        "for authorised content processing or distribution."
    ),
}

# In-memory conversation state is for a local demonstration only.
# For multiple users or deployment, use explicit session IDs and expiry.
booking_sessions = {}


def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_type TEXT NOT NULL,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS demo_bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                booking_ref TEXT UNIQUE NOT NULL,
                city TEXT NOT NULL,
                movie TEXT NOT NULL,
                theatre TEXT NOT NULL,
                showtime TEXT NOT NULL,
                tickets INTEGER NOT NULL,
                seats TEXT NOT NULL,
                total REAL NOT NULL,
                currency TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)


init_db()


class ChatMessage(BaseModel):
    message: str


class UserRequest(BaseModel):
    name: str
    email: str
    message: str


@app.get("/")
def home():
    return {"message": "Qube AI backend is running", "assistant": "Qube AI"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/movies")
def list_movies(city: str | None = None):
    if city:
        return {
            "demo": True,
            "movies": [
                movie for movie in MOVIES
                if movie["city"].lower() == city.strip().lower()
            ],
        }
    return {"demo": True, "movies": MOVIES}


def find_movie(text):
    lowered = text.lower()
    for movie in MOVIES:
        if movie["title"].lower() in lowered:
            return movie
    return None


def find_city(text):
    lowered = text.lower()
    cities = sorted(
        {movie["city"] for movie in MOVIES},
        key=len,
        reverse=True,
    )
    for city in cities:
        if city.lower() in lowered:
            return city
    # Handle common shorthand.
    if re.search(r"\bnyc\b", lowered):
        return "New York"
    if re.search(r"\bbangalore\b", lowered):
        return "Bengaluru"
    return None


def find_knowledge(text):
    lowered = text.lower()
    # Check longer names first to avoid partial matches.
    for term in sorted(KNOWLEDGE, key=len, reverse=True):
        if term in lowered:
            return KNOWLEDGE[term]
    return None


def save_request(request_type: str, data: UserRequest):
    name = data.name.strip()
    email = data.email.strip()
    message = data.message.strip()

    if not name or not email or not message:
        raise HTTPException(
            status_code=400,
            detail="Name, email and message are required.",
        )

    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid email address.",
        )

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            """
            INSERT INTO requests
            (request_type, name, email, message, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                request_type,
                name,
                email,
                message,
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        request_id = cursor.lastrowid

    return {
        "success": True,
        "request_id": request_id,
        "message": "Your request has been saved in this demo.",
    }


def start_booking():
    return {
        "stage": "city",
        "city": None,
        "movie": None,
        "showtime": None,
        "tickets": None,
        "seats": None,
    }


def booking_reply(session_key, user_text):
    state = booking_sessions.get(session_key)

    if state is None:
        state = start_booking()
        booking_sessions[session_key] = state

    text = user_text.strip()
    lowered = text.lower()

    if lowered in {"cancel", "cancel booking", "stop booking", "start over"}:
        booking_sessions.pop(session_key, None)
        return "Okay, I cancelled the demo booking conversation. You can start again anytime."

    if state["stage"] == "city":
        city = find_city(text)
        if not city:
            return (
                "Which city would you like to book in? Choose Delhi, Chennai, "
                "Bengaluru, New York, Los Angeles, Chicago or San Francisco."
            )

        state["city"] = city
        available = [m for m in MOVIES if m["city"] == city]
        titles = ", ".join(m["title"] for m in available)
        state["stage"] = "movie"
        return f"Great! Demo city: {city}. Available sample movies: {titles}. Which movie would you like?"

    if state["stage"] == "movie":
        movie = find_movie(text)
        if not movie or movie["city"] != state["city"]:
            titles = ", ".join(
                m["title"] for m in MOVIES if m["city"] == state["city"]
            )
            return f"Please choose a movie listed for {state['city']}: {titles}."

        state["movie"] = movie
        state["stage"] = "showtime"
        times = ", ".join(movie["showtimes"])
        return (
            f"{movie['title']} selected. Demo theatre: {movie['theatre']}. "
            f"Available sample showtimes: {times}. Which time do you prefer?"
        )

    if state["stage"] == "showtime":
        movie = state["movie"]
        selected_time = next(
            (time for time in movie["showtimes"]
             if time.lower() in lowered),
            None,
        )
        if not selected_time:
            times = ", ".join(movie["showtimes"])
            return f"Please choose one of these sample showtimes: {times}."

        state["showtime"] = selected_time
        state["stage"] = "tickets"
        return "How many tickets would you like? Please enter a number from 1 to 10."

    if state["stage"] == "tickets":
        match = re.search(r"\b(\d{1,2})\b", text)
        if not match or not 1 <= int(match.group(1)) <= 10:
            return "Please enter a valid ticket count from 1 to 10."

        state["tickets"] = int(match.group(1))
        state["stage"] = "seats"
        return (
            f"Got it: {state['tickets']} ticket(s). Enter your preferred seat "
            "labels separated by commas (for example A1, A2). This is a demo; "
            "seat availability is not checked."
        )

    if state["stage"] == "seats":
        seats = [seat.strip().upper() for seat in text.split(",") if seat.strip()]
        if len(seats) != state["tickets"]:
            return (
                f"Please enter exactly {state['tickets']} seat label(s), "
                "separated by commas. Example: A1, A2."
            )
        if len(set(seats)) != len(seats):
            return "Please enter different seat labels without duplicates."

        state["seats"] = seats
        movie = state["movie"]
        total = movie["price"] * state["tickets"]
        currency = "USD" if movie["country"] == "USA" else "INR"
        symbol = "$" if currency == "USD" else "₹"
        state["stage"] = "confirm"
        return (
            "Please review your DEMO booking:\n"
            f"City: {state['city']}\n"
            f"Movie: {movie['title']}\n"
            f"Theatre: {movie['theatre']}\n"
            f"Showtime: {state['showtime']}\n"
            f"Tickets: {state['tickets']}\n"
            f"Seats requested: {', '.join(seats)}\n"
            f"Sample total: {symbol}{total}\n\n"
            "Reply YES to save this demo booking, or NO to cancel. "
            "No real ticket or payment is involved."
        )

    if state["stage"] == "confirm":
        if lowered in {"yes", "y", "confirm", "confirm booking", "yes confirm"}:
            movie = state["movie"]
            total = movie["price"] * state["tickets"]
            currency = "USD" if movie["country"] == "USA" else "INR"
            booking_ref = "QDEMO-" + secrets.token_hex(4).upper()

            with sqlite3.connect(DB_PATH) as conn:
                conn.execute(
                    """
                    INSERT INTO demo_bookings
                    (booking_ref, city, movie, theatre, showtime, tickets,
                     seats, total, currency, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        booking_ref,
                        state["city"],
                        movie["title"],
                        movie["theatre"],
                        state["showtime"],
                        state["tickets"],
                        ", ".join(state["seats"]),
                        total,
                        currency,
                        datetime.now(timezone.utc).isoformat(),
                    ),
                )

            symbol = "$" if currency == "USD" else "₹"
            booking_sessions.pop(session_key, None)
            return (
                "Demo booking saved successfully!\n"
                f"Demo reference: {booking_ref}\n"
                f"Movie: {movie['title']} | City: {state['city']}\n"
                f"Total: {symbol}{total}\n"
                "This is only a local demo record, not a real ticket. "
                "No payment was taken and seat availability was not verified."
            )

        if lowered in {"no", "n", "cancel", "cancel booking"}:
            booking_sessions.pop(session_key, None)
            return "Demo booking cancelled. No booking record was created."

        return "Please reply YES to save the demo booking or NO to cancel."

    booking_sessions.pop(session_key, None)
    return "Let's start again. Which city would you like to book in?"


@app.post("/api/chat")
def chat(data: ChatMessage, request: Request):
    text = data.message.strip()
    lowered = text.lower()

    if not text:
        return {"reply": "Please type a question."}

    # Local demo conversation key. Do not use this approach for production.
    session_key = request.client.host if request.client else "local-demo"

    # Continue an active booking unless the user clearly asks a separate
    # technical question or explicitly cancels the booking.
    active_booking = session_key in booking_sessions
    booking_terms = [
        "book", "booking", "ticket", "tickets", "movie ticket",
        "reserve", "reserve seats",
    ]
    technical = find_knowledge(text)

    if active_booking and not technical:
        return {"reply": booking_reply(session_key, text), "demo": True}

    if any(term in lowered for term in booking_terms):
        booking_sessions[session_key] = start_booking()
        return {
            "reply": (
                "Let's make a demo booking! Which city would you like? "
                "Choose Delhi, Chennai, Bengaluru, New York, Los Angeles, "
                "Chicago or San Francisco. These are sample listings only."
            ),
            "demo": True,
        }

    if technical:
        return {"reply": technical}

    if any(word in lowered for word in ["hello", "hi", "hey", "namaste"]):
        reply = (
            "Hello! I'm Qube AI. Ask me about Qube Cinema terminology "
            "or type 'book tickets' to try the demo booking flow."
        )
    elif any(word in lowered for word in [
        "contact", "enquiry", "inquiry", "callback"
    ]):
        reply = (
            "You can submit a business enquiry through the Contact section. "
            "This demo saves the request locally; it does not contact Qube Cinema."
        )
    elif any(word in lowered for word in [
        "product", "products", "technology", "technologies"
    ]):
        reply = (
            "You can ask about Qube Wire, Qube XP, QubeMaster, Justickets, "
            "Moviebuff, iCount, Slydes or EPIQ. I can explain each in simple terms."
        )
    elif any(word in lowered for word in [
        "service", "services", "distribution", "content"
    ]):
        reply = (
            "Qube Cinema provides digital cinema technology and services. "
            "For example, Qube Wire supports theatrical content distribution. "
            "Ask about a specific product for a simple explanation."
        )
    elif any(word in lowered for word in [
        "about", "company", "qube cinema"
    ]):
        reply = (
            "Qube Cinema provides end-to-end digital cinema technology and "
            "solutions for the cinema ecosystem. This website is an independent "
            "demo, not the official Qube Cinema website."
        )
    elif "movie" in lowered or "showtime" in lowered or "city" in lowered:
        reply = (
            "I can show sample movies for Delhi, Chennai, Bengaluru and selected "
            "US cities. Type 'book tickets' to begin a demo booking."
        )
    else:
        reply = (
            "I can explain Qube Cinema products and digital cinema terms, "
            "or help you try a demo booking. Try asking 'What is DCP?' "
            "or type 'book tickets'."
        )

    return {"reply": reply}


@app.post("/api/enquiries")
def create_enquiry(data: UserRequest):
    return save_request("business_enquiry", data)


@app.post("/api/support")
def create_support_request(data: UserRequest):
    return save_request("support", data)


@app.post("/api/admin/login")
def admin_login(data: dict):
    username = data.get("username", "")
    password = data.get("password", "")

    if username != ADMIN_USERNAME or password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    token = jwt.encode(
        {
            "sub": username,
            "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        },
        JWT_SECRET,
        algorithm="HS256",
    )

    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/admin/enquiries")
def get_enquiries(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=["HS256"],
        )
        if payload.get("sub") != ADMIN_USERNAME:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            """
            SELECT id, request_type, name, email, message, created_at
            FROM requests
            ORDER BY id DESC
            """
        ).fetchall()

    return {"enquiries": [dict(row) for row in rows]}


@app.get("/api/admin/bookings")
def get_demo_bookings(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=["HS256"],
        )
        if payload.get("sub") != ADMIN_USERNAME:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            """
            SELECT id, booking_ref, city, movie, theatre, showtime,
                   tickets, seats, total, currency, created_at
            FROM demo_bookings
            ORDER BY id DESC
            """
        ).fetchall()

    return {"demo_bookings": [dict(row) for row in rows]}
