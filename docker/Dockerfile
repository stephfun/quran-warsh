# Quran Warsh App - Container
# React Native Web App

FROM python:3.11-slim

WORKDIR /app

# Copier le build React Native Web (index.html + assets/)
COPY index.html /app/
COPY assets/ /app/assets/

# Port
EXPOSE 5006

# Serveur HTTP simple
CMD ["python3", "-m", "http.server", "5006", "--bind", "0.0.0.0"]
