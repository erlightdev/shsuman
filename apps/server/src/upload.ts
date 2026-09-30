import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fromNodeHeaders } from "better-auth/node";
import { type Request, type Response, Router } from "express";
import multer from "multer";

import { auth } from "./services";
import { ENV } from "./env.server";

export const uploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.resolve(
      process.cwd().endsWith("apps/server")
        ? path.join(process.cwd(), "uploads")
        : path.join(process.cwd(), "apps/server/uploads")
    );

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .slice(0, 40);
    const uniqueName = `${Date.now()}-${randomUUID().slice(0, 8)}-${sanitizedBase}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedMime = /^(image\/(jpeg|png|webp|gif|svg\+xml)|application\/pdf)$/i;
    if (allowedMime.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images (JPEG, PNG, WebP, GIF, SVG) and PDF documents are allowed"));
    }
  },
});

export const uploadRouter = Router();

uploadRouter.post("/", async (req: Request, res: Response): Promise<void> => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user) {
    res.status(401).json({ error: "Unauthorized. Please log in." });
    return;
  }

  upload.single("file")(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message || "Failed to upload file" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    const serverBase = (
      process.env.PUBLIC_SERVER_URL ||
      process.env.BETTER_AUTH_URL ||
      (ENV as unknown as Record<string, string>).BETTER_AUTH_URL ||
      "http://localhost:3000"
    ).replace(/\/$/, "");
    const fileUrl = `${serverBase}/uploads/${req.file.filename}`;

    res.status(200).json({
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  });
});
