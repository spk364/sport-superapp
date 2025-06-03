# 🚀 Инструкции по деплою

Данная документация содержит пошаговые инструкции по настройке автоматического деплоя приложений на различные платформы.

## 📋 Содержание

1. [Подготовка репозитория](#подготовка-репозитория)
2. [Деплой на Netlify](#деплой-на-netlify)
3. [Деплой на Vercel](#деплой-на-vercel)
4. [GitHub Actions](#github-actions)
5. [Docker деплой](#docker-деплой)
6. [Собственный сервер](#собственный-сервер)

## 🛠 Подготовка репозитория

### 1. Создание репозитория на GitHub/GitLab

```bash
# Инициализация Git (если еще не сделано)
git init

# Добавление удаленного репозитория
git remote add origin https://github.com/ваш-username/fitness-apps-monorepo.git

# Первый коммит
git add .
git commit -m "Initial commit: Fitness apps monorepo"
git push -u origin main
```

### 2. Структура проекта готова
```
fitness-apps-monorepo/
├── apps/
│   ├── trainer-app/     # Приложение тренеров
│   └── client-app/      # Приложение клиентов
├── .github/workflows/   # GitHub Actions
├── netlify.toml         # Конфигурация Netlify
├── vercel.json          # Конфигурация Vercel
├── Dockerfile           # Docker контейнер
└── docker-compose.yml   # Локальное тестирование
```

## 🌐 Деплой на Netlify (для клиентского приложения)

### Автоматический деплой через GitHub

1. **Зарегистрируйтесь на [Netlify](https://netlify.com)**

2. **Подключите GitHub репозиторий:**
   - New site from Git → GitHub
   - Выберите ваш репозиторий
   - Build settings:
     - Build command: `npm run client:build`
     - Publish directory: `apps/client-app/build`

3. **Настройте переменные окружения:**
   ```
   NODE_VERSION: 18
   NPM_VERSION: 9
   REACT_APP_VERSION: 1.0.0
   ```

4. **Деплой настроен!** Сайт будет автоматически обновляться при push в main

### Через Netlify CLI (ручной деплой)

```bash
# Установка Netlify CLI
npm install -g netlify-cli

# Логин
netlify login

# Инициализация сайта
netlify init

# Деплой
netlify deploy --prod --dir=apps/client-app/build
```

## ⚡ Деплой на Vercel (для тренерского приложения)

### Автоматический деплой

1. **Зарегистрируйтесь на [Vercel](https://vercel.com)**

2. **Импортируйте проект:**
   - Import Git Repository
   - Выберите репозиторий
   - Framework Preset: Create React App
   - Root Directory: `apps/trainer-app`

3. **Настройка через vercel.json** уже готова в проекте

### Через Vercel CLI

```bash
# Установка Vercel CLI
npm install -g vercel

# Логин
vercel login

# Деплой
cd apps/trainer-app
vercel --prod
```

## 🤖 GitHub Actions (автоматизация)

### Настройка секретов

В настройках GitHub репозитория → Settings → Secrets and variables → Actions добавьте:

#### Для Netlify:
```
NETLIFY_AUTH_TOKEN: ваш-токен-из-netlify
NETLIFY_SITE_ID: site-id-из-netlify
```

#### Для Vercel:
```
VERCEL_TOKEN: ваш-токен-из-vercel
VERCEL_ORG_ID: ваш-org-id
VERCEL_TRAINER_PROJECT_ID: project-id-тренерского-приложения
```

### Получение токенов

**Netlify:**
1. User settings → Applications → Personal access tokens
2. Generate new token

**Vercel:**
1. Settings → Tokens → Create Token
2. Скопируйте Project ID из настроек проекта

### Workflow работает автоматически при:
- Push в main/master
- Изменения в соответствующих папках приложений

## 🐳 Docker деплой

### Локальное тестирование

```bash
# Сборка и запуск
docker-compose up --build

# Проверка:
# Клиентское приложение: http://localhost:3001
# Тренерское приложение: http://localhost:3000
```

### Деплой на сервер с Docker

```bash
# На вашем сервере
git clone https://github.com/ваш-username/fitness-apps-monorepo.git
cd fitness-apps-monorepo

# Запуск в продакшн режиме
docker-compose -f docker-compose.yml up -d

# Проверка логов
docker-compose logs -f
```

### Деплой отдельных приложений

```bash
# Только клиентское приложение
docker build --target client-runner -t fitness-client .
docker run -p 3001:80 fitness-client

# Только тренерское приложение  
docker build --target trainer-runner -t fitness-trainer .
docker run -p 3000:80 fitness-trainer
```

## 🖥 Собственный сервер (Ubuntu/CentOS)

### Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PM2 для управления процессами
sudo npm install -g pm2

# Установка Nginx
sudo apt install nginx -y
```

### Деплой приложений

```bash
# Клонирование проекта
git clone https://github.com/ваш-username/fitness-apps-monorepo.git
cd fitness-apps-monorepo

# Установка зависимостей
npm install

# Сборка приложений
npm run build:all

# Настройка PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### Настройка Nginx

Создайте файл `/etc/nginx/sites-available/fitness-apps`:

```nginx
# Клиентское приложение
server {
    listen 80;
    server_name client.yourdomain.com;
    root /path/to/fitness-apps-monorepo/apps/client-app/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Тренерское приложение
server {
    listen 80;
    server_name trainer.yourdomain.com;
    root /path/to/fitness-apps-monorepo/apps/trainer-app/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/fitness-apps /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL сертификат (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение сертификата
sudo certbot --nginx -d client.yourdomain.com -d trainer.yourdomain.com

# Автообновление
sudo crontab -e
# Добавить: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📱 Настройка PWA

### После деплоя обязательно проверьте:

1. **HTTPS доступ** (обязательно для PWA)
2. **Service Worker** загружается
3. **Manifest.json** доступен
4. **Lighthouse PWA аудит** проходит

### Тестирование PWA

```bash
# Установка lighthouse CLI
npm install -g lighthouse

# Проверка PWA
lighthouse https://ваш-сайт.com --view --preset=desktop
lighthouse https://ваш-сайт.com --view --preset=mobile
```

## 🔧 Troubleshooting

### Частые проблемы:

**1. Build fails:**
```bash
# Очистка cache
npm run clean
npm install
```

**2. PWA не работает:**
- Проверьте HTTPS
- Проверьте Service Worker в DevTools
- Убедитесь что manifest.json доступен

**3. Роутинг не работает:**
- Добавьте SPA fallback в веб-сервер
- Проверьте настройки в netlify.toml/vercel.json

**4. Static файлы не загружаются:**
- Проверьте пути в build
- Настройте правильное кеширование

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи сборки
2. Убедитесь в правильности конфигурации
3. Проверьте переменные окружения
4. Создайте issue в репозитории

---

**✅ После успешного деплоя ваши приложения будут доступны:**
- Клиентское: https://ваш-client-домен.com
- Тренерское: https://ваш-trainer-домен.com 