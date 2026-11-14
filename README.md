# 🚩 Jagannath Dham

<h1 align="center">🛕 JAGANNATH DHAM</h1>

<h3 align="center">🙏 Darshan & Tourism Platform</h3>

<p align="center">
  <b>Connecting Devotees with the Divine Experience of Shree Jagannath Mahaprabhu</b>
</p>

<p align="center">
  <img
    src="jagannath-dham-frontend/src/assets/REadme logo.png"
    width="230"
    height="200"
    alt="Jagannath Dham Logo"
  />
</p>

<p align="center">
  <a href="https://jagannath-dham-frontend.vercel.app">
    <img src="https://img.shields.io/badge/🌐_LIVE_WEBSITE-Visit_Now-FF8C00?style=for-the-badge" alt="Live Website"/>
  </a>
  <a href="https://github.com/mohitkpani/jagannath-dham">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub"/>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk"/>
  <img src="https://img.shields.io/badge/Spring_Boot-Backend-6DB33F?style=flat-square&logo=springboot"/>
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=flat-square&logo=react"/>
  <img src="https://img.shields.io/badge/Vite-Build_Tool-646CFF?style=flat-square&logo=vite"/>
  <img src="https://img.shields.io/badge/MySQL-Database-4479A1?style=flat-square&logo=mysql"/>
  <img src="https://img.shields.io/badge/JWT-Authentication-black?style=flat-square&logo=jsonwebtokens"/>
</p>

---

## 🌺 About the Project

**Jagannath Dham** is a full-stack web application designed to enhance the digital experience of devotees visiting Shree Jagannath Temple, Puri, and exploring the spiritual and cultural heritage of Odisha.

The platform brings together digital Darshan booking, QR-based ticket verification, devotee management and tourism exploration through a unified web application.

It provides three dedicated dashboards:

- 🙏 **Devotee Dashboard** – For devotees to explore and manage their bookings.
- 👨‍💼 **Staff Dashboard** – For staff to verify tickets and manage temple entry.
- 🛡️ **Admin Dashboard** – For administrators to manage the platform.

## ✨ Key Features

### 🙏 Devotee Dashboard

- 🔐 User registration and secure login.
- 🎫 Darshan slot browsing and booking.
- 📱 Digital tickets with QR codes.
- 📋 Booking history and management.
- 👤 Profile management.
- 🗺️ Explore Odisha tourism destinations.
- 🎉 Festivals of Odisha.

### 👨‍💼 Staff Dashboard

- 📷 QR-based ticket scanning.
- ✅ Ticket verification.
- 🚫 Duplicate scan prevention.
- 📊 Entry tracking and recent scan history.
- 🚪 Gate activity monitoring.

### 🛡️ Admin Dashboard

- 👥 User and staff management.
- 🏷️ Darshan category management.
- 📅 Darshan slot management.
- 🎟️ Booking management.
- ⚙️ Daily capacity management.
- 🚪 Gate management.
- 🗺️ Destination management.
- 🎉 Festival information management.
- 📈 Dashboard analytics.

## 🎨 Technology Stack

### 💻 Frontend

| Technology      | Purpose                  |
| --------------- | ------------------------ |
| ⚛️ React.js     | User Interface           |
| ⚡ Vite         | Development & Build Tool |
| 🟨 JavaScript   | Application Logic        |
| 🎨 HTML5 & CSS3 | UI & Styling             |
| 🔗 Axios        | API Communication        |
| 🧭 React Router | Navigation               |

### ⚙️ Backend

| Technology         | Purpose                |
| ------------------ | ---------------------- |
| ☕ Java 21         | Programming Language   |
| 🍃 Spring Boot     | Backend Framework      |
| 🔐 Spring Security | Application Security   |
| 🔑 JWT             | Authentication         |
| 🗄️ Spring Data JPA | Database Operations    |
| 🛠️ Hibernate       | ORM                    |
| 📦 Maven           | Build Management       |
| 🌐 REST APIs       | Frontend Communication |

