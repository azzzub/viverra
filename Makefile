setup:
	yarn
	touch logs/logs.log
	touch db/data.db
	cp .env-example .env
	npx prisma db push
	node ./utils/localAdmin.js

serve-yarn:
	yarn
	yarn build
	yarn start

serve-pm2:
	yarn
	yarn build
	pm2 start "yarn start" --name viverra

restart-pm2:
	pm2 stop viverra
	pm2 delete viverra
	make serve-pm2
