from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.database import get_db
from app.models import Order, OrderStatus, Product, CargoTracking

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Get dashboard summary for the business owner view."""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # Today's orders
    todays_orders = db.query(Order).filter(Order.created_at >= today_start).all()
    todays_revenue = sum(o.total_amount for o in todays_orders)

    # Active deliveries
    active_deliveries = db.query(Order).filter(
        Order.status.in_([OrderStatus.KARGOYA_VERILDI, OrderStatus.YOLDA])
    ).count()

    # Stock warnings
    products = db.query(Product).all()
    low_stock_count = sum(1 for p in products if p.stock_quantity <= p.low_stock_threshold)

    # Weekly order volumes (last 7 days)
    weekly_volumes = []
    for i in range(6, -1, -1):
        day = today_start - timedelta(days=i)
        next_day = day + timedelta(days=1)
        count = db.query(Order).filter(
            Order.created_at >= day, Order.created_at < next_day
        ).count()
        weekly_volumes.append({
            "day": day.strftime("%a"),
            "count": count,
        })

    return {
        "todays_orders": len(todays_orders),
        "todays_revenue": round(todays_revenue, 2),
        "active_deliveries": active_deliveries,
        "low_stock_alerts": low_stock_count,
        "weekly_volumes": weekly_volumes,
    }


@router.get("/recent-activities")
def get_recent_activities(db: Session = Depends(get_db), limit: int = 10):
    """Get recent order activities."""
    orders = db.query(Order).order_by(Order.created_at.desc()).limit(limit).all()

    return {
        "activities": [
            {
                "order_id": o.id,
                "customer_name": o.customer.name,
                "product_summary": ", ".join(
                    item.product.name for item in o.items[:2]
                ) + ("..." if len(o.items) > 2 else ""),
                "status": o.status.value,
                "amount": o.total_amount,
                "created_at": o.created_at.isoformat(),
            }
            for o in orders
        ]
    }
