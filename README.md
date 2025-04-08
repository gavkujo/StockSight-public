# StockSight - Inventory Management System

StockSight is a comprehensive inventory management system with sales tracking, purchase orders, and AI-powered forecasting.

## Deployment Instructions

### Option 1: Deploy to Render (Recommended)

1. **Sign up for Render**:
   - Create an account at [render.com](https://render.com)

2. **Deploy using the Blueprint**:
   - Fork this repository to your GitHub account
   - In the Render dashboard, click "New" and select "Blueprint"
   - Connect your GitHub account and select this repository
   - Render will automatically deploy both the frontend and backend using the configuration in `render.yaml`

3. **Access your application**:
   - Once deployment is complete, you can access your application at the URLs provided by Render

### Option 2: Deploy Frontend to Vercel and Backend to Render

1. **Deploy Frontend to Vercel**:
   - Sign up for Vercel at [vercel.com](https://vercel.com)
   - Connect your GitHub account
   - Import this repository
   - Configure the environment variables:
     - `VITE_API_URL`: Your Render backend URL

2. **Deploy Backend to Render**:
   - Sign up for Render at [render.com](https://render.com)
   - Create a new Web Service
   - Connect your GitHub repository
   - Configure the service:
     - Build Command: `pip install -r backend/requirements.txt`
     - Start Command: `cd backend && gunicorn run:app`
     - Environment Variables:
       - `MAIL_USERNAME`: Your email username
       - `MAIL_PASSWORD`: Your email password
       - `MONGODB_URI`: Your MongoDB connection string

## Local Development

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd stocksight
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the frontend**:
   ```bash
   npm run dev
   ```

4. **Run the backend**:
   ```bash
   cd backend
   python run.py
   ```

## Features

- Inventory management
- Sales tracking
- Purchase orders
- AI-powered forecasting
- User authentication
- Responsive design
