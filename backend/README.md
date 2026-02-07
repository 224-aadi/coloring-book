# Line Art Converter API

High-quality image to line art conversion using Python OpenCV.

## Local Development

1. Create a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Health check
- `GET /health` - Health check for monitoring
- `POST /convert` - Convert image to line art

### POST /convert

Request body:
```json
{
  "image": "data:image/jpeg;base64,...",
  "threshold": 50,
  "blur_passes": 1,
  "thickness": 1,
  "max_dim": 1200
}
```

Response:
```json
{
  "image": "data:image/png;base64,...",
  "width": 800,
  "height": 600
}
```

## Deploy to Render (Recommended)

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `lineart-api` (or any name)
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
5. Click **"Create Web Service"**

After deployment:
- Copy your Render URL (e.g., `https://lineart-api.onrender.com`)
- Add it to your Vercel project as `NEXT_PUBLIC_LINEART_API_URL`

**Note**: Render free tier spins down after 15 min of inactivity. First request after sleep takes ~30-60 seconds.

## Deploy to Railway (Alternative)

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select this repository
4. Set the root directory to `backend`
5. Railway will auto-detect the Dockerfile and deploy

## Docker (Local)

```bash
docker build -t lineart-api .
docker run -p 8000:8000 lineart-api
```
