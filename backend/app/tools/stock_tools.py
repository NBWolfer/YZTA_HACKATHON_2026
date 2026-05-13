"""Tool functions for inventory/stock operations.
These are called by the AI agent via Gemma 4 function calling."""

from sqlalchemy.orm import Session
from app.models import Product


def check_stock(db: Session, product_name: str) -> dict:
    """Check stock level for a product by name (fuzzy match)."""
    product = db.query(Product).filter(
        Product.name.ilike(f"%{product_name}%")
    ).first()

    if not product:
        return {"error": f"'{product_name}' adlı ürün bulunamadı."}

    return {
        "product_id": product.id,
        "name": product.name,
        "category": product.category,
        "stock_quantity": product.stock_quantity,
        "stock_unit": product.stock_unit,
        "unit_price": product.unit_price,
        "status": product.stock_status.value,
        "low_threshold": product.low_stock_threshold,
    }


def list_low_stock(db: Session) -> dict:
    """List all products that are at or below their low stock threshold."""
    products = db.query(Product).all()
    low = [
        {
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "stock_quantity": p.stock_quantity,
            "stock_unit": p.stock_unit,
            "threshold": p.low_stock_threshold,
            "status": p.stock_status.value,
        }
        for p in products
        if p.stock_quantity <= p.low_stock_threshold
    ]
    return {"low_stock_count": len(low), "products": low}


def get_all_products(db: Session) -> dict:
    """Get complete product catalog with stock levels."""
    products = db.query(Product).order_by(Product.category, Product.name).all()
    return {
        "total_products": len(products),
        "products": [
            {
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "stock": p.stock_quantity,
                "unit": p.stock_unit,
                "price": p.unit_price,
                "status": p.stock_status.value,
            }
            for p in products
        ],
    }


def generate_reorder_suggestion(db: Session, product_id: int) -> dict:
    """Generate a reorder suggestion based on stock level and sales velocity."""
    from app.models import OrderItem, Order
    from datetime import datetime, timedelta
    from sqlalchemy import func

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return {"error": "Ürün bulunamadı."}

    # Calculate 30-day sales velocity
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    sold_30d = db.query(func.coalesce(func.sum(OrderItem.quantity), 0)).join(
        Order, OrderItem.order_id == Order.id
    ).filter(
        OrderItem.product_id == product_id,
        Order.created_at >= thirty_days_ago,
    ).scalar() or 0

    # Total sold (all time) as fallback
    total_sold = db.query(func.coalesce(func.sum(OrderItem.quantity), 0)).filter(
        OrderItem.product_id == product_id
    ).scalar() or 0

    # Prefer 30-day window; fall back to all-time / 90 days
    if sold_30d > 0:
        daily_velocity = sold_30d / 30
    else:
        daily_velocity = total_sold / 90

    suggested_qty = max(int(daily_velocity * 30), product.low_stock_threshold * 2)

    return {
        "product": product.name,
        "current_stock": product.stock_quantity,
        "daily_velocity": round(daily_velocity, 1),
        "suggested_reorder_qty": suggested_qty,
        "estimated_cost": round(suggested_qty * product.unit_price * 0.6, 2),  # Wholesale ~60%
    }
