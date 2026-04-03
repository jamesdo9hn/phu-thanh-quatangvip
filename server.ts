import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

// Load firebase config for server-side sync
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Sync endpoint: Fetches from Firestore and saves to local JSON files
  app.post("/api/sync", async (req, res) => {
    try {
      console.log('Starting sync to JSON...');
      
      // 1. Sync Products
      const productsSnapshot = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
      const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // 2. Sync Posts
      const postsSnapshot = await getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc')));
      const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 3. Sync Settings
      const settingsSnapshot = await getDocs(collection(db, 'settings'));
      const settings = settingsSnapshot.docs.length > 0 ? settingsSnapshot.docs[0].data() : {};

      // Ensure data directory exists
      const dataDir = path.join(process.cwd(), 'public', 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Write to files
      fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(products, null, 2));
      fs.writeFileSync(path.join(dataDir, 'posts.json'), JSON.stringify(posts, null, 2));
      fs.writeFileSync(path.join(dataDir, 'settings.json'), JSON.stringify(settings, null, 2));

      console.log('Sync completed successfully.');
      res.json({ 
        success: true, 
        message: 'Data synced to JSON successfully',
        counts: {
          products: products.length,
          posts: posts.length
        }
      });
    } catch (error: any) {
      console.error('Sync error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Development SPA fallback
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        // 1. Read index.html from current working directory
        const indexPath = path.resolve(process.cwd(), 'index.html');
        if (!fs.existsSync(indexPath)) {
          return next();
        }
        
        let template = fs.readFileSync(indexPath, 'utf-8');

        // 2. Apply Vite HTML transforms
        template = await vite.transformIndexHtml(url, template);

        // 3. Send the transformed HTML back.
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // SPA fallback: Serve index.html for any route that doesn't match a static file
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Not Found');
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
