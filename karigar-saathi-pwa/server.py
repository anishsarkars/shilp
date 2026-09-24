from __future__ import annotations

import base64
import csv
import io
import json
import sqlite3
import threading
import time
import uuid
from collections import defaultdict, deque
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse, Response
from PIL import Image, ImageEnhance, ImageFilter, ImageOps, UnidentifiedImageError
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
DATABASE_PATH = DATA_DIR / "karigar_saathi.db"
MAX_IMAGE_BYTES = 6 * 1024 * 1024

DATA_DIR.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(exist_ok=True)

database_lock = threading.Lock()
request_windows: dict[str, deque[float]] = defaultdict(deque)


def database_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA journal_mode=WAL")
    connection.execute("PRAGMA foreign_keys=ON")
    return connection


def product_svg(emoji: str, background: str, accent: str) -> str:
    svg_markup = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450">'
        f'<rect width="600" height="450" fill="{background}"/>'
        f'<circle cx="505" cy="70" r="115" fill="{accent}" opacity=".18"/>'
        f'<circle cx="70" cy="390" r="135" fill="{accent}" opacity=".12"/>'
        f'<text x="300" y="275" text-anchor="middle" font-size="180">{emoji}</text>'
        f'<path d="M100 355 Q300 290 500 355" fill="none" stroke="{accent}" stroke-width="8" opacity=".28"/>'
        "</svg>"
    )
    encoded_svg = base64.b64encode(svg_markup.encode("utf-8")).decode("ascii")
    return f"data:image/svg+xml;base64,{encoded_svg}"


SEED_PRODUCTS = [
    (1, "मधुबनी मछली पेंटिंग", "पेंटिंग", 1299, 8, "live", 142, product_svg("🖼️", "#f7e7d7", "#c7634d"), "हाथ से बनी पारंपरिक मधुबनी पेंटिंग, प्राकृतिक रंगों के साथ।"),
    (2, "बांस की सजावटी टोकरी", "घर सजावट", 849, 3, "live", 98, product_svg("🧺", "#efe5ca", "#a4762c"), "स्थानीय बांस से बुनी हुई मजबूत और सुंदर टोकरी।"),
    (3, "हाथ बुना सूती दुपट्टा", "वस्त्र", 1099, 14, "live", 76, product_svg("🧣", "#e7d8e9", "#8d4e91"), "नरम सूती धागे से हाथ करघे पर बुना दुपट्टा।"),
    (4, "टेराकोटा दीया सेट", "हस्तकला", 399, 20, "draft", 35, product_svg("🪔", "#f2dfcf", "#bd6d39"), "कारीगरों द्वारा हाथ से आकार और रंग दिया गया दीया सेट।"),
]

SEED_ORDERS = [
    ("KS-1048", "अंजलि शर्मा", "जयपुर, राजस्थान", "मधुबनी मछली पेंटिंग", 1299, "new", "🖼️"),
    ("KS-1047", "राहुल वर्मा", "पुणे, महाराष्ट्र", "बांस की सजावटी टोकरी · 2", 1698, "new", "🧺"),
    ("KS-1046", "स्मिता नायर", "कोच्चि, केरल", "हाथ बुना सूती दुपट्टा", 1099, "packed", "🧣"),
    ("KS-1042", "नवीन सिंह", "दिल्ली", "टेराकोटा दीया सेट · 2", 798, "sent", "🪔"),
]


