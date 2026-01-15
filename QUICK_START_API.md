# Быстрый старт: Frontend + Backend

## Шаг 1: Запуск Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python run.py
```

Backend запустится на `http://localhost:8000`

## Шаг 2: Запуск Frontend

В другом терминале:

```bash
npm install
npm run dev
```

Frontend запустится на `http://localhost:5173`

## Шаг 3: Тестирование

1. Откройте `http://localhost:5173`
2. Зарегистрируйтесь с email `@kostalegal.com`
3. После регистрации вы автоматически войдете в систему
4. Все запросы будут отправляться на backend API

## Проверка работы

### В браузере (DevTools → Network):
- Запросы идут на `http://localhost:8000/api/v1`
- В заголовках есть `Authorization: Bearer <token>`

### В консоли браузера:
- Нет ошибок подключения
- Токен сохраняется в localStorage

## Документация API

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Важно

- Backend должен быть запущен перед frontend
- Email должен быть с доменом `@kostalegal.com`
- Токен действителен 24 часа

