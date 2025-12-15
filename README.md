# Social Media App Task 2

A full-stack social media application built with Node.js, Express, and MongoDB. This project includes user authentication, post relationships, and interaction features.

## Features

- **User Authentication**: Sign up and login with JWT-based sessions.
- **Profiles**: User profile management.
- **Posts**: Create, read, update, and delete posts.
- **Interactions**: Like and comment functionalities.
- **Responsive Design**: Mobile-friendly frontend served via the `public` directory.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **Frontend**: HTML, CSS, Vanilla JavaScript

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB connection URI

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/AbdulQadir1982/SocialMediaTask2.git
    cd SocialMediaTask2
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env` file in the root directory and add:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```

4.  Run the application:
    ```bash
    npm start
    ```
    The server will start on `http://localhost:5000`.

## API Endpoints

- **Auth**: `/api/auth` (Register, Login)
- **Users**: `/api/users` (Profile management)
- **Posts**: `/api/posts` (CRUD operations)
- **Interactions**: `/api/interactions`

## Deployment

This project is configured for deployment on Vercel.

1.  Push to GitHub.
2.  Import the project in Vercel.
3.  Set `MONGO_URI` and `JWT_SECRET` in Vercel Environment Variables.
4.  Deploy!

## License

ISC
