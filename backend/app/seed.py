"""Seed the database with realistic Turkish SME data (cooperative scenario)."""

from datetime import datetime, timedelta
import random

from app.models import (
    Product, Customer, Order, OrderItem, CargoTracking,
    OrderStatus, CargoProvider,
)


def seed_all(db):
    # ── Products (50 items — Turkish food, cosmetics, handicraft cooperative) ──
    products_data = [
        ("Lavanta Sabunu", "Kozmetik", 12.50, 450, "Adet", 50),
        ("Organik Zeytinyağı (1L)", "Gıda", 185.00, 12, "Adet", 20),
        ("Gül Suyu (250ml)", "Kozmetik", 45.00, 0, "Adet", 15),
        ("El Dokuma Kilim (60x90)", "El Sanatları", 1250.00, 8, "Adet", 5),
        ("Organik Çiçek Balı (500g)", "Gıda", 320.00, 85, "Adet", 30),
        ("Keçi Sütü Sabunu", "Kozmetik", 18.00, 320, "Adet", 50),
        ("Kurutulmuş Domates (250g)", "Gıda", 65.00, 150, "Adet", 40),
        ("Lavanta Yağı (50ml)", "Kozmetik", 95.00, 60, "Adet", 20),
        ("Seramik Kase (El Yapımı)", "El Sanatları", 180.00, 25, "Adet", 10),
        ("Tulum Peyniri (500g)", "Gıda", 210.00, 40, "Adet", 15),
        ("Doğal Sünger", "Kozmetik", 35.00, 200, "Adet", 30),
        ("Bergamot Reçeli (380g)", "Gıda", 85.00, 95, "Adet", 25),
        ("Ahşap Kesme Tahtası", "El Sanatları", 145.00, 30, "Adet", 10),
        ("Kekik Suyu (500ml)", "Gıda", 42.00, 180, "Adet", 40),
        ("El Örgüsü Çorap", "El Sanatları", 75.00, 110, "Adet", 20),
        ("Nar Ekşisi (330ml)", "Gıda", 55.00, 220, "Adet", 50),
        ("Balmumu Mum (Set 3)", "El Sanatları", 120.00, 45, "Adet", 15),
        ("Karakovan Balı (1kg)", "Gıda", 650.00, 18, "Adet", 10),
        ("Ardıç Katranı Sabunu", "Kozmetik", 22.00, 280, "Adet", 40),
        ("Antep Fıstığı (500g)", "Gıda", 380.00, 65, "Adet", 20),
        ("Seramik Tabak (25cm)", "El Sanatları", 220.00, 15, "Adet", 8),
        ("Sumak (250g)", "Gıda", 35.00, 300, "Adet", 50),
        ("Doğal Lif Kesesi", "Kozmetik", 28.00, 190, "Adet", 30),
        ("Çam Balı (500g)", "Gıda", 290.00, 55, "Adet", 20),
        ("Bakır Cezve", "El Sanatları", 350.00, 20, "Adet", 8),
        ("Defne Sabunu", "Kozmetik", 25.00, 400, "Adet", 60),
        ("Kurutulmuş İncir (500g)", "Gıda", 120.00, 130, "Adet", 30),
        ("El Boyaması Bardak", "El Sanatları", 95.00, 35, "Adet", 10),
        ("Ihlamur (100g)", "Gıda", 48.00, 250, "Adet", 40),
        ("Argan Yağı (50ml)", "Kozmetik", 110.00, 70, "Adet", 20),
        ("Pekmez (700ml)", "Gıda", 75.00, 160, "Adet", 35),
        ("Seramik Vazo", "El Sanatları", 280.00, 12, "Adet", 5),
        ("Tarçın (Tüp 100g)", "Gıda", 30.00, 340, "Adet", 50),
        ("Gül Sabunu", "Kozmetik", 15.00, 500, "Adet", 60),
        ("Çörek Otu Yağı (100ml)", "Gıda", 88.00, 90, "Adet", 25),
        ("Oymalı Ahşap Kaşık Set", "El Sanatları", 160.00, 22, "Adet", 8),
        ("Kuru Kayısı (500g)", "Gıda", 95.00, 175, "Adet", 40),
        ("Kantaron Yağı (100ml)", "Kozmetik", 72.00, 80, "Adet", 20),
        ("Tahin (300g)", "Gıda", 58.00, 210, "Adet", 45),
        ("Hasır Sepet (Orta)", "El Sanatları", 195.00, 18, "Adet", 8),
        ("Organik Ceviz (500g)", "Gıda", 240.00, 50, "Adet", 15),
        ("Kükürt Sabunu", "Kozmetik", 20.00, 350, "Adet", 50),
        ("Dut Pekmezi (500ml)", "Gıda", 68.00, 140, "Adet", 30),
        ("Seramik Çaydanlık", "El Sanatları", 420.00, 7, "Adet", 5),
        ("Zencefil Tozu (100g)", "Gıda", 38.00, 270, "Adet", 40),
        ("Doğal Taş Bileklik", "El Sanatları", 65.00, 90, "Adet", 20),
        ("Salep (200g)", "Gıda", 195.00, 35, "Adet", 10),
        ("Badem Yağı (100ml)", "Kozmetik", 85.00, 100, "Adet", 25),
        ("Pul Biber (250g)", "Gıda", 45.00, 290, "Adet", 50),
        ("İpek Fular", "El Sanatları", 380.00, 14, "Adet", 5),
    ]

    products = []
    for name, cat, price, stock, unit, threshold in products_data:
        p = Product(
            name=name, category=cat, unit_price=price,
            stock_quantity=stock, stock_unit=unit,
            low_stock_threshold=threshold,
        )
        db.add(p)
        products.append(p)
    db.flush()

    # ── Customers (80 profiles — Turkish names and cities) ──
    first_names = [
        "Ayşe", "Mehmet", "Fatma", "Ali", "Zeynep", "Mustafa", "Elif", "Ahmet",
        "Emine", "Hasan", "Merve", "Hüseyin", "Hatice", "İbrahim", "Esra",
        "Ömer", "Selin", "Yusuf", "Büşra", "Kemal", "Derya", "Emre", "Gizem",
        "Burak", "Nazlı", "Cem", "Aslı", "Tolga", "İrem", "Serkan", "Pınar",
        "Onur", "Damla", "Ufuk", "Ceren", "Volkan", "Melis", "Berk", "Deniz",
        "Kaan",
    ]
    last_names = [
        "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Öztürk", "Aydın",
        "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara",
        "Koç", "Kurt", "Özkan", "Yıldırım", "Erdoğan", "Polat",
    ]
    cities = [
        "İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Adana",
        "Konya", "Gaziantep", "Mersin", "Eskişehir", "Trabzon", "Samsun",
        "Denizli", "Muğla", "Aydın", "Hatay",
    ]

    customers = []
    used_names = set()
    while len(customers) < 80:
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        full = f"{fn} {ln}"
        if full in used_names:
            continue
        used_names.add(full)
        c = Customer(
            name=full,
            phone=f"+90 5{random.randint(30,59):02d} {random.randint(100,999)} {random.randint(10,99)} {random.randint(10,99)}",
            email=f"{fn.lower().replace('ı','i').replace('ö','o').replace('ü','u').replace('ş','s').replace('ç','c').replace('ğ','g').replace('İ','i')}.{ln.lower().replace('ı','i').replace('ö','o').replace('ü','u').replace('ş','s').replace('ç','c').replace('ğ','g')}@email.com",
            city=random.choice(cities),
        )
        db.add(c)
        customers.append(c)
    db.flush()

    # ── Orders (200 historical + 15 active today) ──
    now = datetime.utcnow()
    statuses_historical = [
        OrderStatus.TESLIM_EDILDI, OrderStatus.TESLIM_EDILDI,
        OrderStatus.TESLIM_EDILDI, OrderStatus.IPTAL,
    ]
    statuses_active = [
        OrderStatus.HAZIRLANIYOR, OrderStatus.KARGOYA_VERILDI,
        OrderStatus.YOLDA,
    ]

    cargo_providers = list(CargoProvider)
    orders = []

    # Historical orders (past 90 days)
    for i in range(200):
        days_ago = random.randint(1, 90)
        order_date = now - timedelta(days=days_ago)
        cust = random.choice(customers)
        status = random.choice(statuses_historical)

        order = Order(
            customer_id=cust.id,
            status=status,
            created_at=order_date,
            updated_at=order_date + timedelta(days=random.randint(1, 5)),
        )
        db.add(order)
        db.flush()

        # 1-4 items per order
        num_items = random.randint(1, 4)
        total = 0.0
        chosen_products = random.sample(products, min(num_items, len(products)))
        for prod in chosen_products:
            qty = random.randint(1, 5)
            item = OrderItem(
                order_id=order.id,
                product_id=prod.id,
                quantity=qty,
                unit_price=prod.unit_price,
            )
            db.add(item)
            total += prod.unit_price * qty

        order.total_amount = round(total, 2)

        # Add cargo tracking for shipped/delivered orders
        if status in (OrderStatus.KARGOYA_VERILDI, OrderStatus.YOLDA, OrderStatus.TESLIM_EDILDI):
            provider = random.choice(cargo_providers)
            cargo = CargoTracking(
                order_id=order.id,
                provider=provider,
                tracking_number=f"TR-{random.randint(100000000, 999999999)}",
                status="Teslim Edildi" if status == OrderStatus.TESLIM_EDILDI else "Yolda",
                estimated_delivery=(order_date + timedelta(days=random.randint(2, 5))).strftime("%d/%m/%Y"),
            )
            db.add(cargo)

        orders.append(order)

    # Active today orders (15)
    for i in range(15):
        hours_ago = random.randint(0, 18)
        order_date = now - timedelta(hours=hours_ago)
        cust = random.choice(customers)
        status = random.choice(statuses_active)

        order = Order(
            customer_id=cust.id,
            status=status,
            created_at=order_date,
            updated_at=order_date,
        )
        db.add(order)
        db.flush()

        num_items = random.randint(1, 3)
        total = 0.0
        chosen_products = random.sample(products, min(num_items, len(products)))
        for prod in chosen_products:
            qty = random.randint(1, 3)
            item = OrderItem(
                order_id=order.id,
                product_id=prod.id,
                quantity=qty,
                unit_price=prod.unit_price,
            )
            db.add(item)
            total += prod.unit_price * qty

        order.total_amount = round(total, 2)

        if status in (OrderStatus.KARGOYA_VERILDI, OrderStatus.YOLDA):
            provider = random.choice(cargo_providers)
            cargo = CargoTracking(
                order_id=order.id,
                provider=provider,
                tracking_number=f"TR-{random.randint(100000000, 999999999)}",
                status="Transfer Merkezinde" if status == OrderStatus.KARGOYA_VERILDI else "Kurye Dağıtımda",
                estimated_delivery=(now + timedelta(days=random.randint(1, 3))).strftime("%d/%m/%Y"),
            )
            db.add(cargo)

        orders.append(order)

    db.commit()
    print(f"Seeded: {len(products)} products, {len(customers)} customers, {len(orders)} orders")
