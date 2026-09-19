import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const builtInTemplates = [
  {
    name: 'Welcome Newsletter',
    description: 'A warm welcome email for new subscribers',
    category: 'welcome',
    content: `<div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px 30px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:28px;">Welcome Aboard! 🎉</h1>
        <p style="color:#e0e7ff;margin-top:10px;font-size:16px;">We're thrilled to have you with us</p>
      </div>
      <div style="padding:30px;background:#fff;border:1px solid #e5e7eb;">
        <p style="font-size:16px;line-height:1.6;">Hi there,</p>
        <p style="font-size:16px;line-height:1.6;">Thank you for subscribing to our newsletter! You'll be the first to know about our latest updates, tips, and exclusive content.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="#" style="background:#6366f1;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Get Started</a>
        </div>
        <p style="font-size:14px;color:#6b7280;">Stay tuned for amazing content coming your way!</p>
      </div>
      <div style="padding:20px;text-align:center;background:#f9fafb;border-radius:0 0 12px 12px;">
        <p style="font-size:12px;color:#9ca3af;margin:0;">© 2024 Your Company. All rights reserved.</p>
      </div>
    </div>`,
  },
  {
    name: 'Product Update',
    description: 'Announce new features and product updates',
    category: 'product',
    content: `<div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#0ea5e9,#6366f1);padding:40px 30px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:28px;">What's New 🚀</h1>
        <p style="color:#e0f2fe;margin-top:10px;font-size:16px;">Exciting updates just for you</p>
      </div>
      <div style="padding:30px;background:#fff;border:1px solid #e5e7eb;">
        <h2 style="color:#6366f1;font-size:22px;">Feature Highlight</h2>
        <p style="font-size:16px;line-height:1.6;">We've been working hard to bring you new features that make your experience even better.</p>
        <div style="background:#f0f9ff;border-left:4px solid #6366f1;padding:16px;margin:20px 0;border-radius:0 8px 8px 0;">
          <p style="margin:0;font-size:15px;"><strong>✨ New Feature 1</strong> — Description of the amazing new feature</p>
        </div>
        <div style="background:#f0f9ff;border-left:4px solid #8b5cf6;padding:16px;margin:20px 0;border-radius:0 8px 8px 0;">
          <p style="margin:0;font-size:15px;"><strong>⚡ Improvement</strong> — Description of the improvement</p>
        </div>
        <div style="text-align:center;margin:30px 0;">
          <a href="#" style="background:#6366f1;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Learn More</a>
        </div>
      </div>
      <div style="padding:20px;text-align:center;background:#f9fafb;border-radius:0 0 12px 12px;">
        <p style="font-size:12px;color:#9ca3af;margin:0;">© 2024 Your Company. All rights reserved.</p>
      </div>
    </div>`,
  },
  {
    name: 'Weekly Digest',
    description: 'A weekly roundup of content and news',
    category: 'digest',
    content: `<div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:40px 30px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:28px;">Weekly Digest 📬</h1>
        <p style="color:#fef3c7;margin-top:10px;font-size:16px;">Your weekly roundup is here</p>
      </div>
      <div style="padding:30px;background:#fff;border:1px solid #e5e7eb;">
        <h2 style="color:#f59e0b;font-size:20px;">📰 Top Stories</h2>
        <div style="border-bottom:1px solid #e5e7eb;padding:15px 0;">
          <h3 style="margin:0 0 5px;font-size:17px;">Story Title 1</h3>
          <p style="margin:0;font-size:14px;color:#6b7280;">Brief description of the first story...</p>
        </div>
        <div style="border-bottom:1px solid #e5e7eb;padding:15px 0;">
          <h3 style="margin:0 0 5px;font-size:17px;">Story Title 2</h3>
          <p style="margin:0;font-size:14px;color:#6b7280;">Brief description of the second story...</p>
        </div>
        <div style="padding:15px 0;">
          <h3 style="margin:0 0 5px;font-size:17px;">Story Title 3</h3>
          <p style="margin:0;font-size:14px;color:#6b7280;">Brief description of the third story...</p>
        </div>
        <div style="text-align:center;margin:30px 0;">
          <a href="#" style="background:#f59e0b;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Read All Stories</a>
        </div>
      </div>
      <div style="padding:20px;text-align:center;background:#f9fafb;border-radius:0 0 12px 12px;">
        <p style="font-size:12px;color:#9ca3af;margin:0;">© 2024 Your Company. All rights reserved.</p>
      </div>
    </div>`,
  },
  {
    name: 'Event Invitation',
    description: 'Invite subscribers to events and webinars',
    category: 'events',
    content: `<div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#333;">
      <div style="background:linear-gradient(135deg,#10b981,#059669);padding:40px 30px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:28px;">You're Invited! 🎟️</h1>
        <p style="color:#d1fae5;margin-top:10px;font-size:16px;">Join us for something special</p>
      </div>
      <div style="padding:30px;background:#fff;border:1px solid #e5e7eb;">
        <h2 style="color:#10b981;font-size:22px;">Event Details</h2>
        <div style="background:#ecfdf5;padding:20px;border-radius:8px;margin:20px 0;">
          <p style="margin:5px 0;font-size:15px;"><strong>📅 Date:</strong> TBD</p>
          <p style="margin:5px 0;font-size:15px;"><strong>🕐 Time:</strong> TBD</p>
          <p style="margin:5px 0;font-size:15px;"><strong>📍 Location:</strong> Online</p>
        </div>
        <p style="font-size:16px;line-height:1.6;">Join us for an exciting event where you'll learn, connect, and grow. Don't miss out on this opportunity!</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="#" style="background:#10b981;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">RSVP Now</a>
        </div>
      </div>
      <div style="padding:20px;text-align:center;background:#f9fafb;border-radius:0 0 12px 12px;">
        <p style="font-size:12px;color:#9ca3af;margin:0;">© 2024 Your Company. All rights reserved.</p>
      </div>
    </div>`,
  },
  {
    name: 'Minimal Newsletter',
    description: 'Clean, minimal newsletter layout',
    category: 'general',
    content: `<div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#333;">
      <div style="padding:40px 30px;text-align:center;border-bottom:3px solid #6366f1;">
        <h1 style="color:#1f2937;margin:0;font-size:24px;">Newsletter Title</h1>
      </div>
      <div style="padding:30px;">
        <p style="font-size:16px;line-height:1.8;color:#4b5563;">Your newsletter content goes here. Write something compelling that your audience will love.</p>
        <p style="font-size:16px;line-height:1.8;color:#4b5563;">Add more paragraphs, images, or links as needed to create an engaging newsletter.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="#" style="background:#6366f1;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">Read More</a>
        </div>
      </div>
      <div style="padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="font-size:12px;color:#9ca3af;margin:0;">© 2024 Your Company. All rights reserved.</p>
      </div>
    </div>`,
  },
];

