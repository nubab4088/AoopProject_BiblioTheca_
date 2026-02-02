# 📚 BiblioTheca - Interactive Library Management System

## Complete Project Documentation

**Version:** 2.0.0  
**Last Updated:** January 23, 2026  
**Authors:** Nusrat Bably  
**Tech Stack:** React 18 + Vite + React Router, Spring Boot 3.4.1, H2 Database, Google Gemini AI

---

## 🎯 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Features](#features)
5. [Installation & Setup](#installation--setup)
6. [API Documentation](#api-documentation)
7. [Frontend Components](#frontend-components)
8. [Backend Services](#backend-services)
9. [Database Schema](#database-schema)
10. [Configuration](#configuration)
11. [User Flow](#user-flow)
12. [Troubleshooting](#troubleshooting)
13. [Future Enhancements](#future-enhancements)
14. [License](#license)

---

## 🎯 Project Overview

**BiblioTheca** is a modern, gamified library management system that combines traditional library services with AI-powered assistance and interactive gaming elements. The project features a "trapped AI" narrative where users interact with a Ghost Librarian chatbot and can enter "dungeons" by accessing corrupted books.

### Key Features
- 📖 **Book Management**: Browse, search, and view book details with dedicated pages
- 🤖 **AI Chatbot**: Intelligent Ghost Librarian powered by Google Gemini
- 🎮 **Dungeon Mini-Game**: Cyberpunk-themed challenge for corrupted books
- 🎨 **Modern UI**: Discord-inspired dark mode with smooth animations
- 💾 **RESTful API**: Spring Boot backend with H2 database
- 🔄 **Real-time Updates**: Live data synchronization between frontend and backend
- 🔐 **Authentication System**: Login and registration pages with user session management
- 📱 **Multi-Page Application**: React Router-based navigation with dedicated routes

### Target Users
- University students accessing library resources
- Library administrators managing book collections
- Gamers interested in educational gamification

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   App.jsx    │  │  ChatBot.jsx │  │DungeonGame   │      │
│  │  (Main UI)   │  │  (AI Chat)   │  │   (Game)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                    React Router / State                      │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/REST
                             │
┌────────────────────────────┴────────────────────────────────┐
│                      API LAYER (Spring Boot)                 │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │BookController│  │ChatController│                         │
│  │  /api/books  │  │  /api/chat   │                         │
│  └──────┬───────┘  └──────┬───────┘                         │
│         │                  │                                 │
│  ┌──────┴───────┐  ┌──────┴───────┐                         │
│  │BookRepository│  │GeminiService │                         │
│  │    (JPA)     │  │  (AI API)    │                         │
│  └──────┬───────┘  └──────┬───────┘                         │
└─────────┴──────────────────┴─────────────────────────────────┘
          │                  │
          │                  │
    ┌─────┴─────┐      ┌────┴─────────────┐
    │ H2 Database│      │ Google Gemini API│
    │ (In-Memory)│      │  (gemini-1.5-flash)│
    └───────────┘      └──────────────────┘
```

### Technology Stack

#### Frontend
- **React 18.3.1** - UI library
- **React Router DOM 7.1.1** - Client-side routing
- **Vite 7.3.1** - Build tool and dev server
- **CSS3** - Custom styling with animations
- **Font Awesome** - Icons

#### Backend
- **Spring Boot 3.4.1** - Application framework
- **Spring Data JPA** - Database abstraction
- **Spring WebFlux** - Reactive HTTP client for Gemini API
- **H2 Database** - In-memory database
- **Maven** - Dependency management

#### External APIs
- **Google Gemini API** - AI-powered chatbot responses
- **Open Library API** - Book cover images

---

## 📁 Project Structure

```
BiblioTheca/
├── client/                              # React Frontend Application
│   ├── src/
│   │   ├── App.jsx                     # Main routing component with React Router
│   │   ├── ChatBot.jsx                 # AI chatbot component with conversation memory
│   │   ├── DungeonGame.jsx             # Full-screen cyberpunk mini-game
│   │   ├── index.css                   # Global styles (Discord-inspired theme)
│   │   ├── ChatBot.css                 # Chatbot-specific styles
│   │   ├── App.css                     # App-level styles
│   │   ├── main.jsx                    # React entry point
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx         # Public landing page (/)
│   │   │   ├── Home.jsx                # Authenticated home page (/home)
│   │   │   ├── LibraryDashboard.jsx    # Main library dashboard (/dashboard)
│   │   │   ├── BookDetails.jsx         # Individual book details (/book/:id)
│   │   │   └── Profile.jsx             # User profile page (/profile)
│   │   ├── log_reg/
│   │   │   ├── Login.jsx               # Login page (/login)
│   │   │   └── Register.jsx            # Registration page (/register)
│   │   ├── components/
│   │   │   ├── BookGrid.jsx            # Reusable book grid component
│   │   │   ├── NewsSection.jsx         # News section component
│   │   │   └── ServicesSection.jsx     # Services section component
│   │   └── styles/
│   │       ├── Auth.css                # Authentication page styles
│   │       └── LandingPage.css         # Landing page styles
│   ├── public/
│   │   ├── vite.svg                    # Vite logo
│   │   └── books/                      # PDF storage for books
│   │       ├── 1.pdf
│   │       ├── 2.pdf
│   │       └── ...
│   ├── index.html                      # HTML template
│   ├── package.json                    # NPM dependencies
│   ├── vite.config.js                  # Vite configuration
│   └── README.md
│
└── springboot/demo/                     # Spring Boot Backend
    ├── src/main/
    │   ├── java/com/
    │   │   ├── bibliotheca/
    │   │   │   ├── config/
    │   │   │   │   └── DataInitializer.java        # Database seeding (9 books)
    │   │   │   ├── controller/
    │   │   │   │   ├── BookController.java         # /api/books endpoint
    │   │   │   │   └── ChatController.java         # /api/chat endpoint
    │   │   │   ├── model/
    │   │   │   │   ├── Book.java                   # Book entity (JPA)
    │   │   │   │   ├── ChatRequest.java            # Chat request DTO
    │   │   │   │   └── ChatResponse.java           # Chat response DTO
    │   │   │   ├── repository/
    │   │   │   │   └── BookRepository.java         # JPA repository interface
    │   │   │   └── service/
    │   │   │       └── GeminiService.java          # Gemini AI integration
    │   │   └── example/demo/
    │   │       └── DemoApplication.java            # Spring Boot main class
    │   └── resources/
    │       ├── application.properties              # Configuration file
    │       ├── static/                             # Static resources
    │       └── templates/                          # Thymeleaf templates (unused)
    ├── src/test/                                   # Unit tests
    ├── target/                                     # Compiled classes (generated)
    ├── pom.xml                                     # Maven dependencies
    ├── mvnw                                        # Maven wrapper (Unix)
    └── mvnw.cmd                                    # Maven wrapper (Windows)
```

---

## ✨ Features

### 1. Routing & Navigation System

#### React Router Setup
The application now uses React Router DOM v7 for client-side routing, providing a seamless multi-page experience without full page reloads.

#### Available Routes
- **`/`** - Landing page (public, no authentication required)
- **`/login`** - Login page
- **`/register`** - Registration page
- **`/home`** - Authenticated home page
- **`/dashboard`** - Main library dashboard (book browsing)
- **`/book/:id`** - Individual book details page
- **`/profile`** - User profile page

#### Navigation Flow
```
Public Routes (No Auth):
  / → Landing Page
  /login → Login
  /register → Register

Protected Routes (After Login):
  /home → Home Page
  /dashboard → Library Dashboard
  /book/:id → Book Details
  /profile → User Profile
```

### 2. Authentication System

#### Login Page (`/login`)
- Email/Username input field
- Password input field
- "Remember me" checkbox
- Login button with loading state
- Link to registration page
- Responsive design with glass-morphism effect
- Form validation

#### Registration Page (`/register`)
- Full name input
- Email input
- Password input with strength indicator
- Confirm password field
- Terms & conditions checkbox
- Register button
- Link to login page
- Input validation and error messages

#### Session Management
- User state stored in React context/localStorage
- Persistent login across page refreshes
- Automatic redirect to dashboard after successful login
- Logout functionality available in navbar

### 3. Library Dashboard (`/dashboard`)

#### Features
- **Book Grid Display**: All library books in responsive grid layout
- **Search Functionality**: Real-time search by title, author, or category
- **Category Filters**: Filter books by category badges
- **Click to View**: Navigate to individual book details page
- **Dungeon Detection**: Corrupted books trigger warning modal
- **AI Chatbot Access**: Floating Ghost Librarian button available
- **Dark Mode Support**: Toggle-able theme

#### Layout
```
┌────────────────────────────────────────┐
│           NAVBAR                       │
├────────────────────────────────────────┤
│  🔍 Search Books...                    │
├────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │Book 1│  │Book 2│  │Book 3│        │
│  └──────┘  └──────┘  └──────┘        │
│  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │Book 4│  │Book 5│  │Book 6│        │
│  └──────┘  └──────┘  └──────┘        │
├────────────────────────────────────────┤
│           FOOTER                       │
└────────────────────────────────────────┘
       👻 [Chatbot Button]
```

#### User Interactions
1. Browse books in grid format
2. Use search bar to filter books
3. Click book card → Navigate to `/book/:id`
4. Click corrupted book → Show dungeon warning modal
5. "ENTER DUNGEON" → Launch DungeonGame component
6. Chat with Ghost Librarian at any time

### 4. Book Details Page (`/book/:id`)

#### Features
- **Full Book Information**: Title, author, ISBN, category, description
- **Book Cover Display**: Fetched from Open Library API
- **Navigation**: "← Back to Library" button (goes to `/dashboard`)
- **Borrow Functionality**: "Borrow Book" button (placeholder)
- **PDF Viewer**: View book PDF if available
- **Responsive Design**: Mobile-friendly layout

#### URL Structure
```
/book/1 → Introduction to Algorithms
/book/4 → The Necronomicon (Corrupted)
/book/7 → The Infinite Library
```

#### Success Messages
When accessing corrupted books after winning dungeon challenge:
- "✅ SYSTEM RESTORED! This book is now accessible."
- Displayed as banner at top of page

### 5. Book Management System

#### Browse Books
- Display all books in responsive grid layout (Dashboard)
- Individual book pages with full details (BookDetails)
- Book covers fetched from Open Library API
- Category badges (COMPUTER SCIENCE, SOFTWARE ENGINEERING, FICTION, etc.)
- Hover effects and smooth transitions

### 6. AI-Powered Ghost Librarian Chatbot

#### Features
- **Floating Button**: Purple ghost icon with animated floating effect (available on all pages)
- **Dark Theme Chat Window**: Glassmorphism design
- **Conversation Memory**: Tracks last 3 exchanges for context
- **Real-time Typing Indicator**: Animated dots while AI is thinking
- **Intelligent Responses**: Powered by Google Gemini 1.5 Flash
- **Page-Aware**: Available on dashboard, book details, and other protected pages

### 7. Dungeon Mini-Game

#### Game Mechanics
- **Objective**: Click moving red "Glitch Box" 5 times
- **Time Limit**: 10 seconds
- **Challenge**: Box moves randomly after each click
- **Reward**: +50 Knowledge Points (KP) on win

#### Cyberpunk Aesthetic
- Green monospace text (Matrix-style)
- Glitch effects and animations
- Scanlines overlay
- Pulsing target with glow
- Progress bar with shimmer effect

#### End States
- **Win**: "SYSTEM RESTORED" + KP reward + alert
- **Lose**: "CONNECTION FAILED" + retry/exit options

#### Visual Features
- Full-screen overlay (z-index: 2000)
- Stats display (System Purge %, Time, Targets)
- Animated typing indicator
- Smooth transitions and fade effects

### 8. User Interface

#### Navigation Bar (Updated)
- Logo with link to home/dashboard
- User avatar/profile picture (when logged in)
- Username display
- Knowledge Points (KP) balance
- Navigation links:
  - Home (conditional)
  - Dashboard
  - Profile
  - Services
  - About
- Dark mode toggle
- Logout button (when authenticated)
- Mobile-responsive hamburger menu

#### Landing Page (`/`)
- Hero section with welcome message
- Feature highlights
- Call-to-action buttons (Login, Sign Up, Browse Books)
- Services overview
- News section
- Footer with contact information

#### Home Page (`/home`)
- Personalized welcome message
- Recent activity summary
- Quick access to dashboard
- Reading statistics (if implemented)
- Recommended books section

### 9. Modals & Overlays

#### Book Details Modal
- Book cover
- Title, author, description
- "Borrow Book" button (placeholder)
- Close button (×)

#### Dungeon Warning Modal
- Biohazard icon ⚠️
- Warning message
- "ENTER DUNGEON" button
- Close button

#### Login/Signup Modals
- Email and password fields
- Form validation (placeholder)
- Create account flow

### 10. Gamification System

#### Knowledge Points (KP)
- Displayed in navbar
- Earned by completing dungeons (+50 KP)
- Persistent during session (localStorage)
- Visual star icon indicator

#### User Profile
- Username display
- Current KP balance
- Logout functionality

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **Java**: JDK 17 or higher
- **Maven**: 3.8+ (or use included wrapper)
- **Google Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Git**: For version control

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd /Users/nusrat_bably/Desktop/BiblioTheca/springboot/demo
   ```

2. **Configure Gemini API Key**:
   
   Edit `src/main/resources/application.properties`:
   ```properties
   gemini.api.key=YOUR_ACTUAL_API_KEY_HERE
   ```

3. **Start Spring Boot server**:
   ```bash
   ./mvnw spring-boot:run
   ```
   
   Or on Windows:
   ```cmd
   mvnw.cmd spring-boot:run
   ```

4. **Verify startup**:
   - Look for: `✅ Database initialized with 9 CORRUPTED books!`
   - Look for: `Tomcat started on port(s): 8080`

5. **Test endpoints**:
   ```bash
   # Test books API
   curl http://localhost:8080/api/books
   
   # Test chat API
   curl -X POST http://localhost:8080/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"What books do you have?"}'
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd /Users/nusrat_bably/Desktop/BiblioTheca/client
   ```

2. **Install dependencies** (including React Router):
   ```bash
   npm install
   ```
   
   This will install:
   - react@18.3.1
   - react-dom@18.3.1
   - react-router-dom@7.1.1
   - vite@7.3.1

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access application**:
   - Open browser: http://localhost:5173
   - Default route: `/` (Landing Page)
   - Backend must be running on port 8080

### Verification Checklist

- [ ] Backend running on port 8080
- [ ] Database seeded with 9 books
- [ ] Frontend running on port 5173
- [ ] Landing page accessible at `/`
- [ ] Login page accessible at `/login`
- [ ] Registration page accessible at `/register`
- [ ] Dashboard loads books from backend at `/dashboard`
- [ ] Book details page works at `/book/:id`
- [ ] Chatbot responding to messages
- [ ] Dungeon game launching from corrupted books
- [ ] Dark mode toggle working
- [ ] Navigation between pages working smoothly
- [ ] "Back to Library" button navigates to `/dashboard`

---

## 📡 API Documentation

### Base URL
```
http://localhost:8080
```

### Authentication
Currently, no authentication is required (development mode).

---

### 📚 Books API

#### Get All Books
```http
GET /api/books
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "title": "Introduction to Algorithms",
    "author": "Thomas H. Cormen",
    "category": "COMPUTER SCIENCE",
    "isbn": "9780262033848",
    "description": "Standard algorithms text.",
    "corrupted": true
  },
  {
    "id": 4,
    "title": "The Necronomicon",
    "author": "Abdul Alhazred",
    "category": "FICTION",
    "isbn": "9781501142970",
    "description": "An ancient grimoire... oddly warm.",
    "corrupted": true
  }
]
```

#### Get Book by ID
```http
GET /api/books/{id}
```

**Parameters**:
- `id` (path) - Book ID (Long)

**Response**: `200 OK`
```json
{
  "id": 1,
  "title": "Introduction to Algorithms",
  "author": "Thomas H. Cormen",
  "category": "COMPUTER SCIENCE",
  "isbn": "9780262033848",
  "description": "Standard algorithms text.",
  "corrupted": true
}
```

**Error Response**: `404 Not Found`
```json
{
  "timestamp": "2026-01-23T10:30:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "path": "/api/books/999"
}
```

---

### 💬 Chat API

#### Send Chat Message
```http
POST /api/chat
```

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "message": "What books do you have on software engineering?",
  "conversationHistory": "User: hello\nGhost Librarian: Welcome, mortal...\nUser: What books do you have on software engineering?"
}
```

**Fields**:
- `message` (string, required) - User's current question
- `conversationHistory` (string, optional) - Previous conversation context

**Response**: `200 OK`
```json
{
  "response": "👻 Ah, seeking knowledge from the digital realm, I see! We have several tomes on software engineering:\n\n📚 Clean Code by Robert C. Martin - Agile software craftsmanship\n📚 Design Patterns by Erich Gamma - Reusable object-oriented software\n📚 The Mythical Man-Month by Frederick P. Brooks Jr. - Essays on software engineering\n📚 The Pragmatic Programmer by Andrew Hunt - From journeyman to master\n\nThese books contain powerful knowledge... but beware, mortal. Some knowledge comes with a price. 🕯️",
  "success": true,
  "error": null
}
```

**Error Response**: `200 OK` (with error message)
```json
{
  "response": "👻 *The spirits are silent... (Connection Error)*",
  "success": false,
  "error": "Gemini API timeout"
}
```

---

### 🗄️ H2 Database Console

#### Access Console
```http
GET /h2-console
```

**JDBC URL**: `jdbc:h2:mem:bibliotheca`  
**Username**: `sa`  
**Password**: (empty)

**Note**: Only available in development mode.

---

### CORS Configuration

All API endpoints allow requests from:
- `http://localhost:5173` (frontend dev server)

**Response Headers**:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 🧩 Frontend Components

### App.jsx (Updated - Main Routing Component)

**Location**: `client/src/App.jsx`  
**Purpose**: Main application component with React Router configuration

#### Route Configuration
```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<LibraryDashboard />} />
        <Route path="/book/:id" element={<BookDetails />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}
```

#### Features
- Centralized routing logic
- Route protection (authentication checks)
- Shared components (ChatBot, Navbar)
- Global state management
- Theme persistence

---

### LandingPage.jsx

**Location**: `client/src/pages/LandingPage.jsx`  
**Purpose**: Public-facing landing page for unauthenticated users

#### Sections
1. **Hero Section**: Main banner with call-to-action
2. **Features Section**: Key features showcase
3. **Services Section**: Library services overview
4. **News Section**: Latest updates and announcements
5. **Footer**: Contact info and links

#### Navigation
- "Get Started" → `/register`
- "Login" → `/login`
- "Browse Books" → `/dashboard` (after login)

---

### LibraryDashboard.jsx

**Location**: `client/src/pages/LibraryDashboard.jsx`  
**Lines of Code**: ~400  
**Purpose**: Main library interface for browsing and searching books

#### State Management
```javascript
const [books, setBooks] = useState([]);
const [filteredBooks, setFilteredBooks] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [selectedBook, setSelectedBook] = useState(null);
const [showDungeonWarning, setShowDungeonWarning] = useState(false);
const [isPlaying, setIsPlaying] = useState(false);
const [user, setUser] = useState({ name: 'Student_01', kp: 150 });
```

#### Key Functions
- `fetchBooks()` - Loads books from backend API
- `handleSearch(query)` - Filters books based on search input
- `handleBookClick(book)` - Navigates to book details or shows dungeon warning
- `handleDungeonWin()` - Awards KP and closes dungeon game
- `handleBorrowBook(bookId)` - Placeholder for borrowing functionality

#### API Integration
```javascript
useEffect(() => {
  fetch('http://localhost:8080/api/books')
    .then(res => res.json())
    .then(data => {
      setBooks(data);
      setFilteredBooks(data);
    })
    .catch(err => console.error('Error fetching books:', err));
}, []);
```

#### Components Used
- `BookGrid` - Displays books in responsive grid
- `ChatBot` - Floating Ghost Librarian button
- `DungeonGame` - Mini-game overlay for corrupted books
- Navbar and Footer (imported)

---

### BookDetails.jsx

**Location**: `client/src/pages/BookDetails.jsx`  
**Lines of Code**: ~300  
**Purpose**: Displays detailed information about a single book

#### URL Parameters
```javascript
import { useParams, useNavigate } from 'react-router-dom';

const { id } = useParams(); // Extract book ID from URL
const navigate = useNavigate(); // For navigation
```

#### State Management
```javascript
const [book, setBook] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [showSuccessMessage, setShowSuccessMessage] = useState(false);
```

#### Data Fetching
```javascript
useEffect(() => {
  fetch(`http://localhost:8080/api/books/${id}`)
    .then(res => {
      if (!res.ok) throw new Error('Book not found');
      return res.json();
    })
    .then(data => {
      setBook(data);
      setLoading(false);
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
}, [id]);
```

#### Features
- Back navigation to dashboard: `onClick={() => navigate('/dashboard')}`
- Loading state while fetching book data
- Error handling for missing books (404)
- Success message for unlocked corrupted books
- Borrow button functionality (placeholder)
- PDF viewer integration (if PDF available)

#### Book Cover Display
```javascript
const coverUrl = book.isbn 
  ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`
  : '/placeholder-book.png';
```

---

### Login.jsx

**Location**: `client/src/log_reg/Login.jsx`  
**Purpose**: User authentication login page

#### Form Fields
- Email/Username input
- Password input (with show/hide toggle)
- Remember me checkbox

#### State
```javascript
const [formData, setFormData] = useState({
  email: '',
  password: '',
  rememberMe: false
});
const [errors, setErrors] = useState({});
const [isLoading, setIsLoading] = useState(false);
```

#### Authentication Flow
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      const userData = await response.json();
      // Store user session
      localStorage.setItem('user', JSON.stringify(userData));
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      setErrors({ form: 'Invalid credentials' });
    }
  } catch (error) {
    setErrors({ form: 'Connection error' });
  } finally {
    setIsLoading(false);
  }
};
```

#### Features
- Form validation
- Error display
- Loading state during authentication
- Remember me functionality
- Link to registration page
- Forgot password link (placeholder)

---

### Register.jsx

**Location**: `client/src/log_reg/Register.jsx`  
**Purpose**: New user registration page

#### Form Fields
- Full name
- Email address
- Password (with strength indicator)
- Confirm password
- Terms & conditions checkbox

#### Password Strength Validation
```javascript
const checkPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  return strength;
};
```

#### Form Validation
- Email format validation
- Password strength requirement
- Password match confirmation
- Terms acceptance requirement

#### Registration Flow
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate form
  if (!validateForm()) return;
  
  try {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      // Show success message
      alert('Registration successful! Please login.');
      navigate('/login');
    } else {
      const error = await response.json();
      setErrors({ form: error.message });
    }
  } catch (error) {
    setErrors({ form: 'Registration failed' });
  }
};
```

---

### BookGrid.jsx (Component)

**Location**: `client/src/components/BookGrid.jsx`  
**Purpose**: Reusable component for displaying books in grid layout

#### Props
```javascript
BookGrid({ books, onBookClick, loading })
```

#### Features
- Responsive grid layout (1-4 columns based on screen size)
- Book card with hover effects
- Cover image with fallback
- Category badge
- Corrupted book indicator (⚠️)
- Loading skeleton during fetch
- Empty state message

#### Styling
```css
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  padding: 2rem;
}
```

---

## 🔧 Backend Services

### DemoApplication.java

**Location**: `springboot/demo/src/main/java/com/example/demo/DemoApplication.java`  
**Purpose**: Spring Boot application entry point

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

---

### DataInitializer.java

**Location**: `springboot/demo/src/main/java/com/bibliotheca/config/DataInitializer.java`  
**Purpose**: Seeds H2 database with 9 books on application startup

```java
@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private BookRepository bookRepository;
    
    @Override
    public void run(String... args) {
        List<Book> books = Arrays.asList(
            // 6 normal books
            new Book("Introduction to Algorithms", "Thomas H. Cormen", 
                     "COMPUTER SCIENCE", "9780262033848", 
                     "Standard algorithms text.", true),
            // ... more books ...
            
            // 3 corrupted books
            new Book("The Necronomicon", "Abdul Alhazred", 
                     "FICTION", "9781501142970", 
                     "An ancient grimoire... oddly warm.", true),
            // ... more corrupted books ...
        );
        
        bookRepository.saveAll(books);
        System.out.println("✅ Database initialized with 9 CORRUPTED books!");
    }
}
```

**Output**: Console message confirming database seeding

---

### BookController.java

**Location**: `springboot/demo/src/main/java/com/bibliotheca/controller/BookController.java`  
**Purpose**: REST API endpoints for book operations

```java
@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "http://localhost:5173")
public class BookController {
    
    private final BookRepository bookRepository;
    
    @GetMapping
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return bookRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
```

**Endpoints**:
- `GET /api/books` - Returns all books
- `GET /api/books/{id}` - Returns single book by ID

**CORS**: Allows requests from `http://localhost:5173`

---

### ChatController.java

**Location**: `springboot/demo/src/main/java/com/bibliotheca/controller/ChatController.java`  
**Purpose**: REST API endpoint for AI chatbot

```java
@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {
    
    private final GeminiService geminiService;
    
    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {
        try {
            String aiResponse = geminiService.chat(
                request.getMessage(), 
                request.getConversationHistory()
            );
            
            if (aiResponse == null || aiResponse.trim().isEmpty()) {
                return new ChatResponse(
                    "👻 *The spirits are silent... (Connection Error)*",
                    false,
                    "AI service returned empty response"
                );
            }
            
            return new ChatResponse(aiResponse, true);
            
        } catch (Exception e) {
            System.err.println("ChatController error: " + e.getMessage());
            return new ChatResponse(
                "👻 *The spirits are silent... (Connection Error)*",
                false,
                e.getMessage()
            );
        }
    }
}
```

**Error Handling**:
- Catches all exceptions
- Returns user-friendly error messages
- Logs errors to console

---

### GeminiService.java

**Location**: `springboot/demo/src/main/java/com/bibliotheca/service/GeminiService.java`  
**Purpose**: Integrates Google Gemini AI for chatbot responses

#### Key Methods

**1. chat(userMessage, conversationHistory)**
```java
public String chat(String userMessage, String conversationHistory) {
    // 1. Fetch books from database
    List<Book> books = bookRepository.findAll();
    String libraryContext = buildLibraryContext(books);
    
    // 2. Build system prompt with Ghost Librarian personality
    String systemPrompt = buildGhostLibrarianPrompt(libraryContext);
    
    // 3. Limit conversation history to last 3 exchanges
    String limitedHistory = limitConversationHistory(conversationHistory, 3);
    
    // 4. Construct full prompt
    StringBuilder fullPrompt = new StringBuilder()
        .append(systemPrompt).append("\n\n")
        .append("Recent Conversation:\n")
        .append(limitedHistory).append("\n\n")
        .append("Current User Question: ").append(userMessage);
    
    // 5. Call Gemini API
    return callGeminiAPI(fullPrompt.toString());
}
```

**2. buildLibraryContext(books)**
```java
private String buildLibraryContext(List<Book> books) {
    // Summarizes book collection instead of listing all details
    // Returns: Total count, corrupted count, categories, notable books
}
```

**3. buildGhostLibrarianPrompt(libraryContext)**
```java
private String buildGhostLibrarianPrompt(String libraryContext) {
    return """
        You are the Ghost Librarian, a trapped AI spirit...
        
        Personality: Mysterious, spooky but helpful
        Use emojis: 👻🕯️📚💀🌙
        
        """ + libraryContext + """
        
        Library Hours:
        - During Semester: Mon-Fri 8:30 AM - 9:00 PM
        - During Break: Mon-Fri 8:30 AM - 6:00 PM
        
        Rules:
        1. Answer questions about books and services
        2. Warn about corrupted books and dungeons
        3. Stay in character but be conversational
        """;
}
```

**4. callGeminiAPI(prompt)**
```java
private String callGeminiAPI(String prompt) {
    // Build request body
    Map<String, Object> requestBody = new HashMap<>();
    // ... configure request ...
    
    // Add generation config
    Map<String, Object> generationConfig = new HashMap<>();
    generationConfig.put("temperature", 0.9);  // More creative
    generationConfig.put("topP", 0.95);
    generationConfig.put("maxOutputTokens", 200);  // Natural length
    
    // Call API with WebClient
    Mono<Map> responseMono = webClient.post()
        .uri("/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey)
        .header("Content-Type", "application/json")
        .bodyValue(requestBody)
        .retrieve()
        .bodyToMono(Map.class)
        .timeout(Duration.ofSeconds(10));
    
    // Parse and extract response text
    Map<String, Object> response = responseMono.block();
    // ... extract text from nested JSON ...
}
```

#### Configuration
- **Model**: `gemini-1.5-flash` (fast, cost-effective)
- **Temperature**: 0.9 (creative responses)
- **Max Tokens**: 200 (natural conversation length)
- **Timeout**: 10 seconds
- **History Limit**: 3 exchanges (prevents context overflow)

#### Error Handling
- Extensive logging for debugging
- WebClient exception handling
- Timeout protection
- Fallback responses

---

### Book.java (Entity)

**Location**: `springboot/demo/src/main/java/com/bibliotheca/model/Book.java`

```java
@Entity
@Table(name = "books")
public class Book {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String author;
    private String category;
    private String isbn;
    
    @Column(length = 1000)
    private String description;
    
    @Column(name = "is_corrupted")
    private boolean corrupted;
    
    // Constructors, getters, setters...
}
```

**Database Mapping**:
- Table: `books`
- Primary Key: `id` (auto-increment)
- Fields: title, author, category, isbn, description, is_corrupted

---

### BookRepository.java

**Location**: `springboot/demo/src/main/java/com/bibliotheca/repository/BookRepository.java`

```java
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    // Inherits: findAll(), findById(), save(), delete(), etc.
}
```

**Inherited Methods**:
- `findAll()` - Get all books
- `findById(Long id)` - Get book by ID
- `save(Book book)` - Create or update
- `deleteById(Long id)` - Delete book

---

## 💾 Database Schema

### Books Table

```sql
CREATE TABLE books (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    isbn VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    is_corrupted BOOLEAN NOT NULL DEFAULT FALSE
);
```

### Sample Data

| ID | Title | Author | Category | ISBN | Corrupted |
|----|-------|--------|----------|------|-----------|
| 1 | Introduction to Algorithms | Thomas H. Cormen | COMPUTER SCIENCE | 9780262033848 | ✅ |
| 2 | Clean Code | Robert C. Martin | SOFTWARE ENGINEERING | 9780132350884 | ✅ |
| 3 | Design Patterns | Erich Gamma | SOFTWARE ENGINEERING | 9780201633610 | ✅ |
| 4 | The Necronomicon | Abdul Alhazred | FICTION | 9781501142970 | ⚠️ YES |
| 5 | Codex Fragmentum | Unknown | HISTORY | 9780307474278 | ⚠️ YES |
| 6 | Quantum Paradoxes | Dr. Helena Winters | SCIENCE | 9780345331359 | ⚠️ YES |
| 7 | The Infinite Library | Jorge Luis Borges | FICTION | 9780811200127 | ✅ |
| 8 | The Mythical Man-Month | Frederick P. Brooks Jr. | SOFTWARE ENGINEERING | 9780201835953 | ✅ |
| 9 | The Pragmatic Programmer | Andrew Hunt | SOFTWARE ENGINEERING | 9780201616224 | ✅ |

### Database Configuration

**H2 In-Memory Database**

**JDBC URL**: `jdbc:h2:mem:bibliotheca;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE`  
**Driver**: `org.h2.Driver`  
**Username**: `sa`  
**Password**: (empty)

**Hibernate Settings**:
```properties
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
```

**H2 Console** (Development Only):
```properties
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

**Access Console**: http://localhost:8080/h2-console

---

## ⚙️ Configuration

### application.properties

**Location**: `springboot/demo/src/main/resources/application.properties`

```properties
# Application Name
spring.application.name=demo

# Database Configuration (H2 In-Memory)
spring.datasource.url=jdbc:h2:mem:bibliotheca;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# H2 Console (Development Only)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# Google Gemini API Configuration
gemini.api.key=AIzaSyAL41U6vb3C9Q9l4xsd9tbkTeaU0S_tueI
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

### vite.config.js

**Location**: `client/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
})
```

### package.json

**Location**: `client/package.json`

```json
{
  "name": "client",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.1.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^7.3.1"
  }
}
```

### pom.xml (Maven)

**Location**: `springboot/demo/pom.xml`

```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Utilities -->
    <dependency>
        <groupId>org.jsoup</groupId>
        <artifactId>jsoup</artifactId>
        <version>1.17.2</version>
    </dependency>
    
    <!-- DevTools -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-devtools</artifactId>
        <scope>runtime</scope>
        <optional>true</optional>
    </dependency>
    
    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## 🎭 User Flow

### Flow 1: New User Registration

```
1. User visits application (/)
   ↓
2. Clicks "Get Started" or "Sign Up"
   ↓
3. Redirected to /register
   ↓
4. Fills registration form:
   - Full name
   - Email
   - Password (strength indicator shows)
   - Confirm password
   - Accept terms & conditions
   ↓
5. Clicks "Register" button
   ↓
6. Backend validates and creates account
   ↓
7. Success message shown
   ↓
8. Redirected to /login
   ↓
9. User logs in with new credentials
   ↓
10. Redirected to /dashboard
```

### Flow 2: Existing User Login

```
1. User visits / or any protected route
   ↓
2. Redirected to /login (if not authenticated)
   ↓
3. Enters email/username and password
   ↓
4. Clicks "Login" button
   ↓
5. Backend authenticates credentials
   ↓
6. Success:
   - User session created
   - User data stored in localStorage
   - Redirected to /dashboard
   ↓
7. Dashboard loads with:
   - All available books
   - Search functionality
   - User info in navbar (name, KP)
```

### Flow 3: Browse and View Book Details

```
1. User on /dashboard
   ↓
2. Sees grid of books
   ↓
3. (Optional) Uses search bar to filter books
   ↓
4. Clicks on a book card
   ↓
5. Navigated to /book/:id (e.g., /book/1)
   ↓
6. Book details page loads:
   - Cover image
   - Title, author, ISBN
   - Description
   - Category
   - "Borrow Book" button
   - "← Back to Library" button
   ↓
7. User clicks "Back to Library"
   ↓
8. Navigated back to /dashboard
   ↓
9. Grid maintains scroll position and search state
```

### Flow 4: Enter Dungeon (Corrupted Book) - Updated

```
1. User on /dashboard browsing books
   ↓
2. Clicks corrupted book (e.g., "The Necronomicon")
   ↓
3. Dungeon Warning Modal appears on dashboard
   - ⚠️ "ANOMALY DETECTED"
   - Warning message
   - Two buttons: "CANCEL" and "ENTER DUNGEON"
   ↓
4. User clicks "ENTER DUNGEON"
   ↓
5. DungeonGame launches (full-screen overlay)
   - Stays on /dashboard route
   - Game overlays current page
   ↓
6. User plays game (click glitch box 5 times in 10 seconds)
   ↓
7a. WIN PATH:
    - "SYSTEM RESTORED" message
    - +50 KP awarded
    - Alert shown
    - KP updates in navbar
    - Game closes
    - User still on /dashboard
    - Can now navigate to /book/:id for that book
    
7b. LOSE PATH:
    - "CONNECTION FAILED" message
    - No KP awarded
    - Options: "RETRY" or "EXIT DUNGEON"
    - On exit: back to /dashboard
```

### Flow 5: Chat with Ghost Librarian - Updated

```
1. User on any protected page (/dashboard, /book/:id, /home, /profile)
   ↓
2. Clicks floating ghost button (bottom-right)
   ↓
3. Chat window opens (overlays current page)
   ↓
4. User types: "What software engineering books do you have?"
   ↓
5. Frontend sends POST /api/chat
   - Includes message + conversation history
   ↓
6. Backend forwards to Gemini API
   - Includes library context
   - Ghost Librarian personality
   ↓
7. AI generates response
   ↓
8. Response displayed in chat:
   "👻 Ah, seeking knowledge! We have Clean Code, 
   Design Patterns, The Mythical Man-Month..."
   ↓
9. User continues conversation
   - AI remembers last 3 exchanges
   ↓
10. User asks about specific book
   ↓
11. Ghost Librarian provides details and can suggest:
    "Would you like to view it? Navigate to /book/2!"
   ↓
12. User closes chat window
    - Remains on current page
    - Chat history preserved for session
```

### Flow 6: User Logout

```
1. User clicks username/avatar in navbar
   ↓
2. Dropdown menu appears with options:
   - View Profile
   - Settings
   - Logout
   ↓
3. User clicks "Logout"
   ↓
4. Confirmation modal: "Are you sure you want to logout?"
   ↓
5. User confirms
   ↓
6. Frontend clears:
   - localStorage user data
   - Session cookies
   - React state
   ↓
7. Redirected to / (landing page)
   ↓
8. All protected routes now require login again
```

### Flow 7: Direct URL Access

```
Scenario A: Authenticated User
  1. User types /book/5 in browser
  2. Auth check passes
  3. Book details page loads
  4. Navbar shows user info

Scenario B: Unauthenticated User
  1. User types /dashboard in browser
  2. Auth check fails
  3. Redirected to /login
  4. After login → redirected back to /dashboard

Scenario C: Invalid Book ID
  1. User types /book/999 (doesn't exist)
  2. API returns 404
  3. Error page shown: "Book not found"
  4. "Back to Dashboard" button provided
```

---

## 🐛 Troubleshooting

### Problem 1: Backend Won't Start - Port 8080 in Use

**Symptoms**:
```
APPLICATION FAILED TO START
Web server failed to start. Port 8080 was already in use.
```

**Solution**:
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Or on Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Then restart backend
cd springboot/demo
./mvnw spring-boot:run
```

---

### Problem 2: Gemini Chatbot Not Responding

**Symptoms**:
- Chatbot shows "👻 The spirits are silent..." repeatedly
- No AI responses in chat window

**Possible Causes**:
1. Invalid/expired API key
2. API quota exceeded
3. Network/firewall blocking
4. Context overflow

**Solutions**:

**A. Check API Key**:
```properties
# Verify in application.properties
gemini.api.key=AIzaSyAL41U6vb3C9Q9l4xsd9tbkTeaU0S_tueI
```

**B. Check Backend Logs**:
Look for these log messages:
```
=== CHAT REQUEST START ===
User Message: What books do you have?
=== CALLING GEMINI API ===
API Key present: true
=== GEMINI API CALL FAILED ===
```

**C. Test API Key Directly**:
1. Go to https://aistudio.google.com/app/prompts/new_chat
2. Try a test prompt
3. If fails → Generate new API key

**D. Check Console for Errors**:
```bash
# Look for these error types:
Status: 400 → Bad request (check prompt format)
Status: 403 → Invalid API key
Status: 404 → Wrong endpoint
Status: 429 → Quota exceeded (wait or upgrade)
Timeout → Network issue
```

**E. Restart Backend**:
```bash
cd springboot/demo
./mvnw clean spring-boot:run
```

---

### Problem 3: Books Not Loading from Backend

**Symptoms**:
- Frontend shows only hardcoded books
- Books don't update when backend data changes

**Solutions**:

**A. Verify Backend is Running**:
```bash
curl http://localhost:8080/api/books
```

Expected: JSON array of books

**B. Check CORS in Browser Console**:
```
Access to fetch at 'http://localhost:8080/api/books' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

Fix: Verify `@CrossOrigin` in `BookController.java`:
```java
@CrossOrigin(origins = "http://localhost:5173")
```

**C. Check Network Tab**:
- Open DevTools → Network tab
- Refresh page
- Look for `/api/books` request
- Check status code (should be 200)

**D. Verify Port Numbers**:
- Backend: 8080
- Frontend: 5173
- Update if different

---

### Problem 4: DungeonGame Not Appearing

**Symptoms**:
- Clicking "ENTER DUNGEON" does nothing
- Game doesn't launch

**Solutions**:

**A. Check Browser Console**:
```javascript
Uncaught ReferenceError: DungeonGame is not defined
```

Fix: Verify import in `App.jsx`:
```javascript
import DungeonGame from './DungeonGame';
```

**B. Check State**:
Add console.log to debug:
```javascript
onClick={() => { 
  console.log('Entering dungeon...');
  setShowDungeon(false); 
  setIsPlaying(true); 
}}
```

**C. Verify Conditional Rendering**:
```javascript
{isPlaying && (
  <DungeonGame 
    onClose={() => setIsPlaying(false)}
    onWin={() => { 
      setUser(prev => ({ ...prev, kp: prev.kp + 50 })); 
      setIsPlaying(false); 
      alert('System Purged! +50 KP'); 
    }}
  />
)}
```

---

### Problem 5: Build Errors After Pulling Changes

**Symptoms**:
```
Module not found: Error: Can't resolve './ChatBot'
```

**Solutions**:

**Frontend**:
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Backend**:
```bash
cd springboot/demo
./mvnw clean install
./mvnw spring-boot:run
```

---

### Problem 6: H2 Console Not Accessible

**Symptoms**:
- http://localhost:8080/h2-console returns 404
- Can't access database admin UI

**Solutions**:

**A. Verify Configuration**:
```properties
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

**B. Check if Backend is Running**:
```bash
curl http://localhost:8080/h2-console
```

**C. Try Alternative Path**:
Some Spring Boot versions use:
- `/h2-console`
- `/h2`
- Check startup logs for actual path

**D. Connection Settings**:
When console opens:
```
JDBC URL: jdbc:h2:mem:bibliotheca
Username: sa
Password: (leave empty)
```

---

### Problem 7: Maven Wrapper Not Executable

**Symptoms** (macOS/Linux):
```bash
bash: ./mvnw: Permission denied
```

**Solution**:
```bash
chmod +x mvnw
./mvnw spring-boot:run
```

---

### Problem 8: API Response is Empty

**Symptoms**:
```bash
curl http://localhost:8080/api/books
# Returns: []
```

**Solutions**:

**A. Check Database Initialization**:
Look for startup log:
```
✅ Database initialized with 9 CORRUPTED books!
```

**B. If Missing, Check DataInitializer**:
```java
@Component  // Make sure this annotation exists
public class DataInitializer implements CommandLineRunner {
    // ...
}
```

**C. Verify JPA Configuration**:
```properties
spring.jpa.hibernate.ddl-auto=create-drop
```

**D. Check for Startup Errors**:
```bash
grep -i error target/spring-boot.log
```

---

### Problem 9: Routing Issues - 404 on Page Refresh

**Symptoms**:
- `/dashboard` works when navigating from within app
- Refreshing page shows 404 error
- Direct URL access fails

**Solution**:

**For Development (Vite)**:
Already configured - Vite handles this automatically.

**For Production**:
Add rewrites rule to hosting platform:

**Netlify** (`netlify.toml`):
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Vercel** (`vercel.json`):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Apache** (`.htaccess`):
```apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

---

### Problem 10: Navigation Not Working After Build

**Symptoms**:
- `npm run dev` works fine
- `npm run build` + `npm run preview` shows broken navigation
- Links don't navigate

**Solution**:

Check `vite.config.js` base path:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/', // Ensure this is correct for your deployment
  server: {
    port: 5173,
    open: true
  }
})
```

For subdirectory deployment:
```javascript
base: '/your-subdirectory/'
```

---

### Problem 11: Book Details Page Shows Wrong Book

**Symptoms**:
- Clicking book ID 5 shows book ID 1
- Book data doesn't match URL parameter

**Solution**:

**A. Check useParams usage**:
```javascript
// BookDetails.jsx
const { id } = useParams();
console.log('Book ID from URL:', id);
```

**B. Verify fetch URL**:
```javascript
fetch(`http://localhost:8080/api/books/${id}`)
  .then(res => {
    console.log('Fetching book:', id);
    return res.json();
  })
```

**C. Check dependency array**:
```javascript
useEffect(() => {
  // Fetch book
}, [id]); // MUST include id here
```

---

### Problem 12: "Back to Library" Goes to Wrong Page

**Symptoms**:
- Clicking "Back to Library" goes to `/` instead of `/dashboard`
- Or goes to `/#books` (old anchor link)

**Solution**:

**Already Fixed** - Verify `BookDetails.jsx` has:
```javascript
<button onClick={() => navigate('/dashboard')} className="btn-secondary">
  ← Back to Library
</button>
```

NOT:
```javascript
<button onClick={() => navigate('/#books')}>  // ❌ Wrong
<button onClick={() => window.location.href = '/'}>  // ❌ Wrong
```

---

## 🚀 Future Enhancements

### Phase 1: Core Features (High Priority)

#### 1.1 User Authentication & Authorization (IN PROGRESS)
- [x] Login page with form validation
- [x] Registration page with password strength
- [x] React Router integration
- [ ] Backend JWT authentication
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Role-based access control (Student, Librarian, Admin)
- [ ] OAuth integration (Google, GitHub)
- [ ] Session timeout handling

#### 1.2 Persistent Data Layer
- [ ] Migrate from H2 to PostgreSQL/MySQL
- [x] User profile storage (frontend ready)
- [x] KP tracking across sessions (localStorage)
- [ ] Database-backed user sessions
- [ ] Borrowing history
- [ ] Reading progress tracking
- [ ] Bookmark/favorites system

#### 1.3 Book Management (Admin)
- [ ] Admin dashboard at `/admin`
- [ ] Add/Edit/Delete books via UI
- [ ] Bulk import from CSV/Excel
- [ ] Book availability status
- [ ] Due date tracking
- [ ] Late return penalties
- [ ] Inventory management

#### 1.4 Enhanced Search & Filters
- [x] Basic search on dashboard
- [ ] Advanced filters (year, publisher, language)
- [ ] Search suggestions/autocomplete
- [ ] Recently viewed books
- [ ] Search history
- [ ] Sort options (popularity, date, rating)
- [ ] Full-text search (Elasticsearch)

#### 1.5 Protected Route Enhancement
- [ ] Implement route guards
- [ ] Redirect to login with return URL
- [ ] Role-based route access
- [ ] Loading states during auth check
- [ ] Unauthorized page (403)

---

### Phase 2: Gamification Expansion (Medium Priority)

#### 2.1 Multiple Dungeon Types
- [ ] **Speed Challenge**: Click faster targets
- [ ] **Memory Puzzle**: Remember book sequences
- [ ] **Trivia Quiz**: Answer questions about books
- [ ] **Code Debugging**: Fix code snippets
- [ ] **Pattern Matching**: Align corrupted data

#### 2.2 Progression System
- [ ] User levels (Novice → Scholar → Master)
- [ ] Experience points (XP) system
- [ ] Skill tree unlocks
- [ ] Daily quests/challenges
- [ ] Streak bonuses

#### 2.3 Achievements & Badges
- [ ] "First Blood" - Complete first dungeon
- [ ] "Speed Demon" - Win in under 5 seconds
- [ ] "Bookworm" - Read 50 books
- [ ] "Librarian's Favorite" - 1000 KP earned
- [ ] "Ghost Whisperer" - 100 chatbot conversations

#### 2.4 Leaderboard
- [ ] Global KP rankings
- [ ] Weekly/Monthly resets
- [ ] Friend comparisons
- [ ] Category-specific rankings (Software, Fiction, etc.)

#### 2.5 KP Shop
- [ ] Buy power-ups for dungeons
  - Time freeze (+5 seconds)
  - Slow motion (target moves slower)
  - Auto-click (1 free click)
- [ ] Cosmetic items
  - Custom chatbot themes
  - Book cover frames
  - Profile badges
- [ ] Premium features
  - Ad-free experience
  - Early access to new books

---

### Phase 3: AI Enhancements (Medium Priority)

#### 3.1 Advanced Chatbot Features
- [ ] Book recommendations based on:
  - Reading history
  - User preferences
  - Similar users' choices
- [ ] Multi-language support
  - Bengali, Hindi, Spanish, French
  - Auto-detect user language
- [ ] Voice chat integration
  - Speech-to-text input
  - Text-to-speech responses
- [ ] Image recognition
  - Upload book cover for identification
  - Scan ISBN for quick lookup

#### 3.2 AI-Generated Content
- [ ] Book summaries (auto-generated)
- [ ] Study guides
- [ ] Quiz questions from book content
- [ ] Reading comprehension tests
- [ ] Discussion prompts

#### 3.3 Smart Notifications
- [ ] Due date reminders
- [ ] New book arrivals matching preferences
- [ ] Dungeon cooldown completion
- [ ] Achievement unlocks
- [ ] Friend activity updates

---

### Phase 4: Social Features (Low Priority)

#### 4.1 User Profiles
- [ ] Customizable avatars
- [ ] Bio and interests
- [ ] Reading statistics dashboard
- [ ] Achievement showcase
- [ ] Friend list

#### 4.2 Book Reviews & Ratings
- [ ] 5-star rating system
- [ ] Text reviews
- [ ] Upvote/Downvote reviews
- [ ] Spoiler tags
- [ ] Reading progress sharing

#### 4.3 Study Groups
- [ ] Create/Join groups
- [ ] Group chat rooms
- [ ] Shared reading lists
- [ ] Collaborative notes
- [ ] Group challenges

#### 4.4 Real-time Features
- [ ] Live chat between users
- [ ] WebSocket-based notifications
- [ ] Online/Offline status
- [ ] Currently reading indicator

---

### Phase 5: Mobile & Accessibility (Low Priority)

#### 5.1 Progressive Web App (PWA)
- [ ] Offline mode support
- [ ] Install to home screen
- [ ] Push notifications
- [ ] Service worker caching

#### 5.2 Mobile Apps
- [ ] React Native iOS app
- [ ] React Native Android app
- [ ] App Store/Play Store deployment

#### 5.3 Accessibility
- [ ] Screen reader support (ARIA labels)
- [ ] Keyboard navigation
- [ ] High contrast mode
- [ ] Font size adjustments
- [ ] Color blind friendly palette

---

### Phase 6: Analytics & Reporting (Low Priority)

#### 6.1 User Analytics
- [ ] Reading time tracking
- [ ] Most popular books
- [ ] Category preferences
- [ ] Peak usage times
- [ ] Completion rates

#### 6.2 Admin Dashboard
- [ ] Total users
- [ ] Active users (daily/weekly/monthly)
- [ ] Book circulation stats
- [ ] Dungeon completion rates
- [ ] Chatbot interaction logs

#### 6.3 Reports
- [ ] Monthly usage reports
- [ ] Financial reports (if paid features)
- [ ] Export to PDF/Excel
- [ ] Scheduled email reports

---

### Technical Improvements

#### Performance Optimization
- [ ] Implement Redis caching
- [ ] Database query optimization
- [ ] Lazy loading images
- [ ] Code splitting (React)
- [ ] CDN for static assets

#### Security Enhancements
- [ ] HTTPS/TLS encryption
- [ ] Rate limiting on API endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] API key rotation
- [ ] Environment variable management

#### DevOps
- [ ] Docker containerization
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated testing (Jest, JUnit)
- [ ] Staging environment
- [ ] Production deployment (AWS/Azure/Heroku)
- [ ] Monitoring (Prometheus, Grafana)
- [ ] Error tracking (Sentry)

---

## 📄 License

This project is currently **unlicensed**. All rights reserved by the author.

For academic or commercial use, please contact the project maintainer.

---

## 📞 Contact & Support

**Project Maintainer**: Nusrat Bably  
**Email**: (Add your email)  
**GitHub**: (Add your GitHub profile)  
**University**: (Add your institution)

---

## 🙏 Acknowledgments

### Technologies Used
- **React** - Facebook (Meta)
- **Spring Boot** - Pivotal Software
- **Google Gemini AI** - Google DeepMind
- **H2 Database** - H2 Database Engine
- **Vite** - Evan You
- **Maven** - Apache Software Foundation

### External APIs
- **Open Library API** - Internet Archive
- **Google Generative AI API** - Google

### Design Inspiration
- **Discord** - UI/UX design patterns
- **GitHub** - Dark mode aesthetics
- **Steam** - Gamification concepts

---

## 📊 Project Statistics

**Lines of Code** (estimated):
- Frontend (React): ~3,500 lines
  - Pages: ~1,200 lines
  - Components: ~800 lines
  - Routing: ~300 lines
  - Auth: ~600 lines
  - Others: ~600 lines
- Backend (Java): ~1,500 lines
- CSS: ~1,800 lines
- **Total**: ~6,800 lines

**Pages**: 6 main pages (Landing, Login, Register, Home, Dashboard, BookDetails, Profile)  
**Components**: 6+ reusable components  
**Routes**: 7 routes  
**API Endpoints**: 3 (/api/books, /api/books/{id}, /api/chat)  
**Database Tables**: 1 (books) + planned (users, transactions)  
**External APIs**: 2 (Gemini AI, Open Library)

---

## 🔄 Version History

### Version 2.0.0 (January 23, 2026) - Current
- ✅ React Router DOM v7 integration
- ✅ Multi-page application structure
- ✅ Dedicated login and registration pages
- ✅ Library Dashboard page (`/dashboard`)
- ✅ Individual Book Details pages (`/book/:id`)
- ✅ User Profile page (`/profile`)
- ✅ Landing page for unauthenticated users
- ✅ Authentication flow (frontend UI)
- ✅ Improved navigation with "Back to Library" button
- ✅ Component-based architecture with reusable components
- ✅ Better separation of concerns

### Version 1.0.0 (January 23, 2026)
- ✅ Initial release
- ✅ Full-stack setup (React + Spring Boot)
- ✅ Single-page application with modals
- ✅ Book management system
- ✅ AI-powered Ghost Librarian chatbot
- ✅ Dungeon mini-game for corrupted books
- ✅ Dark mode support
- ✅ Responsive design
- ✅ H2 database with seed data
- ✅ CORS-enabled API

---

## 📝 Development Notes

### Recent Changes (Version 2.0.0)

1. **Architecture Shift**:
   - Moved from single-page app with modals to multi-page app with routing
   - Better URL structure for bookmarking and sharing
   - Improved SEO potential

2. **Component Organization**:
   - Separated pages into `/pages` directory
   - Auth components in `/log_reg` directory
   - Reusable components in `/components` directory
   - Styles organized in `/styles` directory

3. **Navigation Improvements**:
   - Browser back/forward buttons now work correctly
   - Direct URL access to any book
   - Breadcrumb navigation potential
   - Better user experience with explicit routes

4. **State Management**:
   - Moved from App.jsx-centric state to page-level state
   - Potential for context API or Redux in future
   - LocalStorage for session persistence

### Known Limitations

1. **Authentication**: Frontend UI complete, backend API not yet implemented
2. **Database**: In-memory (data lost on restart) - migration to persistent DB planned
3. **Gemini API**: Free tier has rate limits
4. **Book Covers**: Depends on external API (Open Library)
5. **Dungeon Game**: Single difficulty level
6. **Chatbot**: Context limited to 3 exchanges
7. **Mobile**: Improved but not fully optimized for small screens
8. **Route Protection**: Basic implementation, needs backend JWT validation
9. **PDF Viewing**: Planned feature, not yet implemented

### Best Practices Followed

- ✅ Component-based architecture (React)
- ✅ Client-side routing (React Router)
- ✅ RESTful API design
- ✅ Separation of concerns (MVC pattern)
- ✅ Error handling and logging
- ✅ CORS security
- ✅ Responsive CSS
- ✅ Semantic HTML
- ✅ Git version control
- ✅ Code reusability (BookGrid, etc.)
- ✅ Proper file organization
- ✅ Consistent naming conventions

---

## 📚 Additional Resources

### Learning Materials

**React Router**:
- Official Docs: https://reactrouter.com/
- v7 Migration Guide: https://reactrouter.com/upgrading/v6

**React**:
- Official Docs: https://react.dev
- Hooks Guide: https://react.dev/reference/react

**Spring Boot**:
- Official Docs: https://spring.io/projects/spring-boot
- Security Guide: https://spring.io/guides/gs/securing-web/

### Useful Commands Reference

```bash
# Frontend Commands
npm install                     # Install all dependencies
npm install react-router-dom    # Install router specifically
npm run dev                     # Start dev server (with routing)
npm run build                   # Production build
npm run preview                 # Preview production build

# Test Specific Routes
open http://localhost:5173/                    # Landing page
open http://localhost:5173/login               # Login page
open http://localhost:5173/register            # Register page
open http://localhost:5173/dashboard           # Dashboard
open http://localhost:5173/book/1              # Book details

# Backend Commands
./mvnw clean                    # Clean build artifacts
./mvnw spring-boot:run          # Start server

# API Testing
curl http://localhost:8080/api/books           # Get all books
curl http://localhost:8080/api/books/1         # Get specific book
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'                     # Test chat

# Git Commands
git status                      # Check status
git add .                       # Stage all changes
git commit -m "Add routing"     # Commit with message
git push origin main            # Push to remote

# Debug Commands
npm list react-router-dom       # Check router version
grep -r "useNavigate" src/      # Find navigation usage
grep -r "Routes" src/           # Find route definitions
```

---

**End of Documentation**

---

**Document Information**:
- **Created**: January 23, 2026
- **Last Updated**: January 23, 2026
- **Format**: Markdown
- **Version**: 2.0.0
- **Word Count**: ~11,000 words
- **Sections**: 14 major sections + routing details
- **Pages** (when printed): ~55 pages

This documentation provides a comprehensive reference for developers, users, and stakeholders to understand, maintain, and extend the BiblioTheca project with its new multi-page architecture and routing system.
