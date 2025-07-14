import io
import os
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import StreamingResponse, HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
from transformers import pipeline
import uvicorn

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

print("Loading model, please wait...")
rm_pipeline = pipeline("image-segmentation", model="briaai/RMBG-1.4", trust_remote_code=True)
print("Model loaded.")

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    root_path = request.scope.get("root_path", "")
    with open("static/index.html", "r", encoding="utf-8") as f:
        html = f.read()

    html = html.replace('src="/static/', f'src="{root_path}/static/')
    html = html.replace('href="/static/', f'href="{root_path}/static/')
    return HTMLResponse(content=html)

@app.post("/remove-bg")
async def remove_bg(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        mask = rm_pipeline(image)
        
        print('Mask type:', type(mask))
        print('Mask mode:', mask.mode if hasattr(mask, 'mode') else 'No mode')
        print('Mask size:', mask.size if hasattr(mask, 'size') else 'No size attr')

        if mask.size != image.size:
            mask = mask.resize(image.size, Image.LANCZOS)

        if mask.mode == 'RGBA':
            result_image = mask
        elif mask.mode == 'RGB':
            alpha = mask.convert('L')
            result_image = image.convert('RGBA')
            result_image.putalpha(alpha)
        else:
            alpha = mask.convert('L') if mask.mode != 'L' else mask
            result_image = image.convert('RGBA')
            result_image.putalpha(alpha)

        buf = io.BytesIO()
        result_image.save(buf, format="PNG")
        buf.seek(0)

        return StreamingResponse(buf, media_type="image/png")
    except Exception as e:
        print(f"Error processing image:", e)
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    