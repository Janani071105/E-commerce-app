# Full-Stack E-Commerce Application

# Project Overview

The Full-Stack E-Commerce Application is a modern web application built to deliver a complete online shopping experience for customers and a comprehensive management platform for merchants. The application follows a full-stack architecture, featuring a React client frontend, a Node.js and Express API server backend, and a MongoDB Atlas database cluster for permanent data persistence.

As a full-stack web application, it manages the complete end-to-end flow of retail operations: product discovery, real-time search and filtering, item cart operations, order checkout, review submission, and database record synchronization.

# Key Features
Storefront and Customer Experience

1. Dynamic Product Catalog: Live product showcase featuring category tags, dynamic pricing, availability statuses, and real-time star ratings.
2. Product Detail Views: Interactive product modal viewports displaying complete item descriptions, technical attributes, multi-image view options, and customer reviews.
3. Persistent Shopping Cart: Shopping cart logic with dual persistence (managing local state for speed while syncing with backend database   endpoints).
4. Customer Review System: Interactive customer feedback module allowing verified buyers to submit star ratings and written reviews for individual products.
5. Wishlist Management: Client-side item saving allowing users to bookmark preferred products across listings.

# Seller and Administrative Capabilities
1. Live Order Dashboard: Real-time administration panel for store operators to track incoming orders, customer details, purchased items, and status indicators.
2. Order Fulfillment Tracking: Fulfillment management system providing tracking numbers and delivery estimates upon order creation.
3. Database Persistence: Direct integration with MongoDB Atlas to store customer orders, cart records, reviews, and catalog data permanently.

# Tech Stack

# Frontend Stack

React.js: Core component framework for building a dynamic, responsive single-page user interface.

React Router DOM: Client-side routing library for single-page application navigation.

Axios: Promise-based HTTP client for asynchronous API communication with the backend.

# Backend Stack

Node.js: Server runtime engine for backend API routes and processing logic.

Express.js: Web server framework providing REST API routing and request middleware.

MongoDB Atlas: Cloud NoSQL database hosting products, orders, cart items, and review collections.

Mongoose ODM: Object Data Modeling library managing database schemas, validations, and query execution.

# System Requirements
# Hardware Requirements

1. Processor: Dual-Core 2.0 GHz or higher
2. System Memory (RAM): Minimum 4 GB (8 GB recommended)
3. Disk Space: 500 MB available local disk space

# Software Requirements

1. Node.js (v16.x or higher)
2. Node Package Manager (npm v8.x or higher)
3. Modern web browser (Google Chrome, Firefox, Edge, or Safari)
4. Internet access for cloud database connectivity

# Dependencies

# Frontend Dependencies

react and react-dom

react-router-dom

axios

# Backend Dependencies

express

mongoose

dotenv

cors

nodemon (Development Dependency)

# Project Setup

1. Repository Layout

Verify that the project workspace consists of two main application directories:

frontend/ - Contains the React single-page frontend application.

backend/ - Contains the Express server application, API routes, and database models.

2. Environment Configuration

Create a .env configuration file inside the backend/ folder specifying:

The server application port number.

The MongoDB Atlas database connection string.

# How to Run the Project

Step 1: Start the Backend Server

1. Open a terminal window.
2. Navigate to the backend directory:
cd backend
3. Install backend node packages:
npm install
4. Start the server daemon:
npm start
5. Verify that the terminal logs confirm successful server execution and connection to MongoDB Atlas.

Step 2: Start the Frontend Application
1. Open a second terminal window.
2. Navigate to the frontend folder:
cd frontend
3. Install client node packages:
npm install
4. Start the React development client:
npm start
5. Access the application in your browser at http://localhost:3000.

# Architectural Principles

Decoupled Architecture: The React client application runs independently from the Node/Express backend server, exchanging data strictly via RESTful JSON API endpoints.

Full-Stack Data Persistence: All transactions, product reviews, and shopping cart updates are synchronized directly with MongoDB to ensure persistent data storage across browser sessions.

Client Performance Optimization: Local UI state management allows instant user feedback while network operations run asynchronously in the background.