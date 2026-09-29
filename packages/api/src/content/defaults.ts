import type { SiteContent } from "./schema";

/**
 * Fallback content. Used when a section has no row in `site_content` yet, or
 * when the database cannot be reached, so the site always renders.
 * Sourced from shsuman.com.np and the current CV.
 */
export const defaultContent: SiteContent = {
  profile: {
    name: "Suman K. Sharma",
    role: "IT & Cybersecurity Engineer, Consultant & Trainer",
    currentTitle: "Executive Director",
    currentCompany: "Insight Technology Pvt. Ltd.",
    location: "Kathmandu, Nepal",
    highlightRole: "Vice President, npCert",
    portraitUrl: "https://www.shsuman.com.np/images/suman-sharma.jpeg",
    portraitAlt: "Portrait of Suman K. Sharma, IT & Cybersecurity Engineer, Consultant & Trainer",
    cvUrl: "/suman-k-sharma-cv.pdf",
  },
  hero: {
    flipPrefix: "IT & Cybersecurity",
    flipWords: ["Engineer", "Consultant", "Trainer"],
    lead: "18+ years securing and running IT infrastructure for government, banking, aviation and education organizations in Nepal and abroad — from IS/IT audits and risk management to executive leadership.",
    stats: [
      { value: "18+", label: "Years in IT & security" },
      { value: "50+", label: "Projects delivered" },
      { value: "Global", label: "Service reach" },
    ],
  },
  about: {
    title: "Security‑minded engineer, trusted advisor.",
    summary:
      "Results-driven IT & Cybersecurity Engineer with extensive experience in IT infrastructure management, cybersecurity, IT/IS audits, and executive leadership. Adept at strategic planning, risk management, and team supervision, with a strong technical background in network administration, server management, and cybersecurity best practices.",
    passion: "Passionate about research, continuous learning, and contributing to cybersecurity training initiatives.",
    facts: [
      { term: "Currently", detail: "Executive Director, Insight Technology Pvt. Ltd." },
      { term: "Community", detail: "Vice President, npCert" },
      { term: "Education", detail: "B.Sc. Computer Networking & IT Security" },
      { term: "Based in", detail: "Kathmandu, Nepal" },
    ],
    interests: [
      "Poetry",
      "Literature",
      "Research",
      "Travel",
      "Hiking",
      "Training",
      "Technical documentation",
      "Knowledge sharing",
    ],
  },
  services: {
    title: "What I help organizations with.",
    lead: "Advisory, training and hands-on delivery across security, infrastructure and technology policy.",
    items: [
      {
        title: "Cybersecurity Training & IS/IT Audit",
        description:
          "Advanced cybersecurity training programs, IS/IT audits, compliance frameworks and vulnerability assessments that strengthen an organization's security posture.",
        icon: "shield",
        points: ["IS/IT audits", "Vulnerability assessment", "Compliance frameworks", "Security training"],
      },
      {
        title: "Project Consultancy",
        description:
          "Guiding organizational strategy, optimizing operations, overseeing technology acquisition, and driving enterprise-wide cybersecurity and digital transformation.",
        icon: "briefcase",
        points: ["Infrastructure strategy", "Software procurement", "Digital transformation"],
      },
      {
        title: "Policy Advocacy",
        description:
          "Shaping technology policy, contributing to regulatory discussions, and advising on digital governance for secure, scalable and sustainable IT ecosystems.",
        icon: "landmark",
        points: ["Technology policy", "Digital governance", "Open internet"],
      },
    ],
    clientsTitle: "Trusted by public and private institutions",
    clientsDescription:
      "Infrastructure, procurement and security guidance across government, banking, insurance, aviation and education.",
    clients: [
      { name: "Ministry of Finance", sector: "Government" },
      { name: "Nepal Bank Limited", sector: "Banking" },
      { name: "Rastriya Jeevan Beema Company Limited", sector: "Insurance" },
      { name: "Tribhuvan International Airport", sector: "Aviation" },
      { name: "Islington College", sector: "Education" },
      { name: "MIT College", sector: "Education" },
    ],
  },
  work: {
    title: "Key implementations.",
    items: [
      {
        title: "Strategic leadership & risk management",
        description:
          "Defined and executed company vision aligned with cybersecurity and IT best practices. Managed daily operations and resource allocation, ran risk assessments and implemented mitigation strategies.",
        tags: ["Strategy", "Risk management", "Compliance"],
      },
      {
        title: "Enterprise client solutions",
        description:
          "Strategic guidance on infrastructure and software procurement for government, banking, insurance, aviation and education clients.",
        tags: ["Government", "Banking", "Education", "Enterprise"],
      },
      {
        title: "Training & knowledge sharing",
        description:
          "Delivered cybersecurity training initiatives through team supervision, knowledge sharing, leadership and technical documentation across multiple organizations.",
        tags: ["Training", "Cybersecurity", "Documentation"],
      },
    ],
  },
  experience: {
    title: "Career path.",
    lead: "From field IT support to network engineering and executive leadership.",
    jobs: [
      {
        role: "Executive Director",
        company: "Insight Technology Pvt. Ltd.",
        location: "Jawalakhel, Lalitpur",
        period: "Jan 2014 – Present",
        current: true,
        points: [
          "Strategic leadership: defined and executed the company's vision, aligned with cybersecurity and IT best practices.",
          "Operational oversight: managing daily operations and resource allocation.",
          "Risk management & compliance: enforcing cybersecurity policy, running risk assessments and mitigation.",
          "Major clients: Ministry of Finance, Nepal Bank Limited, MIT College, Islington College, Rastriya Jeevan Beema Company Limited, TIA.",
        ],
      },
      {
        role: "Trainer & Consultant",
        company: "Insight Technology Pvt. Ltd.",
        location: "Lalitpur, Nepal",
        period: "Ongoing",
        current: true,
        points: [
          "Consultant: strategic guidance on infrastructure, software procurement and cybersecurity across multiple organizations.",
          "Trainer: cybersecurity training through team supervision, knowledge sharing, leadership and technical documentation.",
        ],
      },
      {
        role: "Network Engineer",
        company: "Broadlink Network & Communication Pvt. Ltd.",
        location: "Sanepa, Lalitpur",
        period: "Jan 2011 – Dec 2013",
        current: false,
        points: [
          "Wireless ISP: managed the wireless network, administration and monitoring.",
          "Planned and supervised implementation work by junior engineers.",
          "Diagnosed and resolved hardware and software issues across all networks.",
        ],
      },
      {
        role: "IT Support Specialist",
        company: "KBR Inc.",
        location: "Houston, Texas, U.S. · Camp Liberty, Baghdad, Iraq",
        period: "Oct 2006 – Jul 2009",
        current: false,
        points: [
          "Provided user support, server administration and network infrastructure maintenance.",
          "Applied strategic planning to improve system reliability and security.",
        ],
      },
    ],
  },
  credentials: {
    title: "Education, leadership & core skills.",
    education: [
      {
        degree: "B.Sc. Computer Networking & IT Security",
        school: "London Metropolitan University",
        location: "Kathmandu",
        year: "2012",
      },
      {
        degree: "Foundation Certificate for Higher Education",
        school: "Informatics Academy",
        location: "Kathmandu",
        year: "2009",
      },
    ],
    community: [
      {
        role: "Vice President",
        org: "npCert",
        detail: "Information Security Response Team Nepal",
        logoUrl: "https://www.shsuman.com.np/images/npcert.jpg",
      },
      {
        role: "Founding Board Member",
        org: "Internet Society (ISOC) Nepal Chapter",
        detail: "Open Internet Nepal",
        logoUrl: "https://www.shsuman.com.np/images/isoc.png",
      },
      {
        role: "IT Consultant",
        org: "Baglung Samaj Canada",
        detail: "Canada",
        logoUrl: "https://www.shsuman.com.np/images/baglung-samaj.png",
      },
      {
        role: "Member",
        org: "CAN Federation",
        detail: "Federation of Computer Association Nepal",
        logoUrl: "https://www.shsuman.com.np/images/can.jpg",
      },
    ],
    skills: [
      "Strategic leadership",
      "IT & cybersecurity management",
      "Stakeholder engagement",
      "IS/IT audit, risk management & compliance",
      "Technical & financial management",
      "Problem solving & collaboration",
    ],
  },
  blog: {
    title: "Notes from the field.",
    lead: "Writing on security, audits, training and technology policy.",
  },
  contact: {
    title: "Let's strengthen your security posture.",
    lead: "Ready to strengthen your organization's IT infrastructure and cybersecurity? Reach out for advisory, audits or training.",
    email: "contact@shsuman.com.np",
    location: "Nagarjun 09, Syuchatar, Kathmandu, Nepal 44600",
    links: [
      { label: "Email", detail: "contact@shsuman.com.np", href: "mailto:contact@shsuman.com.np" },
      { label: "Call", detail: "+977 98541538467 · WhatsApp / Viber", href: "tel:+97798541538467" },
      {
        label: "LinkedIn",
        detail: "linkedin.com/in/suman-sharma-a4611780",
        href: "https://www.linkedin.com/in/suman-sharma-a4611780",
      },
      { label: "Facebook", detail: "facebook.com/sharmadsp", href: "http://www.facebook.com/in/sharmadsp" },
    ],
  },
  footer: {
    blurb: "IT & cybersecurity engineer, consultant and trainer based in **Kathmandu, Nepal**.",
    links: [
      { label: "Blog", href: "/blog/" },
      { label: "Resources", href: "/resources/" },
      { label: "Contact", href: "/#contact" },
    ],
    note: "All rights reserved.",
  },
  seo: {
    title: "Suman K. Sharma — IT & Cybersecurity Engineer, Consultant & Trainer",
    description:
      "Suman K. Sharma is an IT & cybersecurity engineer, consultant and trainer in Kathmandu, Nepal, with 18+ years in infrastructure, IS/IT audit and risk management.",
    ogImage: "https://www.shsuman.com.np/images/suman-sharma.jpeg",
    sameAs: ["https://www.linkedin.com/in/suman-sharma-a4611780", "http://www.facebook.com/in/sharmadsp"],
  },
};
