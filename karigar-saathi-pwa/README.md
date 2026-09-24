# Karigar Saathi

A deployable full-stack AI virtual business manager for artisans and micro entrepreneurs.

## Run locally

Install and run the application

```bash
pip install -r requirements.txt
python -m uvicorn server:app --host 0.0.0.0 --port 8000
```

Then open `http://localhost:8000`.

Docker is also supported

```bash
docker build -t karigar-saathi .
docker run --rm -p 8000:8000 -v karigar-data:/app/data karigar-saathi
```

## Included

- Responsive Hindi-first UI
- Product catalogue with search and filters
- Guided three-step AI product listing flow backed by REST APIs
- Real image upload, validation, resizing and enhancement with Pillow
- Server-generated bilingual catalogue copy and pricing guidance
- SQLite product, inventory and order persistence
- Working order status and product price APIs
- Sales insights and downloadable CSV report
- LocalStorage offline fallback
- Offline service worker and installable web app manifest
- Keyboard and reduced-motion accessibility support
- API health endpoint, interactive API documentation, validation, rate limiting and security headers

## Production integration points

The core application works without external services. Live ONDC, Government e-Marketplace, payment and logistics publishing require organisation credentials and their approved production APIs. Those credentials should be configured server-side and never exposed in browser code.