async function main() {
  console.log('🌱 Seeding database...\n');

  // 1. Create Super Admin
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@newsletterai.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@newsletterai.com',
      password: adminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`✅ Super Admin created: ${admin.email}`);

  // 2. Create Demo Organization 1
  const demoOrg1 = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      description: 'A leading technology company',
    },
  });
  console.log(`✅ Demo org created: ${demoOrg1.name}`);

  // Create org owner
  const ownerPassword = await bcrypt.hash('Owner@123456', 12);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@acme.com' },
    update: {},
    create: {
      email: 'owner@acme.com',
      password: ownerPassword,
      firstName: 'John',
      lastName: 'Owner',
      role: 'ORG_OWNER',
      organizationId: demoOrg1.id,
    },
  });
  console.log(`✅ Org owner created: ${owner.email}`);

  // Create brand kit
  await prisma.brandKit.upsert({
    where: { organizationId: demoOrg1.id },
    update: {},
    create: {
      companyName: 'Acme Corp',
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      brandDescription: 'Innovative tech solutions for modern businesses',
      writingTone: 'professional',
      audience: 'Tech professionals and business leaders',
      mission: 'To empower businesses with cutting-edge technology',
      organizationId: demoOrg1.id,
    },
  });

  // Create org settings
  await prisma.orgSettings.upsert({
    where: { organizationId: demoOrg1.id },
    update: {},
    create: {
      senderName: 'Acme Corp',
      senderEmail: 'owner@acme.com',
      organizationId: demoOrg1.id,
    },
  });

  // Create demo subscribers
  const subscriberEmails = [
    { email: 'alice@example.com', firstName: 'Alice', lastName: 'Johnson' },
    { email: 'bob@example.com', firstName: 'Bob', lastName: 'Smith' },
    { email: 'carol@example.com', firstName: 'Carol', lastName: 'Williams' },
    { email: 'dave@example.com', firstName: 'Dave', lastName: 'Brown' },
    { email: 'eve@example.com', firstName: 'Eve', lastName: 'Davis' },
  ];

  for (const sub of subscriberEmails) {
    await prisma.subscriber.upsert({
      where: { email_organizationId: { email: sub.email, organizationId: demoOrg1.id } },
      update: {},
      create: { ...sub, organizationId: demoOrg1.id },
    });
  }
  console.log(`✅ ${subscriberEmails.length} demo subscribers created`);

  // 3. Create Demo Organization 2
  const demoOrg2 = await prisma.organization.upsert({
    where: { slug: 'startup-labs' },
    update: {},
    create: {
      name: 'Startup Labs',
      slug: 'startup-labs',
      description: 'Innovation hub for startups',
    },
  });

  const owner2Password = await bcrypt.hash('Owner@123456', 12);
  await prisma.user.upsert({
    where: { email: 'owner@startuplabs.com' },
    update: {},
    create: {
      email: 'owner@startuplabs.com',
      password: owner2Password,
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'ORG_OWNER',
      organizationId: demoOrg2.id,
    },
  });

  await prisma.brandKit.upsert({
    where: { organizationId: demoOrg2.id },
    update: {},
    create: {
      companyName: 'Startup Labs',
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      writingTone: 'casual',
      organizationId: demoOrg2.id,
    },
  });

  await prisma.orgSettings.upsert({
    where: { organizationId: demoOrg2.id },
    update: {},
    create: {
      senderName: 'Startup Labs',
      senderEmail: 'owner@startuplabs.com',
      organizationId: demoOrg2.id,
    },
  });

  console.log(`✅ Demo org created: ${demoOrg2.name}`);

  // 4. Create Built-in Templates
  for (const template of builtInTemplates) {
    await prisma.template.upsert({
      where: { id: template.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        ...template,
        isBuiltIn: true,
      },
    });
  }
  console.log(`✅ ${builtInTemplates.length} built-in templates created`);

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
