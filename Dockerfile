# Dockerfile - Frontend
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar el package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --force

# Copiar todo el código del frontend
COPY . .

# Construir la aplicación (generar la carpeta dist/)
RUN npm run build

# Servir contenido estático con un servidor ligero
RUN npm install -g serve
EXPOSE 3000
CMD [ "serve", "-s", "dist", "-l", "3000" ]