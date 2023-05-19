# fraudshield

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



## Landing Page

