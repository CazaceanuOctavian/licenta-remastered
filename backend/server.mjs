import app from "./app.mjs"
import http from 'http'

const PORT = process.env.PORT || 8080

const server = http.createServer(app)

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})