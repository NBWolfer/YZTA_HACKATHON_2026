from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models import Product, Order, OrderStatus

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


def _generate_notifications(db: Session):
    notifications = []
    nid = 1

    products = db.query(Product).all()
    for p in products:
        if p.stock_quantity <= 0:
            notifications.append({
                "id": nid,
                "type": "warning",
                "title": f"Stok Tükendi: {p.name}",
                "message": f"{p.name} stoklarında ürün kalmadı. Üretim durabilir.",
                "time": "Yeni",
                "read": False,
            })
            nid += 1
        elif p.stock_quantity <= p.low_stock_threshold:
            notifications.append({
                "id": nid,
                "type": "warning",
                "title": f"Düşük Stok: {p.name}",
                "message": f"{p.name} stokları kritik seviyede ({p.stock_quantity} {p.stock_unit}).",
                "time": "Yeni",
                "read": False,
            })
            nid += 1

    active_deliveries = db.query(Order).filter(
        Order.status.in_([OrderStatus.KARGOYA_VERILDI, OrderStatus.YOLDA])
    ).count()
    if active_deliveries > 0:
        notifications.append({
            "id": nid,
            "type": "info",
            "title": "Aktif Teslimatlar",
            "message": f"{active_deliveries} sipariş şu anda kargoda.",
            "time": "Güncel",
            "read": True,
        })
        nid += 1

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    todays_orders = db.query(Order).filter(Order.created_at >= today_start).count()
    if todays_orders > 0:
        notifications.append({
            "id": nid,
            "type": "success",
            "title": "Bugünkü Siparişler",
            "message": f"Bugün {todays_orders} yeni sipariş alındı.",
            "time": "Bugün",
            "read": True,
        })
        nid += 1

    return notifications


@router.get("/")
def get_notifications(db: Session = Depends(get_db)):
    return {"notifications": _generate_notifications(db)}


@router.post("/read-all")
def mark_all_read():
    return {"success": True}
