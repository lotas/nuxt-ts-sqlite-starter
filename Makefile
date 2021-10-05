.all:

.DEFAULT_GOAL := help
.PHONY: help fetch-db import-db

GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
WHITE  := $(shell tput -Txterm setaf 7)
RESET  := $(shell tput -Txterm sgr0)

HELP_MAX_CHAR=25

help:
		@echo 'Usage:'
		@echo '  ${YELLOW}make${RESET} ${GREEN}<target>${RESET}'
		@echo 'Targets:'
		@awk '/^[a-zA-Z\-\_0-9]+:/ { \
			helpMessage = match(lastLine, /^## (.*)/); \
			if (helpMessage) { \
				helpCommand = substr($$1, 0, index($$1, ":")); \
				helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
				printf "  ${YELLOW}%-$(HELP_MAX_CHAR)s${RESET} ${GREEN}%s${RESET}\n", helpCommand, helpMessage; \
			} \
		} \
		{ lastLine = $$0 }' $(MAKEFILE_LIST)

## Run migrations / Init db
db-migrate:
		@echo "Initializing database"
		npm run knex migrate:up

## Create new migration
db-migrate:
		@echo "Create new migration"
		npm run knex migrate:make new

## Rollback last migration
db-rollback:
		@echo "Rollback db"
		npm run knex migrate:rollback
