# macicast

video player where you can watch HLS broadcasts by entering the necessary stream links

## Deployment

### Backend (Render)

1. Create an account on [Render](https://render.com/).
2. Create a new Web Service and connect your GitHub repository.
3. Set the build command to `npm install` and the start command to `node backend/server.js`.
4. Add the following environment variables:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `PORT`

### Frontend (Vercel)

1. Create an account on [Vercel](https://vercel.com/).
2. Create a new project and connect your GitHub repository.
3. Set the build command to `vite build`.
4. Set the output directory to `dist`.
5. Set the install command to `npm install`.

### GitHub

1. Push all your changes to your GitHub repository.
2. Ensure your repository is public for Vercel and Render to access it.
