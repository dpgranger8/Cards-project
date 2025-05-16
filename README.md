# Card Management API

This is a simple Node.js API using Express, Passport (Local Strategy), and JWT for managing a set of cards. Authentication is required for creating, editing, and deleting cards.

## Prerequisites

- Node.js >= 14.x
- npm

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up the `.env` File

Create a `.env` file in the root of the project with the following variables:

```env
PORT=3000
SECRET_KEY=your-secret-key
```

Replace `your-secret-key` with a strong secret string. This will be used to sign JWT tokens.

### 4. Start the Server

```bash
node index.js
```

The server should now be running on `http://localhost:3000`.

---

## Authentication and Authorization

### Users

The repository contains a `users.json` file with predefined users. Use one of these accounts to obtain a JWT token.

### Get JWT Token

Make a POST request to:

```
POST /getToken
```

#### Request Body:

```json
{
  "username": "your-username",
  "password": "your-password"
}
```

#### Example Response:

```json
{
  "token": "your-jwt-token"
}
```

---

## Using the API

### Public Routes

- `GET /cards` — Retrieve all cards, optionally filtered with query parameters.
- `GET /cards/count` — Get the number of cards.
- `GET /cards/random` — Get a random card.

### Protected Routes (Requires JWT Token)

Include the JWT token in the `Authorization` header:

```
Authorization: Bearer your-jwt-token
```

- `POST /cards/create` — Create a new card.
- `PUT /cards/:id` — Edit a card by ID.
- `DELETE /cards/:id` — Delete a card by ID.

#### Example Request with Token (Using curl):

```bash
curl -X POST http://localhost:3000/cards/create \
     -H "Authorization: Bearer your-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
           "name": "Example Card",
           "type": "example",
           "description": "This is a sample card"
         }'
```

---

## Notes

- Changes to cards are stored in the `cards.json` file.
- Use a REST client like Postman or curl to test the endpoints.
- Tokens expire in 1 day (`expiresIn: '1d'`).

