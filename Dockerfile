# Build com Node, entrega com nginx: o resultado do Angular é arquivo estático,
# então a imagem final não precisa de Node nenhum (~20 MB em vez de ~1 GB).
FROM node:22-alpine AS build
WORKDIR /origem

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /origem/dist/school-app/browser /usr/share/nginx/html

EXPOSE 80
