FROM node:20 as builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package.json ./

RUN npm install --only=production

COPY .env .env

EXPOSE 3001

CMD ["node", "dist/main"] 