/* Edit project content here. Order on the page = order in this array.
   - repo / demo: paste full URLs. Empty = the button is hidden (a "coming soon" note is shown instead).
   - image: optional screenshot path in assets/images/projects/. Empty = a visible placeholder keeps the slot reserved.
   - draft: true hides a project until you are ready to publish it.
   - cats: cybersecurity | networking | web */
window.PROJECTS = [
  {
    title: 'File Integrity Monitoring System',
    status: 'Security tool',
    cats: ['cybersecurity', 'web'],
    summary: 'A file integrity checker that uses SHA-256 hashing to detect when watched files have changed, so unauthorised modifications are caught immediately.',
    tags: ['SHA-256', 'JavaScript', 'HTML', 'CSS', 'GitHub Pages'],
    repo: 'https://github.com/shalini-810/File-integrity-monitor',
    demo: '',
    image: 'assets/images/projects/file-integrity-monitor.jpg'
  },
  {
    title: 'DecepNet',
    status: 'Hackathon project',
    cats: ['cybersecurity', 'networking'],
    summary: 'A network of decoy honeypot servers that report to a central server, which correlates activity across nodes to detect coordinated attacks.',
    tags: ['Python', 'FastAPI', 'WebSockets', 'React', 'SQLite'],
    repo: 'https://github.com/shalini-810/DecepNet-3',
    demo: '',
    image: 'assets/images/projects/decepnet.jpg'
  },
  {
    title: 'JobVerity',
    status: 'Full-stack web app',
    cats: ['web', 'cybersecurity'],
    summary: 'A website that checks whether a job posting is a scam before you apply. It verifies the posting against real government company records, checks domain ownership, cross-references a shared database of postings other users have already flagged, and then explains the result in plain English.',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Convex', 'Groq API', 'Playwright'],
    repo: '',
    demo: '',
    image: 'assets/images/projects/jobverity.jpg'
  }
];
