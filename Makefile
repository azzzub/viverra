setup:
	touch logs/logs.log
	touch db/data.db
	touch .env
	npx prisma db push
