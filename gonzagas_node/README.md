# Gonzaga's Store - Node.js Backend & Admin Panel

This project is the Node.js backend and administrative panel for Gonzaga's Store.

## Features

- Product Management
- Inventory Management with advanced filtering
- Product Family (Category) Management
- User Authentication
- Admin Dashboard

## Recent Updates

- **Inventory Page Filters**: Implemented robust filtering for Reference, Category, Product Status, and Stock Status. Filters are now applied via an "Apply Filters" button for better user control.
- **Badge Visibility**: Improved text color on badges for better readability.
- **Script Loading**: Resolved issues with JavaScript execution on the inventory page by ensuring correct integration with EJS layouts.

## Prerequisites

- Node.js (version specified in `.nvmrc` or latest LTS recommended)
- npm (or yarn)
- PostgreSQL (or your configured database)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd gonzagas_node
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory by copying `.env.example` (if it exists) or by adding the necessary variables:
    ```env
    NODE_ENV=development
    PORT=3000
    DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
    SESSION_SECRET=your_very_strong_session_secret
    # Add other necessary variables (e.g., API keys, email settings)
    ```
    Ensure your `DATABASE_URL` is correctly configured to point to your database instance.

4.  **Run database migrations (if applicable):**
    If your project uses a migration tool (e.g., Knex, Sequelize), run the migrations:
    ```bash
    # Example: npx knex migrate:latest
    ```

## Running the Application

-   **Development Mode:**
    ```bash
    npm run dev
    # or if no dev script is configured:
    # NODE_ENV=development node app.js
    ```
    This usually enables features like hot-reloading and more detailed logging.

-   **Production Mode:**
    ```bash
    NODE_ENV=production node app.js
    ```

## Project Structure (Overview)

-   `app.js`: Main application entry point.
-   `config/`: Configuration files (database, views, etc.).
-   `controllers/`: Request handlers and business logic.
-   `models/`: Database models and interactions.
-   `routes/`: Express route definitions.
-   `views/`: EJS templates for rendering HTML.
-   `public/`: Static assets (CSS, JavaScript, images).
-   `middleware/`: Custom Express middleware.

## Next Steps for Deployment

1.  **Commit all changes to Git.**
2.  **Ensure your production environment variables are correctly set on your deployment server.**
3.  **Choose a deployment strategy/platform (e.g., Heroku, AWS, DigitalOcean, Vercel, Netlify for static parts if any).**

This README provides a starting point. You should expand it with more details specific to your project's setup and deployment process.
