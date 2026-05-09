from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Order, OrderStatus

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.get("/")
def get_orders(
    db: Session = Depends(get_db),
    status: str | None = None,
    limit: int = 50,
):
    """Get orders with optional status filter."""
    query = db.query(Order).order_by(Order.created_at.desc())

    if status:
        try:
            status_enum = OrderStatus(status)
            query = query.filter(Order.status == status_enum)
        except ValueError:
            pass

    orders = query.limit(limit).all()

    return {
        "total": len(orders),
        "orders": [
            {
                "id": o.id,
                "customer": {
                    "id": o.customer.id,
                    "name": o.customer.name,
                    "city": o.customer.city,
                },
                "status": o.status.value,
                "total_amount": o.total_amount,
                "items": [
                    {
                        "product": item.product.name,
                        "quantity": item.quantity,
                        "unit_price": item.unit_price,
                    }
                    for item in o.items
                ],
                "cargo": {
                    "provider": o.cargo.provider.value,
                    "tracking_number": o.cargo.tracking_number,
                    "status": o.cargo.status,
                    "estimated_delivery": o.cargo.estimated_delivery,
                } if o.cargo else None,
                "created_at": o.created_at.isoformat(),
            }
            for o in orders
        ],
    }


@router.get("/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get a specific order by ID."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return {"error": f"Sipariş #{order_id} bulunamadı."}

    return {
        "id": order.id,
        "customer": {
            "id": order.customer.id,
            "name": order.customer.name,
            "city": order.customer.city,
            "phone": order.customer.phone,
        },
        "status": order.status.value,
        "total_amount": order.total_amount,
        "items": [
            {
                "product": item.product.name,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "line_total": item.quantity * item.unit_price,
            }
            for item in order.items
        ],
        "cargo": {
            "provider": order.cargo.provider.value,
            "tracking_number": order.cargo.tracking_number,
            "status": order.cargo.status,
            "estimated_delivery": order.cargo.estimated_delivery,
        } if order.cargo else None,
        "created_at": order.created_at.isoformat(),
        "updated_at": order.updated_at.isoformat(),
    }
