"""Tool functions for order-related operations.
These are called by the AI agent via Gemma 4 function calling."""

from sqlalchemy.orm import Session
from app.models import Order, OrderItem, CargoTracking, OrderStatus


def query_order_status(db: Session, order_id: int) -> dict:
    """Get the current status and details of a specific order."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return {"error": f"Sipariş #{order_id} bulunamadı."}

    items = []
    for item in order.items:
        items.append({
            "product": item.product.name,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
        })

    result = {
        "order_id": order.id,
        "customer": order.customer.name,
        "status": order.status.value,
        "total_amount": order.total_amount,
        "created_at": order.created_at.isoformat(),
        "items": items,
    }

    if order.cargo:
        result["cargo"] = {
            "provider": order.cargo.provider.value,
            "tracking_number": order.cargo.tracking_number,
            "cargo_status": order.cargo.status,
            "estimated_delivery": order.cargo.estimated_delivery,
        }

    return result


def list_todays_orders(db: Session) -> dict:
    """Get a summary of today's orders."""
    from datetime import datetime, timedelta
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    orders = db.query(Order).filter(Order.created_at >= today_start).all()

    status_counts = {}
    total_revenue = 0.0
    for o in orders:
        status_counts[o.status.value] = status_counts.get(o.status.value, 0) + 1
        total_revenue += o.total_amount

    return {
        "total_orders": len(orders),
        "total_revenue": round(total_revenue, 2),
        "by_status": status_counts,
        "orders": [
            {
                "id": o.id,
                "customer": o.customer.name,
                "status": o.status.value,
                "amount": o.total_amount,
            }
            for o in orders[:20]
        ],
    }


def create_order(db: Session, customer_id: int, items: list[dict]) -> dict:
    """Create a new order. items = [{"product_id": int, "quantity": int}, ...]"""
    from app.models import Product

    order = Order(customer_id=customer_id, status=OrderStatus.HAZIRLANIYOR)
    db.add(order)
    db.flush()

    total = 0.0
    created_items = []
    for item_data in items:
        product = db.query(Product).get(item_data["product_id"])
        if not product:
            continue
        if product.stock_quantity < item_data["quantity"]:
            return {"error": f"{product.name} için yeterli stok yok. Mevcut: {product.stock_quantity}"}

        oi = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item_data["quantity"],
            unit_price=product.unit_price,
        )
        db.add(oi)
        product.stock_quantity -= item_data["quantity"]
        line_total = product.unit_price * item_data["quantity"]
        total += line_total
        created_items.append({"product": product.name, "qty": item_data["quantity"], "total": line_total})

    order.total_amount = round(total, 2)
    db.commit()

    return {
        "order_id": order.id,
        "status": "Hazırlanıyor",
        "total_amount": order.total_amount,
        "items": created_items,
    }
