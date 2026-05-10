from app.database import SessionLocal
from app.models import Product

db = SessionLocal()

# İlk ürünü bul
product = db.query(Product).first()

if product:
    # Stoğu düşük seviyeye (örneğin 5) çek
    product.stock_quantity = 5
    db.commit()
    print(f"'{product.name}' ürününün stoğu test için 5'e düşürüldü.")
else:
    print("Veritabanında ürün bulunamadı.")

db.close()
