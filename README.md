# KU Connect API

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## Run with Docker

```sh
docker build -t ku-connect-api .
```

```sh
docker run -p 4000:4000 --name ku-connect-api \
-e DATABASE_URL='db' \
-e JWT_SECRET='secret' \
-e FRONTEND_URL='http://localhost:3000' \
-e NOMIC_API_KEY='key' \
ku-connect-api
```

This project was created using `bun init` in bun v1.1.34. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
