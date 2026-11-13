
// import 'dotenv/config';
// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import multer from 'multer';
// import rateLimit from 'express-rate-limit';
// import { v2 as cloudinary } from 'cloudinary';

// import Product from './models/Product.js';
// import Admin from './models/Admin.js';
// import { requireAdmin } from './middleware/auth.js';

// const app = express();

// const origins = (
//   process.env.CORS_ORIGINS ||
//   'http://localhost:5173,http://localhost:5174'
// ).split(',').map(x => x.trim());

// app.use(cors({
//   origin(origin, callback) {
//     if (!origin || origins.includes(origin)) {
//       return callback(null, true);
//     }
//     return callback(new Error('Origin not allowed by CORS'));
//   }
// }));

// app.use(express.json({ limit: '1mb' }));

// app.use('/api/auth', rateLimit({
//   windowMs: 15 * 60 * 1000,
//   limit: 20,
//   standardHeaders: true,
//   legacyHeaders: false
// }));

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // Store uploaded images temporarily in memory.
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 }
// });

// // Upload an image directly through Cloudinary SDK.
// function uploadToCloudinary(buffer) {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       {
//         folder: 'kr-boutique',
//         resource_type: 'image',
//         transformation: [{
//           width: 1400,
//           height: 1800,
//           crop: 'limit',
//           quality: 'auto',
//           fetch_format: 'auto'
//         }]
//       },
//       (error, result) => {
//         if (error) return reject(error);
//         resolve(result.secure_url);
//       }
//     );

//     stream.end(buffer);
//   });
// }

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok', message: 'KR Boutique API is running' });
// });

// // Public product listing
// app.get('/api/products', async (req, res) => {
//   try {
//     const products = await Product.find()
//       .sort({ createdAt: -1 })
//       .lean();

//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: 'Unable to load products' });
//   }
// });

// // Admin login
// app.post('/api/auth/login', async (req, res) => {
//   try {
//     const email = String(req.body.email || '').toLowerCase().trim();
//     const password = String(req.body.password || '');

//     const admin = await Admin.findOne({ email });

//     if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
//       return res.status(401).json({
//         message: 'Invalid email or password'
//       });
//     }

//     const token = jwt.sign(
//       {
//         sub: admin._id.toString(),
//         role: 'admin'
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: process.env.JWT_EXPIRES_IN || '8h'
//       }
//     );

//     res.json({
//       token,
//       admin: { email: admin.email }
//     });

//   } catch (error) {
//     res.status(500).json({ message: 'Login failed' });
//   }
// });

// // Add product — admin only
// app.post(
//   '/api/products',
//   requireAdmin,
//   upload.single('image'),
//   async (req, res) => {
//     try {
//       const { name, category, price, description } = req.body;

//       if (!name || !category || price === undefined ||
//           !Number.isFinite(Number(price)) || Number(price) < 0) {
//         return res.status(400).json({
//           message: 'Name, category and a valid price are required'
//         });
//       }

//       let image = '';

//       if (req.file) {
//         if (
//           !process.env.CLOUDINARY_CLOUD_NAME ||
//           !process.env.CLOUDINARY_API_KEY ||
//           !process.env.CLOUDINARY_API_SECRET
//         ) {
//           return res.status(500).json({
//             message: 'Cloudinary is not configured in backend .env'
//           });
//         }

//         image = await uploadToCloudinary(req.file.buffer);
//       }

//       const product = await Product.create({
//         name,
//         category,
//         price: Number(price),
//         description,
//         image
//       });

//       res.status(201).json(product);

//     } catch (error) {
//       console.error('Product creation error:', error);
//       res.status(500).json({
//         message: error.message || 'Product creation failed'
//       });
//     }
//   }
// );

// // Update product — admin only
// app.patch('/api/products/:id', requireAdmin, async (req, res) => {
//   try {
//     const allowed = {};

//     for (const key of ['name', 'category', 'description', 'inStock']) {
//       if (req.body[key] !== undefined) {
//         allowed[key] = req.body[key];
//       }
//     }

//     if (req.body.price !== undefined) {
//       allowed.price = Number(req.body.price);
//     }

//     const product = await Product.findByIdAndUpdate(
//       req.params.id,
//       allowed,
//       { new: true, runValidators: true }
//     );

//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     res.json(product);

//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // Delete product — admin only
// app.delete('/api/products/:id', requireAdmin, async (req, res) => {
//   try {
//     const product = await Product.findByIdAndDelete(req.params.id);

//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     res.json({ message: 'Product deleted successfully' });

//   } catch (error) {
//     res.status(400).json({ message: 'Invalid product ID' });
//   }
// });

// // Error handling
// app.use((error, req, res, next) => {
//   if (error instanceof multer.MulterError) {
//     return res.status(400).json({ message: error.message });
//   }

//   console.error(error);
//   res.status(400).json({
//     message: error.message || 'Request failed'
//   });
// });

// // Connect database and start server
// async function startServer() {
//   try {
//     if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
//       throw new Error('MONGODB_URI and JWT_SECRET must be configured in .env');
//     }

//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log('MongoDB connected successfully');

    
// if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
//   const email = process.env.ADMIN_EMAIL.toLowerCase().trim();

//   const existingAdmin = await Admin.findOne({ email });

//   if (!existingAdmin) {
//     const passwordHash = await bcrypt.hash(
//       process.env.ADMIN_PASSWORD,
//       12
//     );

