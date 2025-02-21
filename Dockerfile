# Estágio de construção
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copiar arquivos de dependências
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# 2. Instalar dependências exatas do lockfile
RUN npm ci --legacy-peer-deps

# 3. Copiar todo o código fonte
COPY . .

# 4. Gerar client Prisma e construir
RUN npx prisma generate
RUN npm run build

# Estágio de produção
FROM node:20-alpine

WORKDIR /app

# Configuração de segurança
RUN apk add --no-cache dumb-init
ENV NODE_ENV production

# Copiar arquivos necessários
COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Configurações finais
RUN npx prisma generate && \
    npm prune --omit=dev && \
    chown -R node:node .

EXPOSE 5000
USER node
CMD ["dumb-init", "npm", "start"]