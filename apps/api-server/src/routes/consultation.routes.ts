import express from "express";
import { Router } from "express";
import path from "path";
import multer from "multer";
import authMiddleware from "../middleware/auth.middleware";
import { UPLOADS_DIR } from "../lib/uploads";
import {
    createConsultation,
    listConsultations,
    getConsultation,
    sendMessage,
} from "../controllers/consultation.controller";

const EXT_BY_MIME: Record<string, string> = {
    "audio/webm": ".webm",
    "audio/ogg": ".ogg",
    "audio/wav": ".wav",
    "audio/mpeg": ".mp3",
    "audio/mp4": ".m4a",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
};

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (_req, file, cb) => {
        const ext =
            path.extname(file.originalname) || EXT_BY_MIME[file.mimetype] || "";
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
});

const router: Router = express.Router();

router.post("/", authMiddleware, createConsultation);
router.get("/", authMiddleware, listConsultations);
router.get("/:id", authMiddleware, getConsultation);
router.post(
    "/:id/messages",
    authMiddleware,
    upload.fields([
        { name: "audio", maxCount: 1 },
        { name: "media", maxCount: 1 },
    ]),
    sendMessage,
);

export default router;
