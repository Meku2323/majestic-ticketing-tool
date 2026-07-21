import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding process...');

  // 1. Clean out existing records to guarantee predictable execution
  await prisma.vote.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.system.deleteMany({});

  // 2. Generate secure passwords for our triage team
  const adminPasswordHash = await bcrypt.hash('AdminSecurePass2026!', 12);
  const triagerPasswordHash = await bcrypt.hash('TriagerSecurePass2026!', 12);

  // 3. Seed Users (Internal Triage Team)
  const adminUser = await prisma.user.create({
    data: {
      name: 'Executive Administrator',
      email: 'admin@internal.tickets',
      password_hash: adminPasswordHash,
      role: 'admin',
    },
  });

  const staffTriager = await prisma.user.create({
    data: {
      name: 'John Doe Triage Specialist',
      email: 'johndoe@internal.tickets',
      password_hash: triagerPasswordHash,
      role: 'triager',
    },
  });

  console.log('✅ Internal Triage Users seeded successfully.');

  // 4. Seed Registered Host Systems
  const systemA = await prisma.system.create({
    data: {
      name: 'ERP Internal Core Portal',
      api_key: 'wgt_k_erp_prod_7719ab22cd884019e055f2',
      allowed_origin: 'https://internal-company.com',
    },
  });

  const systemB = await prisma.system.create({
    data: {
      name: 'Customer Support Dashboard',
      api_key: 'wgt_k_cs_prod_3110de55fa9911e3b284aa',
      allowed_origin: 'https://internal-company.com',
    },
  });

  console.log('✅ Target Client Host Systems seeded successfully.');

  // 5. Seed Core Sample Tickets
  const bugTicket = await prisma.ticket.create({
    data: {
      system_id: systemA.id,
      type: 'bug',
      title: 'Checkout billing form crashes on submissions containing zero value cents',
      description: 'Steps to reproduce:\n1. Open checkout pipeline.\n2. Apply 100% discount voucher code.\n3. Hit submit.\n4. App throws an unhandled client error window.',
      status: 'new',
      priority: 'high',
      severity: 'major',
      reporter_name: 'Sarah Connor',
      reporter_email: 'sconnor@internal-company.com',
      reporter_role: 'Procurement Specialist',
      page_url: 'https://internal-company.com/checkout/billing',
      browser_info: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
  });

  const featureTicket = await prisma.ticket.create({
    data: {
      system_id: systemB.id,
      type: 'feature_request',
      title: 'Add bulk CSV export functionality to user records data grid',
      description: 'We need a mechanism to download filtered user datagrid tables directly into standard CSV file outputs to support weekly auditing workflows.',
      status: 'triaged',
      priority: 'medium',
      reporter_name: 'Alex Mercer',
      reporter_email: 'amercer@internal-company.com',
      reporter_role: 'Operations Supervisor',
      page_url: 'https://internal-company.com/users/directory',
      browser_info: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
      assigned_to: staffTriager.id,
    },
  });

  console.log('✅ Baseline sample tickets loaded into memory.');

  // 6. Seed Sub-relations (Comments & Attachments)
  await prisma.comment.createMany({
    data: [
      {
        ticket_id: bugTicket.id,
        author_id: null, // System generated log entry
        body: 'System Notification: Ticket initialization recorded via widget entry.',
        is_internal: true,
      },
      {
        ticket_id: featureTicket.id,
        author_id: staffTriager.id,
        body: 'Investigating database performance metrics for high-volume execution of this CSV generator rule.',
        is_internal: true,
      },
    ],
  });

  await prisma.attachment.create({
    data: {
      ticket_id: bugTicket.id,
      file_path: 'storage/uploads/2026/07/err_canvas_frame_44102.png',
      file_type: 'image/png',
      source: 'captured_screenshot',
    },
  });

  console.log('✅ Audit timelines and attachment paths tied to tickets.');
  console.log('🚀 Database seeding completely finished without execution failures.');
}

main()
  .catch((e) => {
    console.error('❌ An execution error halted the seeding pipeline:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
