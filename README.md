# CheckerWSP - WhatsApp API Integration

Este proyecto proporciona una API para la integración con WhatsApp utilizando whatsapp-web.js, permitiendo la generación de códigos QR para la autenticación y verificación de números de WhatsApp.

## Requisitos Previos

- Node.js (versión recomendada: 14.x o superior)
- npm (normalmente viene con Node.js)
- Un dispositivo móvil con WhatsApp instalado

## Instalación

1. Clona el repositorio:
   ```bash
   git clone [URL-del-repositorio]
   cd checkerwsp
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

## Instalación con Docker

1. Clona el repositorio:
   ```bash
   git clone [URL-del-repositorio]
   cd checkerwsp
   ```

2. Construye y ejecuta con Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Ver logs (opcional):
   ```bash
   docker-compose logs -f
   ```

4. Detener el servicio:
   ```bash
   docker-compose down
   ```

Notas para Docker:
- El servicio se ejecutará en el puerto 3001
- Los datos de la sesión de WhatsApp se persistirán en un volumen Docker
- El contenedor se reiniciará automáticamente en caso de fallo

# WhatsApp Checker

Servicio para verificar números de WhatsApp y gestionar sesiones de WhatsApp Web.

## Características

- Verificación de números de WhatsApp
- Interfaz web para escanear código QR
- Gestión automática de sesiones
- API REST para integración con otros servicios
- Manejo de reconexión automática
- Persistencia de datos en volúmenes Docker

## Requisitos

- Docker instalado en el sistema
- Puerto 3001 disponible
- Conexión a Internet

## Instalación y Uso

### Usando Docker Hub (Recomendado)

La imagen está disponible en Docker Hub: [skarious/checkerwsp](https://hub.docker.com/r/skarious/checkerwsp)

```bash
# Descargar y ejecutar la imagen desde Docker Hub
docker run -d \
  -p 3001:3001 \
  -v whatsapp_auth:/usr/src/app/.wwebjs_auth \
  -v whatsapp_cache:/usr/src/app/.wwebjs_cache \
  --name whatsapp-checker \
  skarious/checkerwsp:latest
```

### Construir desde el código fuente

Si prefieres construir la imagen localmente:

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd checkerwsp

# Construir la imagen
docker build -t whatsapp-checker .

# Ejecutar el contenedor
docker run -d \
  -p 3001:3001 \
  -v whatsapp_auth:/usr/src/app/.wwebjs_auth \
  -v whatsapp_cache:/usr/src/app/.wwebjs_cache \
  --name whatsapp-checker \
  whatsapp-checker
```

## Uso

Una vez que el contenedor esté en ejecución:

1. Accede a `http://localhost:3001/qr` para escanear el código QR
2. Usa la API REST para verificar números:
   - GET `/verify/:number` - Verifica si un número tiene WhatsApp
   - GET `/qr` - Obtiene el estado de la sesión/código QR

## Notas importantes

- La primera vez que se ejecuta, necesitarás escanear un código QR con WhatsApp
- Los datos de la sesión se persistirán en volúmenes Docker
- El contenedor se reiniciará automáticamente en caso de fallo
- Si cierras sesión en WhatsApp Web, el sistema generará automáticamente un nuevo código QR

## Estructura del Proyecto

```
checkerwsp/
├── services/
│   └── whatsapp.js    # Servicio principal de WhatsApp
├── routes/
│   ├── verify.js      # Ruta para verificación de números
│   └── qr.js          # Ruta para gestión de QR y sesión
├── Dockerfile         # Configuración de Docker
├── index.js          # Punto de entrada de la aplicación
└── package.json      # Dependencias y scripts
```

## Desarrollo

Para contribuir o modificar el proyecto:

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Realiza tus cambios
4. Construye la imagen: `docker build -t whatsapp-checker .`
5. Prueba los cambios localmente
6. Si todo funciona, publica tu propia versión:
```bash
docker tag whatsapp-checker tu-usuario/whatsapp-checker:tag
docker push tu-usuario/whatsapp-checker:tag
```