def initialise_database(reset: bool = False) -> None:
    with database_lock, database_connection() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                price INTEGER NOT NULL CHECK(price > 0),
                stock INTEGER NOT NULL CHECK(stock >= 0),
                status TEXT NOT NULL CHECK(status IN ('live', 'draft')),
                views INTEGER NOT NULL DEFAULT 0,
                image TEXT NOT NULL,
                description TEXT NOT NULL,
                english_description TEXT NOT NULL DEFAULT '',
                channels TEXT NOT NULL DEFAULT '[]',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                customer TEXT NOT NULL,
                city TEXT NOT NULL,
                item TEXT NOT NULL,
                amount INTEGER NOT NULL CHECK(amount > 0),
                status TEXT NOT NULL CHECK(status IN ('new', 'packed', 'sent')),
                icon TEXT NOT NULL
            );
            """
        )
        if reset:
            connection.execute("DELETE FROM products")
            connection.execute("DELETE FROM orders")
        product_count = connection.execute("SELECT COUNT(*) FROM products").fetchone()[0]
        order_count = connection.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
        if product_count == 0:
            connection.executemany(
                "INSERT INTO products (id,name,category,price,stock,status,views,image,description) VALUES (?,?,?,?,?,?,?,?,?)",
                SEED_PRODUCTS,
            )
        if order_count == 0:
            connection.executemany(
                "INSERT INTO orders (id,customer,city,item,amount,status,icon) VALUES (?,?,?,?,?,?,?)",
                SEED_ORDERS,
            )
        connection.commit()


def row_to_dict(row: sqlite3.Row) -> dict:
    result = dict(row)
    if "channels" in result:
        result["channels"] = json.loads(result["channels"] or "[]")
    return result


def recommended_price(category: str, details: str) -> int:
    category_prices = {
        "पेंटिंग": 1199,
        "Painting": 1199,
        "वस्त्र": 999,
        "Textiles": 999,
        "घर सजावट": 799,
        "Home décor": 799,
        "आभूषण": 699,
        "Jewellery": 699,
        "हस्तकला": 599,
        "Handicraft": 599,
    }
    base_price = category_prices.get(category, 699)
    return round((base_price + min(len(details) * 3, 180)) / 50) * 50 - 1


def decode_and_enhance_image(data_url: str | None) -> str | None:
    if not data_url or not data_url.startswith("data:image/"):
        return data_url
    if data_url.startswith("data:image/svg+xml"):
        return product_svg("🎨", "#e7eee9", "#317f73")
    try:
        header, encoded_content = data_url.split(",", 1)
        raw_image = base64.b64decode(encoded_content, validate=True)
        if len(raw_image) > MAX_IMAGE_BYTES:
            raise HTTPException(status_code=413, detail="Image must be smaller than 6 MB")
        source_image = Image.open(io.BytesIO(raw_image))
        source_image.verify()
        source_image = Image.open(io.BytesIO(raw_image)).convert("RGB")
        source_image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        enhanced_image = ImageOps.autocontrast(source_image, cutoff=1)
        enhanced_image = ImageEnhance.Color(enhanced_image).enhance(1.08)
        enhanced_image = ImageEnhance.Contrast(enhanced_image).enhance(1.08)
        enhanced_image = enhanced_image.filter(ImageFilter.UnsharpMask(radius=1.2, percent=110, threshold=3))
        image_name = f"{uuid.uuid4().hex}.webp"
        output_path = UPLOAD_DIR / image_name
        enhanced_image.save(output_path, "WEBP", quality=88, method=6)
        return f"/uploads/{image_name}"
    except (ValueError, base64.binascii.Error, UnidentifiedImageError, OSError) as error:
        raise HTTPException(status_code=400, detail="Invalid image") from error


class AIRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    category: str = Field(min_length=2, max_length=40)
    details: str = Field(default="", max_length=1000)
    image: str | None = Field(default=None, max_length=9_000_000)


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    category: str = Field(min_length=2, max_length=40)
    price: int = Field(gt=0, le=10_000_000)
    stock: int = Field(ge=0, le=999_999)
    status: Literal["live", "draft"] = "live"
    image: str = Field(min_length=1, max_length=9_000_000)
    description: str = Field(min_length=1, max_length=3000)
    english_description: str = Field(default="", max_length=3000)
    channels: list[str] = Field(default_factory=list, max_length=10)


class PriceUpdate(BaseModel):
    price: int = Field(gt=0, le=10_000_000)


class OrderUpdate(BaseModel):
    status: Literal["new", "packed", "sent"]


app = FastAPI(title="Karigar Saathi API", version="1.0.0", docs_url="/api/docs", redoc_url=None)


@app.middleware("http")
async def security_and_rate_limit(request: Request, call_next):
    client_address = request.client.host if request.client else "unknown"
    current_seconds = time.monotonic()
    request_window = request_windows[client_address]
    while request_window and current_seconds - request_window[0] > 60:
        request_window.popleft()
    if len(request_window) >= 180:
        return JSONResponse({"detail": "Too many requests"}, status_code=429)
    request_window.append(current_seconds)
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(self), microphone=(self), geolocation=()"
    return response


@app.on_event("startup")
def startup_event() -> None:
    initialise_database()


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "service": "karigar-saathi"}


@app.get("/api/bootstrap")
def bootstrap() -> dict:
    with database_connection() as connection:
        products = [row_to_dict(row) for row in connection.execute("SELECT * FROM products ORDER BY id DESC")]
        orders = [row_to_dict(row) for row in connection.execute("SELECT * FROM orders ORDER BY id DESC")]
    live_products = sum(product["status"] == "live" for product in products)
    new_orders = sum(order["status"] == "new" for order in orders)
    return {
        "products": products,
        "orders": orders,
        "stats": {"active_products": live_products, "new_orders": new_orders, "monthly_sales": 18450},
    }


@app.post("/api/ai/process")
def process_product(request_body: AIRequest) -> dict:
    enhanced_image = decode_and_enhance_image(request_body.image)
    price = recommended_price(request_body.category, request_body.details)
    hindi_description = (
        f"{request_body.name} एक सुंदर, हाथ से बनाया गया {request_body.category} उत्पाद है। "
        f"{request_body.details or 'इसे पारंपरिक कौशल और ध्यान से तैयार किया गया है।'} "
        "हर वस्तु अपने आप में अनोखी है और स्थानीय कारीगरी की कहानी बताती है।"
    )
    english_description = (
        f"{request_body.name} is a carefully handcrafted {request_body.category.lower()} product. "
        "It is made using traditional skills, quality materials, and close attention to detail. "
        "Every piece is unique and supports local craftsmanship."
    )
    return {
        "enhanced_image": enhanced_image or request_body.image,
        "hindi_description": hindi_description,
        "english_description": english_description,
        "recommended_price": price,
        "price_range": {"minimum": max(1, price - 100), "maximum": price + 200},
    }


@app.post("/api/products", status_code=201)
def create_product(product: ProductCreate) -> dict:
    image_path = decode_and_enhance_image(product.image) if product.image.startswith("data:image/") else product.image
    product_id = int(time.time() * 1000)
    with database_lock, database_connection() as connection:
        connection.execute(
            """
            INSERT INTO products
            (id,name,category,price,stock,status,views,image,description,english_description,channels)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                product_id,
                product.name.strip(),
                product.category.strip(),
                product.price,
                product.stock,
                product.status,
                0,
                image_path,
                product.description.strip(),
                product.english_description.strip(),
                json.dumps(product.channels, ensure_ascii=False),
            ),
        )
        connection.commit()
        created = connection.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    return row_to_dict(created)


