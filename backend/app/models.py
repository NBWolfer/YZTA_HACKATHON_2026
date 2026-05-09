from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum as SAEnum
)
from sqlalchemy.orm import relationship
import enum

from app.database import Base


# ── Enums ────────────────────────────────────────────────────────────
class OrderStatus(str, enum.Enum):
    HAZIRLANIYOR = "Hazırlanıyor"
    KARGOYA_VERILDI = "Kargoya Verildi"
    YOLDA = "Yolda"
    TESLIM_EDILDI = "Teslim Edildi"
    IPTAL = "İptal"


class StockStatus(str, enum.Enum):
    IN_STOCK = "In Stock"
    LOW_STOCK = "Low Stock"
    OUT_OF_STOCK = "Out of Stock"


class CargoProvider(str, enum.Enum):
    YURTICI = "Yurtiçi Kargo"
    ARAS = "Aras Kargo"
    MNG = "MNG Kargo"


# ── Models ───────────────────────────────────────────────────────────
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    unit_price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    stock_unit = Column(String, default="Adet")  # Adet, Kg, Litre
    low_stock_threshold = Column(Integer, default=20)
    created_at = Column(DateTime, default=datetime.utcnow)

    order_items = relationship("OrderItem", back_populates="product")

    @property
    def stock_status(self) -> StockStatus:
        if self.stock_quantity <= 0:
            return StockStatus.OUT_OF_STOCK
        if self.stock_quantity <= self.low_stock_threshold:
            return StockStatus.LOW_STOCK
        return StockStatus.IN_STOCK


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String)
    email = Column(String)
    city = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="customer")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    status = Column(SAEnum(OrderStatus), default=OrderStatus.HAZIRLANIYOR)
    total_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    cargo = relationship("CargoTracking", back_populates="order", uselist=False)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class CargoTracking(Base):
    __tablename__ = "cargo_tracking"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, unique=True)
    provider = Column(SAEnum(CargoProvider), nullable=False)
    tracking_number = Column(String, nullable=False)
    status = Column(String, default="Hazırlanıyor")
    estimated_delivery = Column(String)
    last_update = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="cargo")
