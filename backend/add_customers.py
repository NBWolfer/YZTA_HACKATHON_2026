from app.database import SessionLocal
from app.models import Customer
from datetime import datetime

def add_new_customers():
    db = SessionLocal()
    
    new_customers = [
        Customer(
            name="Ali Can Yılmaz",
            phone="905347006755",
            email="ali.can@example.com",
            city="İstanbul",
            created_at=datetime.utcnow()
        ),
        Customer(
            name="Ayşe Kaya",
            phone="167182256349303",
            email="ayse.kaya@example.com",
            city="Ankara",
            created_at=datetime.utcnow()
        ),
        Customer(
            name="Fatma Demir",
            phone="905317938209",
            email="fatma.demir@example.com",
            city="İzmir",
            created_at=datetime.utcnow()
        )
    ]
    
    try:
        for c in new_customers:
            db.add(c)
        db.commit()
        print(f"Successfully added {len(new_customers)} customers.")
    except Exception as e:
        db.rollback()
        print(f"Error adding customers: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    add_new_customers()
