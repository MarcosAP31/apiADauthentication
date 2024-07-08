# Usa la imagen base de Node.js
FROM node:20

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos de package.json y package-lock.json
COPY package*.json ./

# Limpia el caché de npm e instala las dependencias del proyecto
RUN npm cache clean --force && npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Expone el puerto en el que correrá la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "build/index.js"]