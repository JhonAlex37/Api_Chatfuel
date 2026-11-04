FROM oven/bun:1
WORKDIR /app
COPY --chown=bun:bun package.json ./
COPY --chown=bun:bun src ./src
ENV NODE_ENV=production
ENV PORT=3000
USER bun
EXPOSE 3000
CMD ["bun", "src/connector.mjs"]
