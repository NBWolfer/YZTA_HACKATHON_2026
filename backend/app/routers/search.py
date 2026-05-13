from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product, Customer, Order

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("/")
def search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    term = f"%{q}%"

    products = db.query(Product).filter(
        Product.name.ilike(term) | Product.category.ilike(term)
    ).limit(5).all()

    customers = db.query(Customer).filter(
        Customer.name.ilike(term) | Customer.city.ilike(term) | Customer.phone.ilike(term)
    ).limit(5).all()

    orders = db.query(Order).join(Order.customer).filter(
        Customer.name.ilike(term)
    ).limit(5).all()

    # Also match order ID if query is numeric
    if q.strip().lstrip("#").isdigit():
        order_id = int(q.strip().lstrip("#"))
        by_id = db.query(Order).filter(Order.id == order_id).first()
        if by_id and by_id not in orders:
            orders = [by_id] + list(orders)

    return {
        "products": [
            {"id": p.id, "name": p.name, "category": p.category, "stock_quantity": p.stock_quantity, "stock_unit": p.stock_unit}
            for p in products
        ],
        "customers": [
            {"id": c.id, "name": c.name, "city": c.city, "phone": c.phone}
            for c in customers
        ],
        "orders": [
            {"id": o.id, "customer_name": o.customer.name, "status": o.status.value, "total_amount": o.total_amount}
            for o in orders
        ],
    }
