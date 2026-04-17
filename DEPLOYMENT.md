# Deployment Guide - Pruthvi Panthers

This project is configured for a split deployment:
- **Frontend**: Hostinger Static Hosting (React)
- **Backend**: Vercel Serverless Functions
- **Database**: Hostinger MySQL
- **Images**: Vercel Blob (Object Storage)

---

## 1. Database Setup (Hostinger)

1.  Log in to your Hostinger hPanel.
2.  Go to **Databases** -> **MySQL Databases**.
3.  Create a new database and user.
4.  **Remote MySQL**:
    -   Go to **Remote MySQL**.
    -   Add `0.0.0.0` to the "IP (IPv4 or IPv6/Wildcard)" field to allow Vercel to connect.
5.  **Run Migration**:
    -   Open **phpMyAdmin** for your database.
    -   Import the `schema.sql` file.
6.  **Seed Admin**:
    ```sql
    INSERT INTO admin_users (username, password, is_active) VALUES ('admin', 'your_password', 1);
    ```

---

## 2. Image Storage Setup (Vercel Blob)

1.  Go to your Vercel Dashboard.
2.  Select your project -> **Storage** tab.
3.  Click **Connect Store** -> **Vercel Blob**.
4.  Follow instructions to create the store.
5.  This will automatically add `BLOB_READ_WRITE_TOKEN` to your environment variables.

---

## 3. Backend Deployment (Vercel)

1.  Push your code to GitHub and import to Vercel.
2.  **Environment Variables**:
    Set the following in Vercel:
    -   `DB_HOST`: Your Hostinger DB Host.
    -   `DB_PORT`: `3306`
    -   `DB_NAME`: Your database name.
    -   `DB_USER`: Your database user.
    -   `DB_PASSWORD`: Your database password.
    -   `JWT_SECRET`: A long random string.
    -   `ALLOWED_ORIGINS`: `https://your-hostinger-domain.com,https://www.your-hostinger-domain.com`
    -   `BLOB_READ_WRITE_TOKEN`: (Added automatically by Vercel Storage).
    -   `EMAIL_USER`, `EMAIL_PASSWORD`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`: For email notifications.

---

## 4. Frontend Deployment (Hostinger)

1.  **Environment Variables**:
    Create `frontend/.env`:
    ```env
    REACT_APP_API_BASE_URL=https://your-backend.vercel.app
    ```
2.  **Build**:
    ```bash
    cd frontend
    npm install
    npm run build
    ```
3.  **Upload**:
    -   Zip the `frontend/build` contents.
    -   Upload to Hostinger `public_html`.
    -   Ensure `.htaccess` is included.

---

## 5. CRUD Logic for Images
The system automatically handles Vercel Blob storage:
- **Create**: Vercel API uploads to Blob and saves the URL to MySQL.
- **Update**: Vercel API uploads new image and deletes the old blob object.
- **Delete**: Vercel API deletes the blob object before removing the MySQL row.
- **Cleanup**: If you delete a player or gallery item, the storage space is automatically reclaimed.
