## **VIVERRA**

### visual verifier robust assistant

---

<img src="./public/viverra-mascot.png" alt="viverra" style="width:150px;"/>

_will always watching your snapshot_

---

**pre req: install `yarn`**

or you can use npm if you can't install yarn _(no guarantee)_

</br>

you can serve Viverra with `pm2` or `yarn`, with `pm2` you can run viverra on the background:

<br/>

**> installation - serve with pm2 (choose one)**

**pre req: install `pm2`** _[instalation guidance](https://pm2.keymetrics.io/docs/usage/quick-start/)_

run `make setup` and follow the instruction

then, run `make serve-pm2`

viverra will serve on port :3000

_restarting the viverra service in `pm2`, run this command `make restart-pm2`_

<br/>

**> installation - serve with yarn (choose one)**

run `make setup` and follow the instruction

then, run `make serve-yarn`

viverra will serve on port :3000

<br/>

**> development**

going to development environment, run `yarn dev`

<br/>

**> showing the database by ui**

you can show the database by UI by running `npx prisma studio`

then the UI will serve on port :5555

_ref: https://github.com/prisma/studio_

<br/>

**> known issue and how to solve it**

if you encounter some issue such as `connect ECONNREFUSED ::1:3000` in the homepage, **please replace your URL and `NEXT_PUBLIC_BASE_URL` variable on `.env` file** from `http://localhost:3000` to `http://127.0.0.1:3000`

<br/>

---

## Using on Katalon

---

To use viverra on Katalon, see [here](./external/Katalon/README.md)
