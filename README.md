# Buykart - Inventory Management System

Buykart is a robust web-based inventory management application designed to streamline the process of tracking stock, managing products, and handling administrative tasks. It features a responsive frontend for easy interaction and a Node.js backend integrated with Firebase Firestore for real-time data management.

## 🚀 Features

*   **Inventory Management:**
    *   **CRUD Operations:** Add, view, update, and delete inventory items seamlessly.
    *   **Image Upload:** Upload and manage product images locally.
    *   **Stock Tracking:** Monitor opening stock, prices, and units (Kgs/Pcs).
*   **User Management:**
    *   Admin login and user registration functionality.
*   **Responsive UI:**
    *   Clean, mobile-friendly interface built with HTML, CSS, and JavaScript.
    *   Interactive elements including modals, loaders, and custom alert notifications.
*   **Backend API:**
    *   RESTful API endpoints for handling products and inventory data.

## 🛠️ Tech Stack

*   **Frontend:** HTML5, CSS3 (Tailwind-style classes), JavaScript (jQuery, Axios).
*   **Backend:** Node.js, Express.js.
*   **Database:** Google Firebase Firestore.
*   **File Storage:** Local server storage (Multer).

## ⚙️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd Buykart
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Firebase:**
    *   Place your Firebase service account key file named `credentials.json` in the root directory.
    *   *Note: This file is sensitive and is excluded from version control.*

4.  **Access the App:**
    Open your browser and navigate to `http://localhost:3000` (or your configured port).

## 📂 Project Structure

*   `src/api/`: Backend logic, controllers, and routes.
*   `views/`: Frontend HTML files.
*   `public/`: Static assets (CSS, JS, Images).
*   `credentials.json`: Firebase authentication keys (Ignored by Git).

