## **🦖 VREX**

### visual regression test

---

<img src="./public/vrex-mascot.png" alt="vrex" style="width:150px;"/>

_will always watching your snapshot_

---

**pre req: install `yarn`**

or you can use npm if you can't install yarn _(no guarantee)_

</br>

**> installation**

after clone this repo, install all dependencies using command `yarn`

then, you must run `make setup` and follow the instruction

going to production environment, run `yarn build` at first then `yarn start`

vrex will serve on port :3000

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
