from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session
import csv
import io

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


class RestockRequest(BaseModel):
    amount: int = 50

@router.post("/{product_id}/restock")
def restock_product(
    product_id: int,
    request: RestockRequest,
    db: Session = Depends(get_db)
):
    """Increase stock quantity for a specific product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    
    product.stock_quantity += request.amount
    db.commit()
    db.refresh(product)
    
    return {
        "success": True,
        "message": f"{product.name} stoklarına {request.amount} adet eklendi.",
        "new_stock": product.stock_quantity,
        "status": product.stock_status.value
    }


class UpdateStockRequest(BaseModel):
    amount: int

@router.patch("/{product_id}/stock")
def update_stock(
    product_id: int,
    request: UpdateStockRequest,
    db: Session = Depends(get_db)
):
    """Adjust stock quantity by a delta (positive or negative)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    new_qty = product.stock_quantity + request.amount
    if new_qty < 0:
        raise HTTPException(status_code=400, detail="Stok miktarı negatif olamaz")

    product.stock_quantity = new_qty
    db.commit()
    db.refresh(product)

    return {
        "success": True,
        "message": f"{product.name} stok güncellendi: {product.stock_quantity} {product.stock_unit}",
        "new_stock": product.stock_quantity,
        "status": product.stock_status.value,
    }


class ProductCreate(BaseModel):
    name: str
    category: str
    unit_price: float
    stock_quantity: int
    stock_unit: str = "Adet"
    low_stock_threshold: int = 20

@router.post("/products")
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db)
):
    """Manually add a single new product."""
    new_product = Product(**product_data.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    
    return {
        "success": True,
        "message": f"{new_product.name} başarıyla eklendi.",
        "product_id": new_product.id
    }

@router.post("/products/import")
async def import_products_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Import products from a CSV file."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Lütfen geçerli bir CSV dosyası yükleyin.")
        
    try:
        contents = await file.read()
        decoded_content = contents.decode('utf-8-sig') # Handle BOM if present
        csv_reader = csv.DictReader(io.StringIO(decoded_content))
        
        imported_count = 0
        for row in csv_reader:
            # Flexible key matching for robustness
            keys = list(row.keys())
            def get_val(possible_keys, default=None):
                for pk in possible_keys:
                    for k in keys:
                        if k and pk.lower() in k.lower():
                            return row[k]
                return default
                
            name = get_val(['isim', 'ad', 'name'])
            if not name:
                continue # Skip invalid rows
                
            category = get_val(['kategori', 'category'], "Genel")
            price = float(get_val(['fiyat', 'price', 'ücret'], 0.0))
            quantity = int(get_val(['stok', 'miktar', 'quantity', 'adet'], 0))
            unit = get_val(['birim', 'unit'], "Adet")
            threshold = int(get_val(['kritik', 'eşik', 'threshold', 'low'], 20))
            
            product = Product(
                name=name,
                category=category,
                unit_price=price,
                stock_quantity=quantity,
                stock_unit=unit,
                low_stock_threshold=threshold
            )
            db.add(product)
            imported_count += 1
            
        db.commit()
        
        return {
            "success": True,
            "message": f"{imported_count} ürün başarıyla içe aktarıldı."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"İçe aktarma sırasında bir hata oluştu: {str(e)}")
