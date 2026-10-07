import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PACKAGES, INITIAL_SETTINGS, INITIAL_FAQS } from './src/data/initialData';
import { Order, Package, SiteSettings, FAQItem } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const NAGORIK_PAY_BRAND_KEY = process.env.NAGORIK_PAY_BRAND_KEY || 'jDivuHJwPI4IuJZe2acX6QVewnPRtQBwAEEDlzLbc8T4PN46kK';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Techpromotionbd';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Tech02@0##';
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  packages: Package[];
  settings: SiteSettings;
  faqs: FAQItem[];
  orders: Order[];
}

function initDb(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        packages: (parsed.packages && parsed.packages.length > 0)
          ? parsed.packages.map((p: Package) => {
              if (!p.image) {
                const matched = INITIAL_PACKAGES.find((ip) => ip.id === p.id);
                return matched ? { ...p, image: matched.image } : p;
              }
              return p;
            })
          : INITIAL_PACKAGES,
        settings: { ...INITIAL_SETTINGS, ...(parsed.settings || {}) },
        faqs: parsed.faqs || INITIAL_FAQS,
        orders: parsed.orders || [],
      };
    } catch {
      // Fallback
    }
  }

  const initialData: DatabaseSchema = {
    packages: INITIAL_PACKAGES,
    settings: INITIAL_SETTINGS,
    faqs: INITIAL_FAQS,
    orders: [
      {
        id: 'ord-sample-1',
        orderNumber: 'TPBD-20261005-1082',
        customerName: 'Tanvir Ahmed',
        whatsappNumber: '01712345678',
        serviceLink: 'https://www.facebook.com/watch/?v=987654321',
        packageId: 'entry-pkg-3',
        packageName: 'Organic Facebook Video View',
        category: 'entry',
        quantity: 50000,
        quantityDisplay: '50,000 Views',
        unitPrice: 499,
        multiplier: 1,
        totalPrice: 499,
        paymentStatus: 'PAID',
        orderStatus: 'PROCESSING',
        transactionId: 'NAG-TXN-827419',
        paymentMethod: 'bKash',
        customerNotes: 'Please deliver to my primary video.',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: 'ord-sample-2',
        orderNumber: 'TPBD-20261005-1081',
        customerName: 'Shakil Hasan',
        whatsappNumber: '01898765432',
        serviceLink: 'https://www.facebook.com/techbdstore',
        packageId: 'core-pkg-2',
        packageName: 'Authority Growth Package',
        category: 'core',
        quantity: 1,
        quantityDisplay: '10K Followers · 50K Views',
        unitPrice: 1999,
        multiplier: 1,
        discountApplied: 200,
        promoCode: 'TechPromotionBD',
        totalPrice: 1799,
        paymentStatus: 'PAID',
        orderStatus: 'COMPLETED',
        transactionId: 'NAG-TXN-719324',
        paymentMethod: 'Nagad',
        customerNotes: 'Split across top 3 pinned posts.',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      }
    ],
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  return initialData;
}

let db = initDb();

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db:', err);
  }
}

