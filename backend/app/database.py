import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import settings

os.makedirs("data", exist_ok=True)

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from app.models import Product, Order, Customer, OrderItem, CargoTracking, User  # noqa: F401
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    if db.query(Product).count() == 0:
        from app.seed import seed_all
        seed_all(db)
    db.close()
