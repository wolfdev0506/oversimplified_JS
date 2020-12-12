import { Server } from 'boardgame.io/server'
import { Oversimplified } from "./src/game/game"
import path from 'path';
import serve from 'koa-static';
import {SERVER_PORT} from './src/constants'

const server = Server({ games: [Oversimplified] });
// const PORT = process.env.PORT || 8000;

// Build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, './build');
server.app.use(serve(frontEndAppBuildPath))

server.run(SERVER_PORT, () => {
  server.app.use(
    async (ctx, next) => {
      await serve(frontEndAppBuildPath)(
        Object.assign(ctx, { path: 'index.html' }),
        next
      )
    }
  )
})