FROM node:20-alpine
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy server application
COPY server/ ./server/

# Copy client dist assets for unified hosting if needed
COPY client/dist/ ./client/dist/

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["node", "server/src/index.js"]
