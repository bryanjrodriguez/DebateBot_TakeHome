.PHONY: help install test run down clean

help:
	@echo "Available commands:"
	@echo "  make install   Install all requirements to run the service."
	@echo "  make test      Run tests."
	@echo "  make run       Run the service and all related services (such as a db) in Docker."
	@echo "  make down      Teardown of all running services."
	@echo "  make clean     Teardown and removal of all containers."

install:
	pip install -r requirements.txt
	test -f .env || cp .env.example .env

run:
	docker-compose up --build

down:
	docker-compose down

clean:
	docker-compose down -v --remove-orphans


test:
	pytest


