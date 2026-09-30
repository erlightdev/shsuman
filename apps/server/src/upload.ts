import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fromNodeHeaders } from "better-auth/node";
import { type Request, type Response, Router } from "express";
import multer from "multer";

import { hasRole } from "@shsuman/auth/permissions";

import { auth } from "./services";

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

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIME = /^(image\/(jpeg|png|webp|gif|svg\+xml)|application\/pdf)$/i;

function uniqueName(originalName: string) {
  const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, "");
  const base = path
    .basename(originalName, path.extname(originalName))
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 40);
  return `${Date.now()}-${randomUUID().slice(0, 8)}-${base || "file"}${ext}`;
}

/**
 * Site-relative path. The web app proxies /uploads to this server, so the path
 * works on any domain and survives moving content between local and production.
 */
function publicUrl(filename: string) {
  return `/uploads/${filename}`;
}

/** Writes a file to the uploads folder and returns its public URL. Used by the MCP upload tool. */
export async function saveUpload(data: Buffer, originalName: string, mimetype: string) {
  if (!ALLOWED_MIME.test(mimetype)) throw new Error(`File type ${mimetype} is not allowed`);
  if (data.byteLength > MAX_BYTES) throw new Error("File is larger than 20 MB");
  const filename = uniqueName(originalName);
  await fs.promises.writeFile(path.join(uploadsDir, filename), data);
  return { url: publicUrl(filename), filename, originalName, size: data.byteLength, mimetype };
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    cb(null, uniqueName(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.test(file.mimetype)) {
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
  if (!hasRole((session.user as { role?: string | null }).role, "admin", "editor")) {
    res.status(403).json({ error: "Only admins and editors can upload files." });
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

    res.status(200).json({
      url: publicUrl(req.file.filename),
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  });
});
