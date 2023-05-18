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

FRAUD_THRESHOLD = 50


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    first_name: str
    last_name: str
    date_of_birth: str
    hashed_password: str


class UsageLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    endpoint: str
    fraud_probability: int
    created_at: str


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


def log_usage(user_email: str, endpoint: str, fraud_probability: int):
    with Session(engine) as session:
        user = get_user(session, user_email)
        usage_log = UsageLog(
            endpoint=endpoint,
            fraud_probability=fraud_probability,
            created_at=datetime.now().isoformat(),
            user_id=user.id,
        )
        session.add(usage_log)
        session.commit()
        session.refresh(usage_log)


@app.post("/ai/email_body", response_model=ai.Result, tags=["ai"])
def process_email_body(email_request: ai.EmailRequest):
    response = ai.process_email_body(email_request)
    log_usage(
        email_request.user_email,
        "/ai/email_body",
        response.probability,
    )
    return response


@app.post("/ai/marketplace", response_model=ai.Result, tags=["ai"])
def process_marketplace(marketplace_request: ai.MarketplaceRequest):
    response = ai.process_marketplace(marketplace_request)
    log_usage(
        marketplace_request.user_email,
        "/ai/marketplace",
        response.probability,
    )
    return response


@app.post("/ai/job_listing", response_model=ai.Result, tags=["ai"])
def process_job_listing(job_listing_request: ai.JobListingRequest):
    response = ai.process_job_listing(job_listing_request)
    log_usage(
        job_listing_request.user_email,
        "/ai/job_listing",
        response.probability,
    )
    return response


@app.get("/stats/user", tags=["stats"])
def get_user_stats(user_email: str):
    with Session(engine) as session:
        user = get_user(session, user_email)
        usage_logs = session.query(UsageLog).filter(UsageLog.user_id == user.id).all()
        reports = session.query(Report).filter(Report.user_id == user.id).all()
    return {
        "amount_used": len(usage_logs),
        "amount_fraud": len(
            [log for log in usage_logs if log.fraud_probability >= FRAUD_THRESHOLD]
        ),
        "amount_reported": len(reports),
    }


@app.get("/stats/all", tags=["stats"])
def get_all_stats():
    with Session(engine) as session:
        usage_logs = session.query(UsageLog).all()
        reports = session.query(Report).all()
    return {
        "amount_used": len(usage_logs),
        "amount_fraud": len(
            [log for log in usage_logs if log.fraud_probability >= FRAUD_THRESHOLD]
        ),
        "amount_reported": len(reports),
    }
