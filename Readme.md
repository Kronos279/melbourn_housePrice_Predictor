# 🏡 Melbourne Housing Price Predictor

A Full-Stack Machine Learning application that predicts housing prices in Melbourne based on 13 key features.

**🔴 Live Demo:** [Vercel App](https://melbourn-house-price-predictor.vercel.app/)

## 🚀 Key Features
* **Machine Learning:** XGBoost Ensemble model trained on the Melbourne Housing dataset.
* **Backend:** FastAPI (Python) serving real-time predictions.
* **Frontend:** React + Vite for a responsive user interface.
* **Deployment:** Microservices architecture (Frontend on Vercel, Backend on Render).

## 🛠️ Tech Stack
* **Languages:** Python, JavaScript
* **ML Libraries:** Scikit-Learn, XGBoost, Pandas
* **Web Frameworks:** FastAPI, React.js

## 📊 Model Performance
* **Model:** XGBoost Regressor
* **Accuracy (R²):** 0.85
* **Mean Absolute Error (MAE):** $162,068.01

## 💻 How to Run Locally

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn backend:app --reload