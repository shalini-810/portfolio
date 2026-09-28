/* Edit competition / certification content here.
   Cards are generated from this list, so adding an event only means adding one object.
   The page order matches the array order.

   - cats            -> which filter it belongs to. Required for filtering to work:
                        hackathons | certifications | others (you can list more than one)
   - year / type      -> the small line above the title, e.g. "2026 · Hackathon"
   - result           -> the outcome. It is shown on the FRONT so a recruiter sees it
                          without clicking. e.g. "3rd Place — Cash Prize", "Completed"
   - participants     -> optional, e.g. "60 Teams"
   - duration         -> optional, e.g. "24 Hours"
   - team             -> optional, e.g. "4 Members"
   - role             -> what you actually did, e.g. "Frontend Developer"
   - built            -> optional, what the team built, e.g. "ProjectName — one line on it"
   - technologies     -> short list. Empty = the whole row is hidden.
   - mainImage        -> the main event / participation photo
   - certificateImage -> certificate thumbnail
   - achievementImage -> winning / award photo thumbnail
   - experience       -> 3-5 short lines: what the event was, what you did, what the
                           team built, and the outcome. Avoid generic filler sentences.
   - draft            -> true hides the entry until you are ready to publish it.
   - photos           -> which photo slots this entry may use:
                           omit it            -> all three
                           photos: false      -> none at all (most certifications)
                           photos: ['mainImage', 'achievementImage'] -> exactly those
   - soon: true       -> renders a slim dashed "Coming soon" note instead of a card.
                           Use it to reserve a slot, with `summary` as the note.

   Images are local file paths only, and a slot you leave empty is simply not
   rendered — nothing reserves an empty box. Create the folder yourself.
   Suggested names:
     assets/images/achievements/<slug>-event.jpg
     assets/images/achievements/<slug>-certificate.jpg
     assets/images/achievements/<slug>-award.jpg

   The card stays a short summary: the facts, and at most one photo, so one
   photo-heavy entry can never stretch the whole grid. "View Experience" opens
   a dialog with the full write-up and every photo; clicking a photo there
   opens it full-size in the lightbox. */

window.ACHIEVEMENTS = [
  {
    cats: ['hackathons'],
    title: 'Sparkverse 2K26',
    year: '2026',
    type: 'Hackathon',
    result: '3rd Place — Cash Prize',
    participants: '60 Teams',
    duration: '24 Hours',
    team: '4 Members',
    role: 'Frontend Developer',
    built: 'DecepNet — Collaborative Distributed Honeypot Network for Coordinated Threat Detection',
    technologies: ['React.js', 'HTML', 'CSS'],
    photos: ['mainImage', 'achievementImage'],
    mainImage: '',
    certificateImage: '',
    achievementImage: '',
    experience: 'Sparkverse 2K26 was a 24-hour intra-college hackathon where our team of 4 progressed from the initial round to the final presentation among 60 teams. I worked on the frontend with React.js, HTML and CSS, and we built DecepNet, a collaborative distributed honeypot network for coordinated threat detection. It challenged me to turn an idea into a working prototype, present it clearly, and collaborate effectively under time constraints. We secured 3rd place with a cash prize among 60 teams, which strengthened my teamwork, problem-solving, presentation, and my ability to build and explain a project under pressure.',
    draft: false
  },
  {
    cats: ['hackathons'],
    title: 'Coming soon',
    type: 'Hackathon',
    summary: 'Another competition is on the way — the result and photos will land here.',
    soon: true
  },
  {
    cats: ['certifications'],
    title: 'Cisco: Introduction to Cybersecurity',
    year: '2025',
    type: 'Certification',
    result: 'Completed',
    participants: '',
    duration: '',
    role: '',
    technologies: ['Cisco Networking Academy'],
    photos: false,
    mainImage: '',
    certificateImage: '',
    achievementImage: '',
    experience: 'Completed the Cisco Networking Academy course Introduction to Cybersecurity and earned the certificate for it. I took it as part of my self-study alongside college, where I am learning defensive security, networking and SOC fundamentals.',
    draft: false
  },
  {
    cats: ['certifications'],
    title: 'CENTRI: Introduction to Network Analysis',
    year: '',
    type: 'Certification',
    result: 'Completed',
    participants: '',
    duration: '',
    role: '',
    technologies: ['CENTRI'],
    photos: false,
    mainImage: '',
    certificateImage: '',
    achievementImage: '',
    experience: 'Completed the CENTRI course Introduction to Network Analysis, covering the core traffic and network-behaviour fundamentals that support my defensive security and SOC learning.',
    draft: false
  },
  {
    cats: ['certifications'],
    title: 'Coming soon',
    type: 'Certification',
    summary: 'Next certification in progress — the certificate will be added here.',
    soon: true
  }

  /* Copy the block below, fill in your own facts, and delete this comment.

  {
    cats: ['hackathons'],
    title: 'Event Name',
    year: '2026',
    type: 'Hackathon',
    result: '3rd Place',
    participants: '60 Teams',
    duration: '24-Hour Hackathon',
    role: 'Frontend / UI',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    mainImage: 'assets/images/achievements/event-event.jpg',
    certificateImage: 'assets/images/achievements/event-certificate.jpg',
    achievementImage: 'assets/images/achievements/event-award.jpg',
    experience: 'What the event was, what you personally did, what the team built, and how it ended.',
    draft: false
  }

  For a simple card that is not a competition or a certification, use cats: ['others'].
  */
];
