# FraudShield

![logo](frontend/public/icon-128.png)

This project is divided into 3 parts:
* Backend
* Frontend
* Landing Page

## Backend

**NOTE THAT YOU NEED AN OPENAI API KEY IN ORDER TO RUN THE BACKEND FULLY**

To run the backend, there are two options:

### 1. Docker

```bash
cd backend
docker build -t fraudshield-backend .
docker --rm -p 8000:8000 -e OPEN_API_KEY=<your_open_api_key> fraudshield-backend
```

### 2. Python

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app
```

## Frontend

First, run landing page locally.

```bash
cd landing
yarn
yarn dev
```
Second, build chrome extension.

```bash
cd frontend
yarn
yarn build
```

## Further steps
- In Chrome browser open `chrome://extensions`
- On the right of the screen enable "Developer mode"
- Click "Load unpacked" and choose directory `/frontend/dist`
- Extension will be installed to your browser
- In order to register user open [http://localhost:8000/docs#/auth/create_user_signup_post](http://localhost:8000/docs#/auth/create_user_signup_post) 
- Login in FraudShield chrome extension


