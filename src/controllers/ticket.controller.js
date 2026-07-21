import prisma from '../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 1. Setup local disk storage pipeline variables
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './storage/uploads/';
    // Verify physical directory paths exist in memory space before writing
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `capture-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Strict upload guardrails checklist parameters configuration
export const uploadInterceptor = multer({
  storage: storageConfig,
  limits: { fileSize: 5 * 1024 * 1024 }, // Exact 5MB block threshold cap limit
  fileFilter: (req, file, cb) => {
    const permittedTypes = /jpeg|jpg|png|webp/;
    const extMatch = permittedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeMatch = permittedTypes.test(file.mimetype);
    if (extMatch && mimeMatch) return cb(null, true);
    cb(new Error("File Upload Violation: Only images are permitted."));
  }
}).single('screenshot');

// Status transition state machine blueprint map rules
const ALLOWED_STATUS_TRANSITIONS = {
  new: ['triaged', 'duplicate', 'wont_fix'],
  triaged: ['in_progress', 'blocked', 'wont_fix'],
  in_progress: ['done', 'blocked', 'wont_fix'],
  blocked: ['in_progress'],
  done: [],
  wont_fix: [],
  duplicate: []
};

// 2. Transmit ticket information AND binary imagery relational links simultaneously
export async function createTicket(req, res, next) {
  // Wrap core initialization inside the file extraction interceptor pipeline layer
  uploadInterceptor(req, res, async function (err) {
    if (err) return res.status(400).json({ error: err.message });

    try {
      const { type, title, description, reporter_name, reporter_email, reporter_role, page_url, browser_info } = req.body;
      const systemId = req.targetSystem.id; 

      if (!type || !title || !description || !page_url || !browser_info) {
        return res.status(400).json({ error: 'Validation Fault: Missing required ticket attributes.' });
      }

      const newTicket = await prisma.$transaction(async (tx) => {
        const ticket = await tx.ticket.create({
          data: {
            system_id: systemId,
            type,
            title,
            description,
            status: 'new',
            reporter_name,
            reporter_email,
            reporter_role,
            page_url,
            browser_info
          }
        });

        // Write audit log trail entry
        await tx.comment.create({
          data: {
            ticket_id: ticket.id,
            body: 'System Log: Ticket successfully recorded via external origin embedded widget configuration asset.',
            is_internal: true
          }
        });

        // If the user appended an in-browser viewport screen asset, commit it dynamically now
        if (req.file) {
          await tx.attachment.create({
            data: {
              ticket_id: ticket.id,
              file_path: req.file.path,
              file_type: req.file.mimetype,
              source: 'captured_screenshot' // Explicit tracking badge identity configuration string
            }
          });
        }

        return ticket;
      });

      return res.status(201).json({
        message: 'Ticket recorded successfully.',
        ticketReference: `#${req.targetSystem.name.substring(0,3).toUpperCase()}-${newTicket.id}`,
        data: newTicket
      });
    } catch (error) {
      next(error);
    }
  });
}

// 3. Keep all other dashboard read methods functional (As mapped during Phase 2)
export async function getAllTickets(req, res, next) {
  try {
    const { system_id, type, status, priority } = req.query;
    const filterConditions = {};
    if (system_id) filterConditions.system_id = parseInt(system_id);
    if (type) filterConditions.type = type;
    if (status) filterConditions.status = status;
    if (priority) filterConditions.priority = priority;

    const tickets = await prisma.ticket.findMany({
      where: filterConditions,
      include: {
        system: { select: { name: true } },
        attachments: { select: { id: true, source: true, file_type: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    return res.status(200).json({ count: tickets.length, data: tickets });
  } catch (error) { next(error); }
}

export async function getTicketById(req, res, next) {
  try {
    const { id } = req.params;
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(id) },
      include: { system: true, attachments: true, comments: { orderBy: { created_at: 'asc' } } }
    });
    if (!ticket) return res.status(404).json({ error: 'Target Ticket instance reference not located.' });
    return res.status(200).json({ data: ticket });
  } catch (error) { next(error); }
}

export async function updateTicketStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status: nextStatus, priority, assigned_to } = req.body;
    const targetId = parseInt(id);

    const dynamicTicket = await prisma.ticket.findUnique({ where: { id: targetId } });
    if (!dynamicTicket) return res.status(404).json({ error: 'Target Ticket modification base path missing.' });

    const currentStatus = dynamicTicket.status;

    if (nextStatus && currentStatus !== nextStatus) {
      const permittedStates = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
      if (!permittedStates.includes(nextStatus)) {
        return res.status(422).json({
          error: `Workflow State Rule Rejection: Transition path from state [${currentStatus}] to state [${nextStatus}] is forbidden.`
        });
      }
    }

    const updatedTicket = await prisma.$transaction(async (tx) => {
      const updated = await tx.ticket.update({
        where: { id: targetId },
        data: {
          ...(nextStatus && { status: nextStatus }),
          ...(priority && { priority }),
          ...(assigned_to && { assigned_to: parseInt(assigned_to) })
        }
      });

      if (nextStatus && currentStatus !== nextStatus) {
        await tx.comment.create({
          data: {
            ticket_id: targetId,
            body: `System Update Log: Operational workflow status mutated from [${currentStatus}] to [${nextStatus}].`,
            is_internal: true
          }
        });
      }
      return updated;
    });

    return res.status(200).json({ message: 'Ticket alterations committed successfully.', data: updatedTicket });
  } catch (error) { next(error); }
}