### 🗃️ Database & Deployment

| Technology | Purpose             |
| ---------- | ------------------- |
| 🐬 MySQL   | Relational Database |
| ▲ Vercel   | Frontend Hosting    |
| 🚀 Render  | Backend Hosting     |
| 🐳 Docker  | Containerization    |

## 🏗️ Project Architecture

```text
             🙏 DEVOTEE
                  |
             👨‍💼 STAFF
                  |
             🛡️ ADMIN
                  |
                  ▼
        ⚛️ REACT FRONTEND
                  |
             REST APIs
                  |
                  ▼
        ☕ SPRING BOOT
                  |
          🔐 SPRING SECURITY
                  |
             JWT AUTH
                  |
                  ▼
           🗄️ MYSQL DB
```

## 📂 Project Structure

```text
jagannath-dham/
│
├── backend/
│   ├── src/main/java/
│   │   └── com/jagannathdham/
│   │       ├── config/
│   │       ├── controller/
│   │       ├── dto/
│   │       ├── entity/
│   │       ├── exception/
│   │       ├── repository/
│   │       ├── security/
│   │       └── service/
│   │
│   ├── src/main/resources/
│   ├── Dockerfile
│   └── pom.xml
│
├── jagannath-dham-frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── assets/
│   └── jagannath-dham-logo.svg
│
└── README.md
```

## 🚀 Getting Started

Follow these instructions to run the project locally.

### 📌 Prerequisites

Make sure you have installed:

- ☕ Java 21+
- 📦 Maven
- 🟢 Node.js & npm
- 🐬 MySQL 8.0+
- 🔧 Git

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/mohitkpani/jagannath-dham.git

cd jagannath-dham
```

### 2️⃣ Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Configure your database connection and other required application properties.

Run the Spring Boot application:

```bash
mvn spring-boot:run
```

Backend will run at:

```text
http://localhost:8080
```

### 3️⃣ Frontend Setup

Open another terminal:

```bash
cd jagannath-dham-frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the frontend root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Start the frontend:

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

## 🔐 Environment Configuration

The frontend uses environment variables to communicate with the backend.

| Environment       | Configuration                                   |
| ----------------- | ----------------------------------------------- |
| Local Development | `http://localhost:8080/api`                     |
| Production        | Configured through Vercel Environment Variables |

**Important:** Never commit database credentials, JWT secrets, email passwords or other sensitive environment variables to GitHub.

## ☁️ Deployment

| Component | Platform  |
| --------- | --------- |
| Frontend  | ▲ Vercel  |
| Backend   | 🚀 Render |
| Database  | 🐬 MySQL  |

🌐 **Experience the application:** [Jagannath Dham – Live Website](https://jagannath-dham-frontend.vercel.app)

## 🔒 Security Features

- 🔑 JWT-based authentication.
- 🛡️ Role-based authorization.
- 🔐 Spring Security integration.
- 🔒 Password hashing.
- 🌐 Configured CORS policies.
- 🚫 Protected API endpoints.

## 🔮 Future Enhancements

- 💳 Online payment integration.
- 📊 Advanced booking analytics.
- 📱 Dedicated mobile application.
- 🛕 Enhanced temple information.
- 🌍 Expanded Odisha tourism services.

## 👨‍💻 Developer

<p align="center">
  <b>Mohit Kumar Pani</b>
  <br/>
  Full Stack Developer
  <br/><br/>
  <a href="https://github.com/mohitkpani">
    <img src="https://img.shields.io/badge/GitHub-mohitkpani-181717?style=for-the-badge&logo=github"/>
  </a>
</p>

---

<p align="center">
  🧡 Built with passion and devotion.
  <br/><br/>
  <h3 align="center">🙏 जय जगन्नाथ 🚩</h3>
  <p align="center"><b>JAI JAGANNATH!</b></p>
</p>
