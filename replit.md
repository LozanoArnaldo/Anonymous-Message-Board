# Overview

This is an Anonymous Message Board application built as part of a freeCodeCamp Information Security project. The application allows users to create discussion boards, post threads within those boards, and reply to existing threads. The system emphasizes anonymity while providing basic moderation features through password-protected deletion and reporting functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Architecture
The application follows a traditional Node.js/Express.js server architecture with MongoDB for data persistence:

- **Express.js Framework**: Handles HTTP routing, middleware, and server functionality
- **RESTful API Design**: Clean API endpoints for threads and replies operations
- **MVC Pattern**: Models are separated using Mongoose schemas, with routes handling controller logic
- **Security Layer**: Helmet.js middleware provides security headers including frame guards, DNS prefetch control, and referrer policy

## Data Storage
- **Primary Database**: MongoDB with Mongoose ODM for schema management
- **Fallback Strategy**: MongoDB Memory Server for testing and development when Atlas connection fails
- **Schema Design**: 
  - Thread model with embedded replies schema
  - Password-protected deletion system
  - Reporting mechanism for content moderation
  - Automatic timestamp management for creation and last activity

## Frontend Architecture
- **Static HTML Pages**: Three main views (index, board, thread) served as static files
- **Client-Side JavaScript**: jQuery-based dynamic content loading and form handling
- **Progressive Enhancement**: Forms work without JavaScript, enhanced with AJAX functionality
- **Responsive Design**: Basic CSS styling with mobile-friendly viewport configuration

## API Structure
The REST API follows a hierarchical structure:
- `/api/threads/:board` - Thread operations (GET, POST, PUT, DELETE)
- `/api/replies/:board` - Reply operations (GET, POST, PUT, DELETE)
- Board-specific routing with dynamic board names
- JSON responses with sanitized data (passwords and reports hidden from public views)

## Security Features
- **Password Protection**: Threads and replies require passwords for deletion
- **Content Moderation**: Reporting system for inappropriate content
- **Data Sanitization**: Sensitive fields (passwords, report status) excluded from public API responses
- **CORS Configuration**: Configured for freeCodeCamp testing requirements
- **Helmet Security**: Basic security headers implementation

## Testing Infrastructure
- **Mocha/Chai Framework**: Comprehensive functional testing suite
- **Test Database**: Separate in-memory database for isolated testing
- **Automated Testing**: Built-in test runner for continuous validation
- **FCC Integration**: Special testing routes for freeCodeCamp verification

# External Dependencies

## Core Framework Dependencies
- **Express.js**: Web application framework and HTTP server
- **Mongoose**: MongoDB object modeling and database operations
- **Body-parser**: HTTP request body parsing middleware
- **Helmet**: Security-focused HTTP headers middleware

## Development and Testing
- **MongoDB Memory Server**: In-memory database for development and testing
- **Mocha**: JavaScript testing framework
- **Chai**: Assertion library for testing
- **Chai-HTTP**: HTTP integration testing for API endpoints

## Utility Libraries
- **CORS**: Cross-origin resource sharing configuration
- **Dotenv**: Environment variable management
- **jQuery**: Client-side JavaScript library for DOM manipulation and AJAX

## Database Services
- **MongoDB Atlas**: Primary cloud database service (via MONGO_URI environment variable)
- **Local MongoDB**: Development fallback option
- **In-Memory Database**: Testing and development fallback when external connections fail