## Configuración

El proyecto utiliza las siguientes dependencias principales:
- express: ^4.21.2
- qrcode: ^1.5.4
- whatsapp-web.js: ^1.26.0

## Uso

1. Inicia el servidor:
   ```bash
   node index.js
   ```

2. El servidor se iniciará en:
   - Puerto: 3001
   - URL: http://0.0.0.0:3001

3. Acceso al código QR:
   - Abre en tu navegador: `http://<tu-ip>:3001/qr`
   - Reemplaza `<tu-ip>` con la IP de tu computadora en la red local

4. Conexión con WhatsApp:
   - Abre WhatsApp en tu teléfono móvil
   - Ve a Configuración > WhatsApp Web
   - Escanea el código QR mostrado en tu navegador

5. Verificación de números:
   - Una vez conectado, puedes verificar números usando: `http://<tu-ip>:3001/verify/NUMERO`
   - Reemplaza NUMERO con el número a verificar (incluye código de país)

## Endpoints

- `/qr`: Genera y muestra el código QR para la autenticación
- `/verify/:number`: Verifica si un número de teléfono tiene WhatsApp. Reemplaza `:number` con el número a verificar (formato: código de país + número, sin '+' ni espacios)

## Ejemplos de Uso con CURL

### Obtener Código QR
```bash
# Obtener el código QR en formato HTML
curl http://<tu-ip>:3001/qr
```

### Verificar Número de WhatsApp
```bash
# Verificar si un número tiene WhatsApp (ejemplo con número argentino)
curl http://<tu-ip>:3001/verify/5491112345678

# Respuesta ejemplo (si tiene WhatsApp):
# {
#   "success": true,
#   "message": "El número tiene WhatsApp."
# }

# Respuesta ejemplo (si no tiene WhatsApp):
# {
#   "success": true,
#   "message": "El número no tiene WhatsApp."
# }

# Respuesta si no hay sesión activa:
# {
#   "success": false,
#   "message": "No hay una sesión activa en este momento. Escanea el código QR para iniciar sesión."
# }
```

Notas importantes:
- El número debe incluir el código de país (ej: 54 para Argentina)
- No incluir el símbolo '+' ni espacios en el número
- Asegúrate de tener una sesión activa (haber escaneado el QR) antes de verificar números

## Solución de Problemas

1. Si el código QR no se muestra:
   - Verifica que el servidor esté corriendo
   - Asegúrate de usar la IP correcta
   - Comprueba tu conexión a internet

2. Si la conexión se pierde:
   - Reinicia el servidor
   - Vuelve a escanear el código QR

## Mantenimiento

- El servidor debe mantenerse en ejecución para mantener la conexión activa
- Si el proceso se detiene, necesitarás volver a iniciar el servidor y escanear el QR

## Seguridad

- No compartas los códigos QR generados
- Mantén tu sesión de WhatsApp Web cerrada cuando no la uses
- Evita exponer el servidor directamente a internet sin las medidas de seguridad adecuadas

## Contribuir

1. Haz un Fork del proyecto
2. Crea una rama para tu función (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia Creative Commons Attribution 4.0 International (CC BY 4.0). Esto significa que:

- Eres libre de:
  - Compartir — copiar y redistribuir el material en cualquier medio o formato
  - Adaptar — remezclar, transformar y construir a partir del material para cualquier propósito, incluso comercialmente

- Bajo los siguientes términos:
  - Atribución — Debes dar crédito de manera adecuada, brindar un enlace a la licencia, e indicar si se han realizado cambios. Puede hacerlo en cualquier forma razonable, pero no de forma tal que sugiera que usted o su uso tienen el apoyo del licenciante.

Para más información sobre esta licencia, visita: [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)
