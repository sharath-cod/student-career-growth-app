# Deploying Student Career Growth Tracker (free, live)

Target setup (all free tiers):

| Part | Service | Why |
|---|---|---|
| Database | MongoDB Atlas M0 | 512 MB, no time limit |
| Backend API | Render (Web Service, Free) | Runs Node/Express |
| Frontend | Vercel or Netlify or Cloudflare Pages | Static React build |
| Code | GitHub | All three deploy from a repo |

Order matters: **Database -> Backend -> Frontend -> link them (CORS) -> create admin.**

---

## Step 0. Put the code on GitHub
```bash
cd student-career-tracker
git init
git add .
git commit -m "Student Career Growth Tracker"
# create an EMPTY repo on github.com (Private is fine), then:
git remote add origin https://github.com/<your-user>/student-career-tracker.git
git branch -M main
git push -u origin main
```
`.gitignore` already excludes `.env` and `node_modules`. Check on GitHub that no `.env` file was uploaded.

## Step 1. MongoDB Atlas (database)
1. Sign up at https://www.mongodb.com/cloud/atlas.
2. Create a project, then **Create a cluster -> M0 Free**. Pick a region close to your Render region (e.g. Mumbai/Singapore for India).
3. **Database Access -> Add New Database User**: username `tracker_app`, a strong generated password, role **Read and write to any database**. Save the password.
4. **Network Access -> Add IP Address -> Allow access from anywhere (0.0.0.0/0)**. Render's free plan has no fixed outbound IP, so this is required. Your protection is the long database password, so keep it strong.
5. **Database -> Connect -> Drivers**, copy the string and edit it:
   ```
   mongodb+srv://tracker_app:<PASSWORD>@cluster0.xxxxx.mongodb.net/student_career_tracker?retryWrites=true&w=majority
   ```
   - Replace `<PASSWORD>`. If it contains `@ : / ? # %`, URL-encode them (or just generate a password with letters and digits only).
   - Keep `/student_career_tracker` before the `?`, otherwise data lands in a database called `test`.

## Step 2. Backend on Render
1. Sign up at https://render.com with GitHub.
2. **New -> Web Service** -> connect your repo.
3. Settings:
   - Name: `career-tracker-api`
   - Region: same area as Atlas
   - Root Directory: `backend`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: **Free**
4. **Environment Variables**:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | the Atlas string from Step 1 |
   | `JWT_SECRET` | 48+ random bytes: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | leave a placeholder for now, fill in at Step 4 |
   | `NODE_VERSION` | `20` |
   Do not set `PORT`; Render provides it.
5. **Create Web Service**. When the log says `API running on ...`, open
   `https://career-tracker-api.onrender.com/api/health`. You should see `{"success":true,"status":"ok",...}`.

## Step 3. Frontend on Vercel (or Netlify)
**Vercel**
1. https://vercel.com -> **Add New -> Project** -> import the repo.
2. Root Directory: `frontend`. Framework preset: Vite (auto-detected). Build: `npm run build`, output: `dist`.
3. Environment variable (must be set BEFORE the build, Vite bakes it in):
   `VITE_API_URL` = `https://career-tracker-api.onrender.com/api`
4. Deploy. Note the URL, e.g. `https://career-tracker.vercel.app`.

`frontend/vercel.json` is already included so refreshing on `/student/dashboard` works instead of showing 404.

**Netlify / Cloudflare Pages instead:** base directory `frontend`, build `npm run build`, publish `dist`, same `VITE_API_URL` variable. `frontend/public/_redirects` handles page refreshes.

Licensing note: Vercel's free Hobby plan is meant for personal, non-commercial use. A college project is usually fine, but if the college runs it officially, Netlify or Cloudflare Pages are safer choices. Check their current terms.

## Step 4. Connect frontend and backend (CORS)
In Render -> your service -> Environment, set
`CLIENT_URL` = `https://career-tracker.vercel.app` (exact origin, **no trailing slash**).
Several origins (e.g. a custom domain too) are comma-separated:
`https://career-tracker.vercel.app,https://tracker.yourcollege.edu`.
Render redeploys automatically.

