# initStarterKit

starter-kit version

- Vue3 Vite
- TypeScript
- element-plus UI
- initCraft Dev Tool(low-code)
- 70 widget/input
- Full implement Create Form, UI, SQL, API, Report, App, export/import/restore on online
- Fully customizable
- Two-Factor
- Google OAuth2

Use with https://github.com/appxq/init-server-sdk

## Install

```
cd init-starter-kit
npm i
```

## Update Render Form

```
npm install sd-render@latest
```

## Config file site-config.js

```
const SERVER_HOST = 'http://localhost:3009';
const API_PATH = '/api';
const ASSETS_PATH = '/assets';
const API_URL = SERVER_HOST + API_PATH;
const ASSETS_URL = SERVER_HOST + ASSETS_PATH;
const REFRESH_TOKEN = 1000 _ 60 _ 60 \* 1;

const APP_IMG_LOGO = '/favicon/favicon-32x32.png';
const APP_SVG_LOGO = 'logo';
const APP_LOGO_TYPE = 'svg';
const APP_NAME = 'My StarterKit';
const APP_SLOGAN = 'Powered by initCraft ©2025';
const APP_VERSION = 'v1.5.0';
```