@app.patch("/api/products/{product_id}/price")
def update_product_price(product_id: int, update: PriceUpdate) -> dict:
    with database_lock, database_connection() as connection:
        cursor = connection.execute("UPDATE products SET price = ? WHERE id = ?", (update.price, product_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        connection.commit()
        product = connection.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    return row_to_dict(product)


@app.patch("/api/orders/{order_id}")
def update_order(order_id: str, update: OrderUpdate) -> dict:
    with database_lock, database_connection() as connection:
        cursor = connection.execute("UPDATE orders SET status = ? WHERE id = ?", (update.status, order_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        connection.commit()
        order = connection.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    return row_to_dict(order)


@app.post("/api/reset")
def reset_demo() -> dict:
    initialise_database(reset=True)
    return {"status": "reset"}


@app.get("/api/report.csv")
def download_report() -> Response:
    report_stream = io.StringIO()
    writer = csv.writer(report_stream)
    writer.writerow(["Month", "Sales", "Orders"])
    writer.writerow(["September", 18450, 23])
    writer.writerow(["August", 16470, 20])
    return Response(
        content=report_stream.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="karigar-saathi-report.csv"'},
    )


@app.get("/uploads/{image_name}")
def uploaded_image(image_name: str):
    safe_name = Path(image_name).name
    image_path = UPLOAD_DIR / safe_name
    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(image_path)


@app.get("/", include_in_schema=False)
def frontend_index():
    return FileResponse(BASE_DIR / "index.html")


@app.get("/{asset_name}", include_in_schema=False)
def frontend_asset(asset_name: str):
    allowed_assets = {
        "index.html",
        "styles.css",
        "app.js",
        "manifest.webmanifest",
        "sw.js",
        "icon-192.png",
        "icon-512.png",
    }
    if asset_name not in allowed_assets:
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(BASE_DIR / asset_name)