## Step 5. Create the admin account
Free Render services have no shell, so run the seed script from your own computer against Atlas:
```bash
cd backend
# in backend/.env (local file, never committed):
#   MONGO_URI=<the Atlas string>
#   ADMIN_NAME=Head of Department
#   ADMIN_EMAIL=hod@yourcollege.edu
#   ADMIN_PASSWORD=<strong password, 8+ chars, letters and numbers>
npm install
npm run seed:admin
```
Then delete `ADMIN_PASSWORD` from the file. Log in at `https://<frontend>/admin/login`.

## Step 6. Live test checklist
1. `/api/health` returns ok.
2. Register a student on the live site, land on the dashboard, log out, log in again.
3. `/admin/login` works with the admin account, and refuses the student account.
4. As a student, open `/admin/dashboard` -> you are sent back to the student dashboard.
5. Refresh any page -> no 404.

## Free-tier behaviour you should know about
- **Sleep:** a free Render web service spins down after 15 minutes without traffic and takes about a minute to wake. The first login after a quiet period will be slow. The frontend timeout is already 60 s for this. To avoid it, either pay $7/month for the Starter instance, or ping `/api/health` every 10-14 minutes with a free monitor such as UptimeRobot. Free services also share 750 instance hours per month, enough for one service running all month.
- **No persistent disk:** the free filesystem is wiped on every restart/deploy. Do **not** store uploaded certificate files in `backend/uploads` on Render. Phase 4 will store certificate files in MongoDB (GridFS) or Cloudinary's free tier so they survive.
- **Database size:** Atlas M0 is 512 MB, plenty for text records for several hundred students. Certificate files would use it up quickly, so keep uploads small (e.g. 2 MB, PDF/JPG) or use Cloudinary.
- **Backups:** the M0 free tier does not give you automatic backups. Export regularly from your computer:
  `mongodump --uri "<Atlas URI>" --out backup-$(date +%F)` (install MongoDB Database Tools first). Also useful: Atlas -> Collections -> Export.
- Free-tier terms change. Re-check the pricing pages of Render, Atlas, and your frontend host before relying on them for a whole semester.

## Security checklist before real students use it
- [ ] `JWT_SECRET` is long and random, different from your local one.
- [ ] Admin password is strong and not shared in chat/email.
- [ ] `CLIENT_URL` lists only your real frontend origins.
- [ ] No `.env` file in GitHub (`git ls-files | grep .env` shows only `.env.example`).
- [ ] Atlas user has a unique password used nowhere else.
- [ ] Tell students the site stores personal data (CGPA, attendance) and who can see it (the admins).

## Updating the live site
`git push` to `main` -> Render and Vercel redeploy automatically. If you change `VITE_API_URL`, trigger a frontend redeploy (it is applied at build time).

## Alternative: college server / VPS (always on, no sleep)
1. Ubuntu server with Node 20, Nginx, and MongoDB (or Atlas).
2. `cd backend && npm ci --omit=dev`, set `.env`, run with `pm2 start server.js --name tracker-api`, then `pm2 save && pm2 startup`.
3. `cd frontend && npm ci && VITE_API_URL=/api npm run build`, copy `dist/` to `/var/www/tracker`.
4. Nginx: serve `/var/www/tracker` with `try_files $uri /index.html;`, and `location /api/ { proxy_pass http://127.0.0.1:5000; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; }`.
5. HTTPS with Let's Encrypt: `sudo certbot --nginx -d tracker.yourcollege.edu`.

## Common problems
| Symptom | Cause / fix |
|---|---|
| "Cannot reach the server" right away | `VITE_API_URL` missing or wrong; fix and redeploy frontend. Must end with `/api`. |
| Browser console: CORS error | `CLIENT_URL` on Render doesn't exactly match the site origin (trailing slash, http vs https, typo). |
| First request very slow, then fine | Render free sleep (see above). |
| 404 when refreshing a page | Rewrite file missing; make sure `vercel.json` / `_redirects` is committed. |
| Render log: `MongooseServerSelectionError` | Atlas IP allowlist lacks 0.0.0.0/0, wrong password, or special characters not URL-encoded. |
| Render log: `JWT_SECRET is missing or too short` | Set the variable (24+ characters). |
| "Too many attempts" for everyone | `trust proxy` missing. It is set in `server.js` in this version. |
| Seed script: "Authentication failed" | Wrong Atlas user/password in local `MONGO_URI`. |
| Logins work then suddenly fail after a long time | Token expired (`JWT_EXPIRES_IN`); log in again. |
