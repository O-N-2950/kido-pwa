// ============================================================
// KIDO — Voice Check-in Route
// Child sends audio blob → transcription → AI parse → checkin
// ============================================================
import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { transcribeAudio, parseVoiceCheckin } from '../services/voice.service.js';
import { db, schema } from '../db/index.js';
import { applyTrustAction } from '../services/trust.service.js';
import type { Server as SocketServer } from 'socket.io';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export function createVoiceRouter(io: SocketServer) {
  const router = Router();
  router.use(requireAuth);

  // POST /voice/checkin — child sends audio blob
  router.post('/checkin', upload.single('audio'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No audio file' });

    const userId   = req.user!.userId;
    const familyId = req.user!.familyId;

    try {
      // Transcribe with Deepgram
      const transcript = await transcribeAudio(req.file.buffer, req.file.mimetype);
      if (!transcript) return res.status(422).json({ error: 'Could not transcribe audio' });

      // Parse with Claude
      const parsed = await parseVoiceCheckin(transcript);

      // Create checkin
      const [checkin] = await db.insert(schema.checkins).values({
        userId, type: parsed.type, message: parsed.message, etaMinutes: parsed.etaMinutes,
      }).returning();

      // Emit to family
      io.to(`family:${familyId}`).emit('checkin:voice', {
        userId, ...parsed, transcript, id: checkin.id, at: checkin.createdAt,
      });

      await applyTrustAction(userId, 'checkin_sent');

      return res.status(201).json({ transcript, parsed, checkin });
    } catch (e: any) {
      console.error('[voice] Error:', e.message);
      return res.status(500).json({ error: 'Voice processing failed' });
    }
  });

  return router;
}
