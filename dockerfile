# Usar una imagen base oficial de Node.js
FROM node:18

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalar las dependencias necesarias
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    python3-pip \
    chromium \
    chromium-driver \
    fontconfig \
    libnss3 \
    freetype2-demos \
    libfreetype6 \
    libharfbuzz-bin \
    ca-certificates \
    fonts-freefont-ttf \
    git \
    wget

# Instalar dependencias globales
RUN npm install -g typescript pm2

# Instalar dependencias de la aplicación
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Establecer Puppeteer para usar Chromium de la instalación del sistema
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN npm run build
# Comando por defecto para el contenedor
CMD ["npm","run","start"]