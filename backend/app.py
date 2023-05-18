from fastapi import FastAPI, HTTPException, Depends, Cookie
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import RedirectResponse
from sqlmodel import create_engine, SQLModel, Session, Field
from passlib.context import CryptContext
from pydantic import BaseModel

import uuid
import uvicorn

import ai

from typing import Optional
from datetime import datetime

# Authentication
security = HTTPBasic()
crypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database
engine = create_engine("sqlite:///data.db")

app = FastAPI()


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    first_name: str
    last_name: str
    date_of_birth: str
    hashed_password: str


class Report(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    fraud_email: str
    fraud_website: str
    details: str
    created_at: str


class ReportRequest(BaseModel):
    user_email: str
    fraud_email: str = ""
    fraud_website: str = ""
    details: str


def get_user(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user(db, email)
    if not crypt_context.verify(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return user


@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)


@app.post("/signup", tags=["auth"])
def create_user(user: User):
    with Session(engine) as session:
        user.hashed_password = crypt_context.hash(user.hashed_password)
        session.add(user)
        session.commit()
        session.refresh(user)
    return {"status": "success", "email": user.email}


@app.post("/login", tags=["auth"])
def login(credentials: HTTPBasicCredentials = Depends(security)):
    with Session(engine) as session:
        user = authenticate_user(session, credentials.username, credentials.password)
    response.set_cookie(
        key="email", value=user.email, httponly=True, max_age=1800, expires=1800
    )
    return {"status": "success", "email": user.email}


@app.post("/reports", tags=["reports"])
def create_report(report_request: ReportRequest):
    with Session(engine) as session:
        user = get_user(session, report_request.user_email)
        report = Report(
            fraud_email=report_request.fraud_email,
            fraud_website=report_request.fraud_website,
            details=report_request.details,
            created_at=datetime.now().isoformat(),
            user_id=user.id,
        )
        session.add(report)
        session.commit()
        session.refresh(report)
    return report


# AI stuff below


@app.post("/ai/email_body", response_model=ai.Result, tags=["ai"])
def process_email_body(email_request: ai.EmailRequest):
    return ai.process_email_body(email_request)


@app.post("/ai/marketplace", response_model=ai.Result, tags=["ai"])
def process_marketplace(marketplace_request: ai.MarketplaceRequest):
    return ai.process_marketplace(marketplace_request)


@app.post("/ai/job_listing", response_model=ai.Result, tags=["ai"])
def process_job_listing(job_listing_request: ai.JobListingRequest):
    return ai.process_job_listing(job_listing_request)
