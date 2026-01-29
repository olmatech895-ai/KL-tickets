# WebSocket Troubleshooting Guide

## Проблема: WebSocket connection failed (Ошибка 1006)

Ошибка `WebSocket connection to 'wss://testdomen.uz/api/v1/ws?token=...' failed` с кодом 1006 означает "abnormal closure" - соединение закрылось без получения close frame.

## Возможные причины и решения

### 1. Сервер не запущен или не слушает WebSocket

**Проверка:**
```bash
# Проверьте, запущен ли backend сервер
curl http://localhost:8000/health
# или
curl https://testdomen.uz/health
```

**Решение:**
- Убедитесь, что backend сервер запущен
- Проверьте, что WebSocket endpoint настроен правильно
- Проверьте логи сервера на наличие ошибок

### 2. Неправильный путь к WebSocket endpoint

**Проверка:**
- URL должен быть: `wss://testdomen.uz/api/v1/ws` (для HTTPS)
- Или: `ws://localhost:8000/api/v1/ws` (для HTTP)

**Решение:**
- Проверьте конфигурацию `VITE_API_BASE_URL` в `.env` файле
- Убедитесь, что backend поддерживает путь `/api/v1/ws`

### 3. Проблемы с SSL/TLS сертификатом (для wss://)

**Симптомы:**
- Ошибка при подключении к `wss://`
- Браузер показывает предупреждение о небезопасном соединении

**Решение:**
- Проверьте SSL сертификат на сервере
- Убедитесь, что сертификат действителен и не истек
- Для разработки можно использовать `ws://` вместо `wss://`

### 4. Проблемы с прокси/nginx конфигурацией

**Проверка:**
Проверьте конфигурацию nginx или другого прокси-сервера:

```nginx
# Пример конфигурации nginx для WebSocket
location /api/v1/ws {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400;
}
```

**Решение:**
- Убедитесь, что прокси правильно проксирует WebSocket соединения
- Проверьте заголовки `Upgrade` и `Connection`
- Увеличьте `proxy_read_timeout` для долгих соединений

### 5. Проблемы с CORS или авторизацией

**Проверка:**
- Проверьте, что токен валидный и не истек
- Проверьте заголовки CORS на сервере

**Решение:**
- Обновите токен через `/auth/login` или `/auth/register`
- Проверьте настройки CORS на backend

### 6. Блокировка файрволом или антивирусом

**Проверка:**
- Попробуйте отключить антивирус/файрвол временно
- Проверьте настройки сетевого экрана

**Решение:**
- Добавьте исключение для WebSocket соединений
- Проверьте настройки корпоративного файрвола

## Диагностика

### Шаг 1: Проверка через тестовый инструмент

Используйте файл `test_websocket.html` для детальной диагностики:
1. Откройте `test_websocket.html` в браузере
2. Введите токен
3. Попробуйте подключиться
4. Проверьте детали ошибки в логе

### Шаг 2: Проверка в консоли браузера

Откройте DevTools (F12) → Console и проверьте:
- Детали ошибки WebSocket
- Код закрытия соединения
- Причину закрытия

### Шаг 3: Проверка сетевых запросов

Откройте DevTools (F12) → Network → WS и проверьте:
- Статус соединения
- Заголовки запроса/ответа
- Время подключения

### Шаг 4: Проверка на сервере

Проверьте логи backend сервера:
```bash
# Для Python/FastAPI
tail -f logs/app.log

# Или в консоли где запущен сервер
```

## Коды ошибок WebSocket

- **1000** - Нормальное закрытие
- **1001** - Сервер уходит (shutdown)
- **1002** - Ошибка протокола
- **1003** - Неподдерживаемый тип данных
- **1006** - Аномальное закрытие (соединение потеряно без close frame)
- **1008** - Нарушение политики
- **1011** - Ошибка сервера
- **1015** - Ошибка TLS handshake

## Быстрое решение для разработки

Если вы разрабатываете локально:

1. Используйте `ws://` вместо `wss://`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

2. Проверьте, что backend запущен:
   ```bash
   cd backend
   python run.py
   ```

3. Проверьте подключение:
   ```bash
   # В другом терминале
   curl http://localhost:8000/health
   ```

## Проверка работы WebSocket на сервере

### Тест через wscat (если установлен):

```bash
# Установка wscat
npm install -g wscat

# Подключение
wscat -c "ws://localhost:8000/api/v1/ws?token=YOUR_TOKEN"
```

### Тест через curl (для проверки endpoint):

```bash
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: test" \
  "http://localhost:8000/api/v1/ws?token=YOUR_TOKEN"
```

## Контакты для поддержки

Если проблема не решена:
1. Соберите логи из консоли браузера
2. Соберите логи с сервера
3. Проверьте конфигурацию nginx/прокси
4. Проверьте настройки файрвола


