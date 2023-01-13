setup:
	touch logs/logs.log
	touch db/data.db
	cp .env-example .env
	npx prisma db push
