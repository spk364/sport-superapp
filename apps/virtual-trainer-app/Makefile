.PHONY: help build up down logs test clean install dev

# Переменные
COMPOSE_FILE = docker-compose.yml
PYTHON = python3
PIP = pip3

help: ## Показать справку
	@echo "Virtual Trainer - Команды для разработки"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Установить зависимости Python
	$(PIP) install -r requirements.txt

dev-setup: ## Настройка среды разработки
	cp env.example .env
	@echo "Отредактируйте .env файл с вашими настройками"

build: ## Собрать Docker образы
	docker-compose build

up: ## Запустить все сервисы
	docker-compose up -d

down: ## Остановить все сервисы
	docker-compose down

logs: ## Показать логи всех сервисов
	docker-compose logs -f

logs-backend: ## Показать логи backend
	docker-compose logs -f backend

logs-bot: ## Показать логи telegram бота
	docker-compose logs -f telegram_bot

restart: ## Перезапустить все сервисы
	docker-compose restart

restart-backend: ## Перезапустить backend
	docker-compose restart backend

restart-bot: ## Перезапустить telegram бота
	docker-compose restart telegram_bot

test: ## Запустить тесты
	pytest

test-cov: ## Запустить тесты с покрытием
	pytest --cov=backend --cov-report=html

test-unit: ## Запустить только unit тесты
	pytest -m unit

test-integration: ## Запустить только integration тесты
	pytest -m integration

lint: ## Проверить код линтером
	flake8 backend/ telegram_bot/
	black --check backend/ telegram_bot/

format: ## Отформатировать код
	black backend/ telegram_bot/
	isort backend/ telegram_bot/

clean: ## Очистить временные файлы
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	rm -rf .pytest_cache/
	rm -rf htmlcov/
	rm -rf .coverage

clean-docker: ## Очистить Docker ресурсы
	docker-compose down -v
	docker system prune -f

db-init: ## Инициализировать базу данных
	docker-compose exec backend python -c "from backend.core.database import init_db; import asyncio; asyncio.run(init_db())"

db-reset: ## Сбросить базу данных
	docker-compose down postgres
	docker volume rm virtual_trainer_postgres_data
	docker-compose up -d postgres
	sleep 5
	make db-init

shell-backend: ## Войти в контейнер backend
	docker-compose exec backend bash

shell-db: ## Войти в PostgreSQL
	docker-compose exec postgres psql -U vt_user -d virtual_trainer

dev-backend: ## Запустить backend локально
	uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

dev-bot: ## Запустить telegram бота локально
	$(PYTHON) -m telegram_bot.main

dev-worker: ## Запустить Celery worker локально
	celery -A backend.core.celery worker --loglevel=info

dev-flower: ## Запустить Flower локально
	celery -A backend.core.celery flower --port=5555

status: ## Показать статус сервисов
	docker-compose ps

health: ## Проверить здоровье сервисов
	@echo "Проверка API..."
	@curl -s http://localhost:8000/health | jq . || echo "API недоступен"
	@echo "Проверка Flower..."
	@curl -s http://localhost:5555 > /dev/null && echo "Flower работает" || echo "Flower недоступен"

backup-db: ## Создать бэкап базы данных
	docker-compose exec postgres pg_dump -U vt_user virtual_trainer > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore-db: ## Восстановить базу данных (укажите файл: make restore-db FILE=backup.sql)
	docker-compose exec -T postgres psql -U vt_user -d virtual_trainer < $(FILE)

update: ## Обновить проект
	git pull
	docker-compose build
	docker-compose up -d

prod-deploy: ## Развернуть в продакшене
	@echo "Развертывание в продакшене..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Алиасы для удобства
start: up
stop: down
rebuild: down build up 