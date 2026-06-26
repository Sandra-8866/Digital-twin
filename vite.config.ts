import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Custom plugin to serve the root Data folder during development and copy it during build
function serveDataPlugin() {
  return {
    name: 'serve-data-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url && req.url.startsWith('/Data/')) {
          const decodedUrl = decodeURIComponent(req.url);
          // Resolve file path from the project root Data folder
          const filePath = path.join(process.cwd(), decodedUrl);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }
        next();
      });
    },
    writeBundle() {
      const srcDir = path.join(process.cwd(), 'Data');
      const destDir = path.join(process.cwd(), 'dist', 'Data');
      if (fs.existsSync(srcDir)) {
        fs.mkdirSync(destDir, { recursive: true });
        const files = fs.readdirSync(srcDir);
        for (const file of files) {
          fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
        }
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), serveDataPlugin()],
})
