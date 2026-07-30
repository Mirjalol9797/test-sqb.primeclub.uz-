# async-front-admin

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
bun install
```

### Compile and Hot-Reload for Development

```sh
bun run dev
```

### Compile and Minify for Production

```sh
bun run build
```

## Environment Variables

```sh
# Main API
VITE_BASE_URL="https://main.primeclub.uz/api/"

# Chat API (Widget) - OpenAPI 3.0 compliant
VITE_CHAT_API_BASE_URL="https://chat.primeclub.uz/api/widget"

# WebSocket Configuration 
VITE_REVERB_HOST="chat.primeclub.uz"
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME="https"
VITE_REVERB_APP_KEY="py5nytjgmzmaiugw50ti"
```

## Chat Widget API Endpoints

The chat widget uses the following API endpoints according to OpenAPI 3.0 specification:

- `POST /api/widget/login` - Authenticate user
- `GET /api/widget/session` - Get existing session
- `POST /api/widget/session` - Create new session
- `POST /api/widget/message` - Send message
- `GET /api/widget/messages/{session_id}` - Get messages
- `GET /api/widget/config` - Get widget configuration
