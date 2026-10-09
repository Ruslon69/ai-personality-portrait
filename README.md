# Soul Arkana

## Название продукта

**Soul Arkana** — пространство для саморефлексии через Таро, нумерологию, личный портрет и сохранённый путь. **The answers are already within.**

## О продукте

Пользователь отвечает на короткие вопросы, записывает подготовленный текст голосом и указывает данные рождения. Сервис объединяет ответы, базовые особенности речи, интересы и интерпретационные блоки нумерологии и зодиака в понятный персональный отчёт с бережными рекомендациями.

Результат предназначен для саморефлексии и развлечения. Он не является диагнозом, научным измерением личности или прогнозом будущего.

## Текущий статус

**Release candidate preparation.** Основные пользовательские модули реализованы; перед публичным production-запуском остаются обязательные deployment, privacy/legal и operational release gates.

## Основные документы

- [Видение продукта](docs/product-vision.md)
- [Границы MVP](docs/mvp.md)
- [Основной пользовательский путь](docs/user-flow.md)
- [Правила проекта](docs/project-rules.md)
- [ДНК продукта](docs/product-dna.md)
- [Архитектура пользовательского опыта](docs/experience-architecture.md)
- [Модуль совместимости](docs/compatibility.md)
- [Принципы контента](docs/content-principles.md)
- [Информационная архитектура](docs/information-architecture.md)
- [Карта навигации](docs/navigation-map.md)
- [Каталог экранов](docs/screen-catalog.md)
- [Эмоциональный путь пользователя](docs/product-flow.md)
- [Философия дизайна](docs/design-philosophy.md)
- [Логика AI Engine](docs/ai-engine.md)
- [Приватность и безопасность](docs/privacy-security.md)
- [Архитектура монетизации](docs/monetization-architecture.md)
- [Дизайн-система](docs/design-system.md)
- [Текстовые спецификации экранов](docs/wireframes.md)
- [Требования к production-развёртыванию](docs/release-readiness.md)

## Внутренний рабочий процесс

- **ChatGPT** — архитектор и руководитель: формирует направление, требования и решения.
- **Codex** — исполнитель: изучает утверждённые документы, вносит небольшие проверяемые изменения и отчитывается о результате.
- **Пользователь** — владелец продукта и контролёр: утверждает продуктовые решения, приоритеты и переход к разработке.

Перед любыми изменениями необходимо сверяться с документами проекта. Изменения в продукте и разработка начинаются только после явного утверждения владельца продукта.

## Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Проверки frontend:

```bash
npm run lint
npm run format:check
npm run build
```

### Backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/python -m pip install -e ".[dev]"
.venv/bin/uvicorn app.main:app --reload
```

После запуска health endpoint доступен по адресу `http://127.0.0.1:8000/health`.

Проверки backend:

```bash
.venv/bin/ruff check .
.venv/bin/ruff format --check .
```
