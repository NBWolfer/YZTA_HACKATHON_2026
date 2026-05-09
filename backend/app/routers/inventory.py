from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


@router.get("/products")
def get_products(
    db: Session = Depends(get_db),
    category: str | None = None,
    status: str | None = None,
):
    """Get all products with optional filtering."""
    query = db.query(Product).order_by(Product.category, Product.name)

    if category:
        query = query.filter(Product.category == category)

    products = query.all()

    if status:
        products = [p for p in products if p.stock_status.value == status]

    return {
        "total": len(products),
        "products": [
            {
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "stock_quantity": p.stock_quantity,
                "stock_unit": p.stock_unit,
                "unit_price": p.unit_price,
                "low_stock_threshold": p.low_stock_threshold,
                "status": p.stock_status.value,
            }
            for p in products
        ],
    }


@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """Get distinct product categories."""
    categories = db.query(Product.category).distinct().all()
    return {"categories": [c[0] for c in categories]}


@router.get("/low-stock")
def get_low_stock(db: Session = Depends(get_db)):
    """Get products below their stock threshold."""
    products = db.query(Product).all()
    low = [p for p in products if p.stock_quantity <= p.low_stock_threshold]

    return {
        "count": len(low),
        "products": [
            {
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "stock_quantity": p.stock_quantity,
                "stock_unit": p.stock_unit,
                "threshold": p.low_stock_threshold,
                "status": p.stock_status.value,
            }
            for p in low
        ],
    }
