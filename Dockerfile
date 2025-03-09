# Estágio de instalação de dependências
FROM node:18.19.0-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instala as dependências baseado no package-lock.json
COPY package.json package-lock.json ./
RUN npm ci

# Estágio de build
FROM node:18.19.0-alpine AS builder
WORKDIR /app

# Copia as dependências do estágio anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Define variáveis de ambiente para o build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Executa o build
RUN npm run build

# Estágio de produção
FROM node:18.19.0-alpine AS runner
WORKDIR /app

# Define variáveis de ambiente
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Cria um usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia os arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Define o usuário não-root
USER nextjs

# Expõe a porta
EXPOSE 3000

# Define as variáveis de ambiente para o servidor
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Inicia o servidor
CMD ["node", "server.js"] 