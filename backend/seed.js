/**
 * Seed script — run once against production Atlas:
 *   MONGO_URI="mongodb+srv://..." node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Job = require('./models/Job');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not set'); process.exit(1); }

const hash = (p) => bcrypt.hash(p, 10);

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  /* ── Employers ── */
  const employers = await User.insertMany([
    {
      name: 'Achraf Elssoussi',
      email: 'achraf@hirely.io',
      password: await hash('Password123!'),
      role: 'employer',
      companyName: 'Achrafcodes Studio',
      companyDesc: 'Full-stack development studio building products people love.',
      website: 'https://github.com/Achrafcodes',
      isVerified: true,
    },
    {
      name: 'Youssef Benali',
      email: 'youssef@atlastech.ma',
      password: await hash('Password123!'),
      role: 'employer',
      companyName: 'AtlasTech',
      companyDesc: 'Moroccan SaaS company building HR tools for North Africa.',
      website: 'https://atlastech.ma',
      isVerified: true,
    },
    {
      name: 'Fatima Zahra Moussaoui',
      email: 'fz@casacloud.ma',
      password: await hash('Password123!'),
      role: 'employer',
      companyName: 'CasaCloud',
      companyDesc: 'Cloud infrastructure services headquartered in Casablanca.',
      website: 'https://casacloud.ma',
      isVerified: true,
    },
    {
      name: 'Amine Tazi',
      email: 'amine@noorpay.io',
      password: await hash('Password123!'),
      role: 'employer',
      companyName: 'NoorPay',
      companyDesc: 'Fintech startup enabling instant cross-border payments in MENA.',
      website: 'https://noorpay.io',
      isVerified: true,
    },
  ]);

  console.log(`Created ${employers.length} employers`);

  /* ── Candidates ── */
  await User.insertMany([
    {
      name: 'Mehdi Alaoui',
      email: 'mehdi.alaoui@gmail.com',
      password: await hash('Password123!'),
      role: 'candidate',
      location: 'Casablanca, Morocco',
      bio: 'Full-stack developer with 4 years of experience in React and Node.js.',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
      isVerified: true,
    },
    {
      name: 'Salma Benkiran',
      email: 'salma.benkiran@gmail.com',
      password: await hash('Password123!'),
      role: 'candidate',
      location: 'Rabat, Morocco',
      bio: 'UI/UX designer passionate about accessible, human-centred design.',
      skills: ['Figma', 'Tailwind CSS', 'React', 'Accessibility'],
      isVerified: true,
    },
    {
      name: 'Omar Cherkaoui',
      email: 'omar.cherkaoui@gmail.com',
      password: await hash('Password123!'),
      role: 'candidate',
      location: 'Marrakech, Morocco',
      bio: 'DevOps engineer specialising in CI/CD pipelines and cloud infrastructure.',
      skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
      isVerified: true,
    },
    {
      name: 'Nadia Raji',
      email: 'nadia.raji@gmail.com',
      password: await hash('Password123!'),
      role: 'candidate',
      location: 'Fes, Morocco',
      bio: 'Backend engineer with a love for clean APIs and distributed systems.',
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis'],
      isVerified: true,
    },
    {
      name: 'Hamza Idrissi',
      email: 'hamza.idrissi@gmail.com',
      password: await hash('Password123!'),
      role: 'candidate',
      location: 'Tangier, Morocco',
      bio: 'Mobile developer building cross-platform apps with React Native and Flutter.',
      skills: ['React Native', 'Flutter', 'Firebase', 'TypeScript'],
      isVerified: true,
    },
  ]);

  console.log('Created 5 candidates');

  /* ── Jobs ── */
  const [achraf, atlastech, casacloud, noorpay] = employers;

  await Job.insertMany([
    // Achrafcodes Studio
    {
      employer: achraf._id,
      title: 'Full-Stack Developer',
      description: `We're looking for a full-stack developer to join Achrafcodes Studio and help build our next generation of web products.\n\nYou'll work across the entire stack — React on the front end, Node.js + Express on the back end, MongoDB for storage — and have real ownership of features from design to deployment.\n\nWe value clean code, fast shipping, and a great developer experience.`,
      location: 'Remote',
      type: 'full-time',
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
      salaryMin: 40000,
      salaryMax: 65000,
      status: 'active',
    },
    {
      employer: achraf._id,
      title: 'Frontend Engineer (React)',
      description: `Join Achrafcodes Studio as a frontend engineer.\n\nYou'll be responsible for building pixel-perfect UIs, implementing design systems, and ensuring great performance across devices.\n\nWe use React 19, Tailwind CSS, and Vite. Remote-first culture, async-friendly.`,
      location: 'Remote',
      type: 'remote',
      skills: ['React', 'Tailwind CSS', 'Vite', 'Figma'],
      salaryMin: 35000,
      salaryMax: 55000,
      status: 'active',
    },

    // AtlasTech
    {
      employer: atlastech._id,
      title: 'Product Manager — HR Tools',
      description: `AtlasTech is hiring a Product Manager to own our HR platform roadmap.\n\nYou'll work with engineering, design, and customer success to define and ship features that help Moroccan and North African companies manage their teams better.\n\nExperience with B2B SaaS products is a strong plus.`,
      location: 'Casablanca, Morocco',
      type: 'full-time',
      skills: ['Product Management', 'B2B SaaS', 'Agile', 'User Research'],
      salaryMin: 50000,
      salaryMax: 75000,
      status: 'active',
    },
    {
      employer: atlastech._id,
      title: 'Backend Engineer (Python)',
      description: `We need a backend engineer to help scale our Django-based API as we grow across North Africa.\n\nYou'll work on API design, database optimisation, and integrations with payroll providers.\n\nStrong Python skills required. PostgreSQL experience is a plus.`,
      location: 'Casablanca, Morocco',
      type: 'full-time',
      skills: ['Python', 'Django', 'PostgreSQL', 'REST APIs'],
      salaryMin: 45000,
      salaryMax: 70000,
      status: 'active',
    },

    // CasaCloud
    {
      employer: casacloud._id,
      title: 'DevOps Engineer',
      description: `CasaCloud is growing its infrastructure team and we're looking for a DevOps engineer to help us build and maintain reliable cloud systems.\n\nYou'll manage Kubernetes clusters, build CI/CD pipelines, and ensure 99.9% uptime for our clients.\n\nAWS or GCP experience required. Terraform knowledge is a strong plus.`,
      location: 'Casablanca, Morocco',
      type: 'full-time',
      skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
      salaryMin: 55000,
      salaryMax: 85000,
      status: 'active',
    },
    {
      employer: casacloud._id,
      title: 'Cloud Solutions Architect (Contract)',
      description: `We're looking for a contract Cloud Solutions Architect to help design the migration of a legacy on-premise system to AWS for one of our enterprise clients.\n\nEngagement is 3–6 months. Remote work possible with occasional on-site visits in Casablanca.`,
      location: 'Remote / Casablanca',
      type: 'contract',
      skills: ['AWS', 'Cloud Architecture', 'Migration', 'Enterprise'],
      salaryMin: 70000,
      salaryMax: 100000,
      status: 'active',
    },

    // NoorPay
    {
      employer: noorpay._id,
      title: 'Senior React Native Developer',
      description: `NoorPay is building the fastest cross-border payment app in MENA and we need a senior React Native developer to lead our mobile team.\n\nYou'll own the mobile codebase, set architecture decisions, and mentor junior developers.\n\nWe offer competitive salary, equity, and a remote-first environment.`,
      location: 'Remote',
      type: 'full-time',
      skills: ['React Native', 'TypeScript', 'Redux', 'Mobile'],
      salaryMin: 65000,
      salaryMax: 95000,
      status: 'active',
    },
    {
      employer: noorpay._id,
      title: 'Compliance & Fintech Analyst',
      description: `As Compliance Analyst at NoorPay you will ensure our operations meet regulatory requirements across Morocco, the UAE, and France.\n\nYou'll work closely with legal counsel, banking partners, and our engineering team to maintain licences and manage AML/KYC workflows.`,
      location: 'Rabat, Morocco',
      type: 'full-time',
      skills: ['Compliance', 'AML', 'KYC', 'Fintech', 'Regulation'],
      salaryMin: 45000,
      salaryMax: 65000,
      status: 'active',
    },
    {
      employer: noorpay._id,
      title: 'Part-Time Community Manager',
      description: `NoorPay is looking for a part-time Community Manager to grow our presence across social media and engage our user base in Morocco and the broader MENA region.\n\nFlexible hours, remote work. Arabic and French language skills are a strong plus.`,
      location: 'Remote',
      type: 'part-time',
      skills: ['Social Media', 'Community', 'Content', 'Arabic', 'French'],
      salaryMin: 15000,
      salaryMax: 25000,
      status: 'active',
    },
  ]);

  console.log('Created 9 jobs');
  console.log('\nSeed complete ✓');
  console.log('\nEmployer login: achraf@hirely.io / Password123!');
  console.log('Candidate login: mehdi.alaoui@gmail.com / Password123!');
  await mongoose.disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
