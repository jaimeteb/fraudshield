import datetime

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String)
    date_of_birth = Column(Date)
    reports = relationship("Report", back_populates="user")

    def __repr__(self):
        return f"User(id={self.id}, name={self.first_name} {self.last_name}, email={self.email}, date_of_birth={self.date_of_birth})"


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="reports")

    def __repr__(self):
        return f"Report(id={self.id}, title={self.title}, content={self.content}, user_id={self.user_id})"
