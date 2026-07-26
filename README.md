# FinTax Pro

FinTax Pro is an AI-powered financial and tax management platform built for Indian freelancers, consultants, creators, and small businesses. It features real-time GST calculations, presumptive taxation estimates (Section 44ADA), an Income Smoother cash reserve simulation, and clean CA-ready exports.

## Tech Stack
- **Frontend**: React (JS) + Vite + Tailwind CSS + Zustand + Lucide Icons + Recharts
- **Backend**: Spring Boot 3.3.0 + Spring Security + JWT + Spring Data JPA
- **Database**: PostgreSQL

---

## Getting Started

### Prerequisites
- **Java 17** or higher
- **Node.js** (v18 or higher) & **npm**
- **PostgreSQL** running locally

---

### Step 1: Database Setup
1. Open your PostgreSQL console or client (like pgAdmin or DBeaver).
2. Create a new database named `fintax_db`:
   ```sql
   CREATE DATABASE fintax_db;
   ```
3. Update connection credentials in the Spring Boot configuration if your local PostgreSQL password differs from `postgres`:
   - Open `backend/src/main/resources/application.properties`
   - Change `spring.datasource.password` and `spring.datasource.username` to match your local setup.

---

### Step 2: Running the Spring Boot Backend
1. Open a terminal in the `backend` directory.
2. Compile and run the application using Maven:
   ```bash
   mvn spring-boot:run
   ```
3. The server will launch on `http://localhost:8080`.
4. Tables are auto-created, and realistic transactional mock history is seeded automatically on boot.

---

### Step 3: Running the React Frontend
1. Open a terminal in the `frontend` directory.
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web dashboard by navigating to `http://localhost:5173`.

---

## Mock Login Credentials
- **Email**: `demo@fintaxpro.in`
- **Password**: `password123`
