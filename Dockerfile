FROM python:3.12.4-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

ENV HF_HOME=/app/cache
RUN mkdir -p $HF_HOME

RUN python3 -c "from transformers import pipeline; pipeline('image-segmentation', model='briaai/RMBG-1.4', trust_remote_code=True)"

COPY . .

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
