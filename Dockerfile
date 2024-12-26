# Usar una imagen base que ya incluye Puppeteer y sus dependencias
FROM ghcr.io/puppeteer/puppeteer:latest

# Crear directorio de la aplicación
WORKDIR /usr/src/app

# Cambiar al usuario root para la instalación
USER root

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias y limpiar caché
RUN npm install && \
    npm cache clean --force

# Copiar el resto del código fuente
COPY . .

# Crear y configurar el directorio para los datos de WhatsApp
RUN mkdir -p .wwebjs_auth .wwebjs_cache && \
    chown -R pptruser:pptruser .wwebjs_auth .wwebjs_cache

# Volver al usuario no privilegiado
USER pptruser

# Exponer el puerto que usa la aplicación
EXPOSE 3001

# Comando para ejecutar la aplicación
CMD ["node", "index.js"]