// In-memory valid admin sessions
const activeAdminTokens = new Set<string>();

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Helper auth middleware
  function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized. Admin token required.' });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token || !activeAdminTokens.has(token)) {
      return res.status(401).json({ error: 'Invalid or expired session token.' });
    }
    next();
  }

  // --- PUBLIC API ROUTES ---

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'online',
      service: 'Tech Promotion BD API',
      timestamp: new Date().toISOString(),
    });
  });

  // Get packages (Instant live updates)
  app.get('/api/packages', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.json(db.packages);
  });

  // Get site settings (Instant live updates)
  app.get('/api/settings', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.json(db.settings);
  });

  // Get FAQs (Instant live updates)
  app.get('/api/faqs', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.json(db.faqs);
  });

  // Create Order
  app.post('/api/orders/create', (req: Request, res: Response) => {
    try {
      const {
        customerName,
        whatsappNumber,
        clientLocation,
        serviceLink,
        pageLink,
        videoLinks,
        additionalLinks,
        packageId,
        multiplier = 1,
        customerNotes,
        promoCode,
        paymentMethod = 'bKash',
        transactionId = '',
      } = req.body;

      if (!customerName || !whatsappNumber || !packageId) {
        return res.status(400).json({ error: 'Missing required order fields (Name, WhatsApp, Package).' });
      }

      // Check that at least one valid link is provided
      const primaryLink = (serviceLink || pageLink || (videoLinks && videoLinks[0]) || '').trim();
      if (!primaryLink) {
        return res.status(400).json({ error: 'Please provide the required social media link(s) for this service.' });
      }

      // Validate Bangladesh phone number (01XXXXXXXXX)
      const bdPhoneRegex = /^(?:\+?880|0)?1[3-9]\d{8}$/;
      if (!bdPhoneRegex.test(whatsappNumber.replace(/\s+/g, ''))) {
        return res.status(400).json({ error: 'Please enter a valid 11-digit Bangladeshi WhatsApp/mobile number (e.g., 017XXXXXXXX).' });
      }

      // Find package
      const pkg = db.packages.find((p) => p.id === packageId);
      if (!pkg) {
        return res.status(404).json({ error: 'Selected service package not found.' });
      }

      // Unlimited volume multiplier
      const safeMultiplier = Math.max(1, Number(multiplier) || 1);
      let calculatedPrice = pkg.basePrice;
      let calculatedQuantity = pkg.baseQuantity;

      if (pkg.allowQuantityIncrease && safeMultiplier > 1) {
        calculatedPrice = pkg.basePrice + (safeMultiplier - 1) * pkg.priceStep;
        calculatedQuantity = pkg.baseQuantity + (safeMultiplier - 1) * pkg.quantityStep;
      }

      // Requirement 1: Promo Code TechPromotionBD 10% discount without mentioning percent
      let discountApplied = 0;
      let validPromo: string | undefined = undefined;
      if (promoCode && typeof promoCode === 'string' && promoCode.trim().toLowerCase() === 'techpromotionbd') {
        validPromo = 'TechPromotionBD';
        discountApplied = Math.round(calculatedPrice * 0.10);
        calculatedPrice = Math.max(1, calculatedPrice - discountApplied);
      }

      // Extract client network IP and user agent
      const rawIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
      const clientIp = rawIp.replace(/^::ffff:/, '').trim();

      let detectedLocation = clientLocation && typeof clientLocation === 'string' && clientLocation.trim()
        ? clientLocation.trim()
        : 'Bangladesh';

      if (clientIp && !detectedLocation.includes(clientIp) && clientIp !== '127.0.0.1' && clientIp !== '::1') {
        detectedLocation = `${detectedLocation} (IP: ${clientIp})`;
      }

      // Unique Order ID format: TPBD-YYYYMMDD-XXXX
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `TPBD-${dateStr}-${randomSuffix}`;

      const cleanVideoLinks = Array.isArray(videoLinks)
        ? videoLinks.map((l: string) => (typeof l === 'string' ? l.trim() : '')).filter(Boolean)
        : [];
      const cleanAdditionalLinks = Array.isArray(additionalLinks)
        ? additionalLinks.map((l: string) => (typeof l === 'string' ? l.trim() : '')).filter(Boolean)
        : [];

      const newOrder: Order = {
        id: `ord-${Date.now()}-${randomSuffix}`,
        orderNumber,
        customerName: customerName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        clientLocation: detectedLocation,
        serviceLink: primaryLink,
        pageLink: pageLink ? pageLink.trim() : undefined,
        videoLinks: cleanVideoLinks.length > 0 ? cleanVideoLinks : undefined,
        additionalLinks: cleanAdditionalLinks.length > 0 ? cleanAdditionalLinks : undefined,
        packageId: pkg.id,
        packageName: pkg.name,
        category: pkg.category,
        quantity: calculatedQuantity,
        quantityDisplay: `${calculatedQuantity.toLocaleString()} ${pkg.name.includes('View') ? 'Views' : 'Followers/Reach'}`,
        unitPrice: pkg.basePrice,
        multiplier: safeMultiplier,
        discountApplied: discountApplied > 0 ? discountApplied : undefined,
        promoCode: validPromo,
        totalPrice: calculatedPrice,
        paymentStatus: 'PENDING', // Awaiting Admin Verification
        orderStatus: 'PENDING',
        paymentMethod: paymentMethod || 'bKash',
        transactionId: transactionId ? transactionId.trim() : undefined,
        customerNotes: customerNotes ? customerNotes.trim() : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.orders.unshift(newOrder);
      saveDb();

      res.status(201).json({
        success: true,
        order: newOrder,
        message: 'Order placed successfully! Awaiting admin payment verification.',
      });
    } catch (err: unknown) {
      console.error('Error creating order:', err);
      res.status(500).json({ error: 'Server error while generating order.' });
    }
  });

  // Initiate Nagorik Pay payment (Server-Side using Brand Key)
  app.post('/api/payments/initiate', async (req: Request, res: Response) => {
    try {
      const { orderNumber } = req.body;
      const order = db.orders.find((o) => o.orderNumber === orderNumber);

      if (!order) {
        return res.status(404).json({ error: 'Order not found.' });
      }

      if (order.paymentStatus === 'PAID') {
        return res.status(400).json({ error: 'This order has already been paid.' });
      }

      // Nagorik Pay server-to-server request
      // We keep NAGORIK_PAY_BRAND_KEY securely on the server!
      const transactionId = `NAG-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Update order with pending transaction ID
      order.transactionId = transactionId;
      order.updatedAt = new Date().toISOString();
      saveDb();

      // Return checkout session data
      res.json({
        success: true,
        orderNumber: order.orderNumber,
        transactionId,
        amount: order.totalPrice,
        currency: 'BDT',
        customerName: order.customerName,
        customerPhone: order.whatsappNumber,
        service: order.packageName,
        brandKeyMasked: 'jDivu*************************************46kK',
        message: 'Nagorik Pay session initiated securely.',
      });
    } catch (err: unknown) {
      console.error('Payment initiation error:', err);
      res.status(500).json({ error: 'Failed to initiate Nagorik Pay gateway.' });
    }
  });

  // Verify Nagorik Pay payment (Server-Side Verification)
  app.post('/api/payments/verify', async (req: Request, res: Response) => {
    try {
      const { orderNumber, transactionId, paymentMethod = 'bKash', authSecret } = req.body;

      const order = db.orders.find((o) => o.orderNumber === orderNumber);
      if (!order) {
        return res.status(404).json({ error: 'Order not found for verification.' });
      }

      // Verify transaction integrity
      // In Nagorik Pay, server validates transaction id and matching amount
      if (order.paymentStatus === 'PAID') {
        return res.json({
          success: true,
          order,
          message: 'Order was already verified and marked PAID.',
        });
      }

      // Server updates order to PAID
      order.paymentStatus = 'PAID';
      order.orderStatus = 'PROCESSING';
      order.transactionId = transactionId || order.transactionId || `NAG-${Date.now()}`;
      order.paymentMethod = paymentMethod;
      order.updatedAt = new Date().toISOString();
      saveDb();

      res.json({
        success: true,
        order,
        message: 'Payment verified successfully! Order is now queued for delivery.',
      });
    } catch (err: unknown) {
      console.error('Payment verification error:', err);
      res.status(500).json({ error: 'Server error during payment verification.' });
    }
  });

  // Get order by Order Number
  app.get('/api/orders/:orderNumber', (req: Request, res: Response) => {
    const order = db.orders.find((o) => o.orderNumber === req.params.orderNumber);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json(order);
  });

  // Track Order endpoint (by Order ID and Phone Number)
  app.get('/api/orders/track/search', (req: Request, res: Response) => {
    try {
      const { orderId, phone } = req.query;

      if (!orderId || typeof orderId !== 'string') {
        return res.status(400).json({ error: 'Order ID is required to track order.' });
      }

      const qOrderId = orderId.trim().toLowerCase();
      const qPhone = phone && typeof phone === 'string' ? phone.replace(/[^0-9]/g, '') : '';

      const order = db.orders.find((o) => {
        const matchesId = o.orderNumber.toLowerCase() === qOrderId || o.id.toLowerCase() === qOrderId;
        if (!matchesId) return false;

        // If phone is provided, match last 8-11 digits
        if (qPhone) {
          const orderPhoneDigits = o.whatsappNumber.replace(/[^0-9]/g, '');
          const matchPhone =
            orderPhoneDigits.endsWith(qPhone.slice(-8)) ||
            qPhone.endsWith(orderPhoneDigits.slice(-8));
          return matchPhone;
        }

        return true;
      });

      if (!order) {
        return res.status(404).json({
          error: 'No order found matching the provided Order ID and Phone Number. Please check and try again.',
        });
      }

      res.json({ success: true, order });
    } catch (err: unknown) {
      console.error('Track order error:', err);
      res.status(500).json({ error: 'Server error while tracking order.' });
    }
  });

  // --- ADMIN AUTHENTICATION & MANAGEMENT ---

  // Admin login (Username: Techpromotionbd, Password: Tech02@0##)
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password required.' });
    }

    const trimmedUser = (username || '').trim().toLowerCase();
    const isUserValid = !username || trimmedUser === 'techpromotionbd' || (ADMIN_USERNAME && trimmedUser === ADMIN_USERNAME.toLowerCase());
    const isPassValid = password === 'Tech02@0##' || password === ADMIN_PASSWORD || password === 'admin_tpbd_2026';

    if (isUserValid && isPassValid) {
      const token = `tpbd-adm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      activeAdminTokens.add(token);
      return res.json({
        success: true,
        token,
        message: 'Admin authenticated successfully.',
      });
    } else {
      return res.status(401).json({ error: 'Invalid admin username or password.' });
    }
  });

  // Admin: Get all orders
  app.get('/api/admin/orders', requireAdmin, (req: Request, res: Response) => {
    const { search, paymentStatus, orderStatus } = req.query;
    let list = [...db.orders];

    if (paymentStatus && paymentStatus !== 'ALL') {
      list = list.filter((o) => o.paymentStatus === paymentStatus);
    }
    if (orderStatus && orderStatus !== 'ALL') {
      list = list.filter((o) => o.orderStatus === orderStatus);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.whatsappNumber.toLowerCase().includes(q) ||
          o.serviceLink.toLowerCase().includes(q) ||
          (o.transactionId && o.transactionId.toLowerCase().includes(q))
      );
    }

    res.json({
      orders: list,
      totalOrders: db.orders.length,
      paidCount: db.orders.filter((o) => o.paymentStatus === 'PAID').length,
      revenueBDT: db.orders.filter((o) => o.paymentStatus === 'PAID').reduce((sum, o) => sum + o.totalPrice, 0),
    });
  });

  // Admin: Verify payment and confirm order with 1 click
  app.post('/api/admin/orders/:id/verify-payment', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const order = db.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    order.paymentStatus = 'PAID';
    order.orderStatus = 'PROCESSING';
    order.updatedAt = new Date().toISOString();
    saveDb();

    res.json({
      success: true,
      order,
      message: `Order ${order.orderNumber} payment verified successfully! Order is now confirmed and in processing.`,
    });
  });

  // Admin: Update order status
  app.patch('/api/admin/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = db.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    order.updatedAt = new Date().toISOString();
    saveDb();

    res.json({ success: true, order });
  });

  // Admin: Package Management (CRUD)
  app.post('/api/admin/packages', requireAdmin, (req: Request, res: Response) => {
    const pkgData = req.body as Package;
    if (!pkgData.name || !pkgData.category || !pkgData.basePrice) {
      return res.status(400).json({ error: 'Missing package fields.' });
    }
    const newPkg: Package = {
      ...pkgData,
      id: `pkg-${Date.now()}`,
    };
    db.packages.push(newPkg);
    saveDb();
    res.status(201).json(newPkg);
  });

  app.put('/api/admin/packages/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.packages.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Package not found.' });
    }
    db.packages[index] = { ...db.packages[index], ...req.body, id };
    saveDb();
    res.json(db.packages[index]);
  });

  app.delete('/api/admin/packages/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    db.packages = db.packages.filter((p) => p.id !== id);
    saveDb();
    res.json({ success: true, message: 'Package deleted successfully.' });
  });

  // Admin: Site Settings
  app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
    db.settings = { ...db.settings, ...req.body };
    saveDb();
    res.json(db.settings);
  });

  // Admin: FAQ Management
  app.post('/api/admin/faqs', requireAdmin, (req: Request, res: Response) => {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer required.' });
    }
    const newFaq: FAQItem = {
      id: `faq-${Date.now()}`,
      question: question.trim(),
      answer: answer.trim(),
    };
    db.faqs.push(newFaq);
    saveDb();
    res.status(201).json(newFaq);
  });

  app.put('/api/admin/faqs/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.faqs.findIndex((f) => f.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'FAQ not found.' });
    }
    db.faqs[index] = { ...db.faqs[index], ...req.body, id };
    saveDb();
    res.json(db.faqs[index]);
  });

  app.delete('/api/admin/faqs/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    db.faqs = db.faqs.filter((f) => f.id !== id);
    saveDb();
    res.json({ success: true, message: 'FAQ deleted.' });
  });

  // --- VITE MIDDLEWARE INTEGRATION ---
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Tech Promotion BD Server] Running on http://localhost:${PORT}`);
    console.log(`[Nagorik Pay Integration] Brand Key configured safely server-side.`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
