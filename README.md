# Gym-Freak 🏋️

Gym-Freak is a full-stack e-commerce platform built for fitness enthusiasts. The platform allows users to explore and purchase gym equipment, fitness accessories, workout tools, and apparel through a seamless shopping experience. It also includes a dedicated admin portal for managing products, users, and orders efficiently.

The application is built using Next.js for the frontend and Node.js with Express.js for the backend, providing a modern, scalable, and responsive user experience.

---

## 🚀 Features

### User Features

- User Registration and Login
- Secure Authentication and Authorization
- Browse Gym Products
- Product Search and Filtering
- Product Details Page
- Add to Cart Functionality
- Secure Checkout Process
- Razorpay Payment Gateway Integration
- Order Placement and Tracking
- Order History Management
- Fully Responsive Design

### Admin Features

- Admin Authentication
- Admin Dashboard
- Product Management (Create, Update, Delete)
- Order Management
- User Management
- Inventory Monitoring

### Security Features

- JWT Authentication
- Protected Routes
- Role-Based Access Control
- Password Hashing with bcrypt
- Secure Payment Processing

---

## 🛠️ Tech Stack

### Frontend

- Next.js
- React.js
- JavaScript
- Tailwind CSS

### Backend

- Node.js
- Express.js

### Database

- MongoDB

### Authentication

- JWT (JSON Web Token)
- bcrypt

### Payment Gateway

- Razorpay

---

## 📁 Project Structure

```text
Gym-Freak/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/Gym-Freak.git
cd Gym-Freak
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
npm start
```

---

## 🔑 Environment Variables

Create a `.env` file inside the backend folder:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=your_razorpay_key

RAZORPAY_SECRET=your_razorpay_secret
```

Create a `.env.local` file inside the frontend folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000

NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_key
```

---

## 🌟 Key Highlights

- Full-Stack E-Commerce Application
- Secure User and Admin Authentication
- Role-Based Authorization
- Razorpay Payment Gateway Integration
- RESTful API Architecture
- Responsive User Interface
- Scalable Project Structure
- Real-World E-Commerce Workflow
- Production-Oriented Development Approach

---

## 🔮 Future Enhancements

- Product Reviews and Ratings
- Wishlist Functionality
- Coupon and Discount System
- Email Notifications
- Order Tracking System
- Advanced Analytics Dashboard

---

## 👨‍💻 Author

**Ganesh Modanwal**

Frontend Developer

### Skills

- Next.js
- React.js
- Tailwind CSS
- Node.js
- Express.js
- MongoDB