//     await Admin.create({
//       email,
//       passwordHash,
//       role: 'admin'
//     });

//     console.log(`Admin account created: ${email}`);
//   } else {
//     console.log('Existing admin account retained. Password unchanged.');
//   }
// }


//     const port = process.env.PORT || 5000;

//     app.listen(port, () => {
//       console.log(`KR Boutique API running at http://localhost:${port}`);
//     });

//   } catch (error) {
//     console.error('Server startup failed:', error.message);
//     process.exit(1);
//   }
// }

// startServer();


import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { v2 as cloudinary } from 'cloudinary';

import Product from './models/Product.js';
import Admin from './models/Admin.js';
import { requireAdmin } from './middleware/auth.js';

const app = express();

// ========================================
// CORS CONFIGURATION
// ========================================

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://kr-boutique.vercel.app',
  'https://kr-boutique-hvby4wsfy-abbasel.vercel.app'
];

const envOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const origins = [...new Set([...allowedOrigins, ...envOrigins])];

app.use(cors({
  origin(origin, callback) {
    if (!origin || origins.includes(origin)) {
      return callback(null, true);
    }

    console.error('Blocked CORS origin:', origin);
    return callback(new Error('Origin not allowed by CORS'));
  }
}));

// Handle preflight requests
app.options(/.*/, cors({
  origin(origin, callback) {
    if (!origin || origins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed by CORS'));
  }
}));

// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false
}));

// ========================================
// CLOUDINARY CONFIGURATION
// ========================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'kr-boutique',
        resource_type: 'image',
        transformation: [{
          width: 1400,
          height: 1800,
          crop: 'limit',
          quality: 'auto',
          fetch_format: 'auto'
        }]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}

// ========================================
// HEALTH CHECK
// ========================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'KR Boutique API is running'
  });
});

// ========================================
// PUBLIC PRODUCT LISTING
// ========================================

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(products);

  } catch (error) {
    console.error('Product loading error:', error);

    res.status(500).json({
      message: 'Unable to load products'
    });
  }
});

// ========================================
// ADMIN LOGIN
// ========================================

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '')
      .toLowerCase()
      .trim();

    const password = String(req.body.password || '');

    const admin = await Admin.findOne({ email });

    if (
      !admin ||
      !(await bcrypt.compare(password, admin.passwordHash))
    ) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      {
        sub: admin._id.toString(),
        role: 'admin'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
      }
    );

    res.json({
      token,
      admin: { email: admin.email }
    });

  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      message: 'Login failed'
    });
  }
});

// ========================================
// ADD PRODUCT - ADMIN ONLY
// ========================================

app.post(
  '/api/products',
  requireAdmin,
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, category, price, description } = req.body;

      if (
        !name ||
        !category ||
        price === undefined ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0
      ) {
        return res.status(400).json({
          message: 'Name, category and a valid price are required'
        });
      }

      let image = '';

      if (req.file) {
        if (
          !process.env.CLOUDINARY_CLOUD_NAME ||
          !process.env.CLOUDINARY_API_KEY ||
          !process.env.CLOUDINARY_API_SECRET
        ) {
          return res.status(500).json({
            message: 'Cloudinary is not configured in backend .env'
          });
        }

        image = await uploadToCloudinary(req.file.buffer);
      }

      const product = await Product.create({
        name,
        category,
        price: Number(price),
        description,
        image
      });

      res.status(201).json(product);

    } catch (error) {
      console.error('Product creation error:', error);

      res.status(500).json({
        message: error.message || 'Product creation failed'
      });
    }
  }
);

// ========================================
// UPDATE PRODUCT - ADMIN ONLY
// ========================================

app.patch('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const allowed = {};

    for (const key of [
      'name',
      'category',
      'description',
      'inStock'
    ]) {
      if (req.body[key] !== undefined) {
        allowed[key] = req.body[key];
      }
    }

    if (req.body.price !== undefined) {
      allowed.price = Number(req.body.price);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      allowed,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.json(product);

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// ========================================
// DELETE PRODUCT - ADMIN ONLY
// ========================================

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.json({
      message: 'Product deleted successfully'
    });

  } catch (error) {
    res.status(400).json({
      message: 'Invalid product ID'
    });
  }
});

// ========================================
// ERROR HANDLING
// ========================================

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message: error.message
    });
  }

  console.error('Server error:', error);

  res.status(400).json({
    message: error.message || 'Request failed'
  });
});

// ========================================
// DATABASE CONNECTION & SERVER START
// ========================================

async function startServer() {
  try {
    if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
      throw new Error(
        'MONGODB_URI and JWT_SECRET must be configured in .env'
      );
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected successfully');
    console.log('Allowed CORS origins:', origins);

    // Create admin only if one does not already exist.
    // Existing admin password is never overwritten.

    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const email = process.env.ADMIN_EMAIL
        .toLowerCase()
        .trim();

      const existingAdmin = await Admin.findOne({ email });

      if (!existingAdmin) {
        const passwordHash = await bcrypt.hash(
          process.env.ADMIN_PASSWORD,
          12
        );

        await Admin.create({
          email,
          passwordHash,
          role: 'admin'
        });

        console.log(`Admin account created: ${email}`);

      } else {
        console.log(
          'Existing admin account retained. Password unchanged.'
        );
      }
    }

    const port = process.env.PORT || 5000;

    app.listen(port, () => {
      console.log(`KR Boutique API running on port ${port}`);
    });

  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
