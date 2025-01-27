FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY . .

COPY requirements.txt .
RUN pip install -r requirements.txt
RUN pip install -r requirements_gpu.txt

RUN pip install -e .

CMD ["python", "run.py"]

