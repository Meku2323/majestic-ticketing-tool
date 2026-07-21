import { Router } from 'express';
import { validateWidgetHandshake } from '../middleware/security.middleware.js';
import { 
  createTicket, 
  getAllTickets, 
  getTicketById, 
  updateTicketStatus 
} from '../controllers/ticket.controller.js';

const router = Router();

// Route 1: Widget ticket intake funnel (Guarded by strict API Key verification checks)
router.post('/', validateWidgetHandshake, createTicket);

// Route 2: Administrative operations (These will integrate JWT path filters during Phase 3)
router.get('/', getAllTickets);
router.get('/:id', getTicketById);
router.patch('/:id', updateTicketStatus);

export default router;
