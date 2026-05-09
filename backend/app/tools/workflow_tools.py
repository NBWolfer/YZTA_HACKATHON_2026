"""Tool functions for workflow and task management.
These are called by the AI agent via Gemma 4 function calling."""

from sqlalchemy.orm import Session
from datetime import datetime


def get_morning_briefing(db: Session) -> dict:
    """Generate a morning briefing with today's key metrics and action items."""
    from app.tools.order_tools import list_todays_orders
    from app.tools.stock_tools import list_low_stock

    orders = list_todays_orders(db)
    low_stock = list_low_stock(db)

    # Count active deliveries
    from app.models import Order, OrderStatus, CargoTracking
    active_deliveries = db.query(Order).filter(
        Order.status.in_([OrderStatus.KARGOYA_VERILDI, OrderStatus.YOLDA])
    ).count()

    # Delayed cargo (mock: any "Yolda" for more than 3 days)
    from datetime import timedelta
    three_days_ago = datetime.utcnow() - timedelta(days=3)
    delayed = db.query(CargoTracking).filter(
        CargoTracking.status == "Kurye Dağıtımda",
        CargoTracking.last_update < three_days_ago,
    ).count()

    return {
        "date": datetime.utcnow().strftime("%d/%m/%Y"),
        "summary": {
            "todays_orders": orders["total_orders"],
            "todays_revenue": orders["total_revenue"],
            "active_deliveries": active_deliveries,
            "low_stock_alerts": low_stock["low_stock_count"],
            "delayed_shipments": delayed,
        },
        "action_items": [
            f"{low_stock['low_stock_count']} ürün için stok uyarısı var"
            if low_stock["low_stock_count"] > 0 else None,
            f"{delayed} kargo gecikmesi tespit edildi"
            if delayed > 0 else None,
            f"Bugün {orders['total_orders']} yeni sipariş işlenmeli"
            if orders["total_orders"] > 0 else None,
        ],
        "low_stock_products": [p["name"] for p in low_stock["products"][:5]],
    }


def list_pending_tasks(db: Session) -> dict:
    """List today's pending operational tasks."""
    from app.models import Order, OrderStatus

    preparing = db.query(Order).filter(
        Order.status == OrderStatus.HAZIRLANIYOR
    ).all()

    return {
        "tasks": [
            {
                "type": "package_preparation",
                "description": f"Sipariş #{o.id} — {o.customer.name} — paketlenmeli",
                "order_id": o.id,
                "priority": "high" if o.total_amount > 500 else "normal",
            }
            for o in preparing
        ],
        "total_pending": len(preparing),
    }
