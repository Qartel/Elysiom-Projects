// Multi-platform social media content data
// Platforms: Instagram, YouTube, LinkedIn, Facebook, Threads

export const platforms = [
  { id: 'instagram', name: 'Instagram', color: '#E1306C', icon: '📷', gradient: 'from-pink-600 to-purple-600' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', icon: '▶️', gradient: 'from-red-600 to-red-700' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', icon: '💼', gradient: 'from-blue-600 to-blue-700' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: '👥', gradient: 'from-blue-500 to-blue-600' },
  { id: 'threads', name: 'Threads', color: '#000000', icon: '@', gradient: 'from-gray-800 to-black' }
];

export const contentLibrary = {
  instagram: [
    {
      id: 'ig1',
      platform: 'instagram',
      type: 'post',
      format: 'single',
      status: 'posted',
      title: 'Welcome to Elysiom',
      category: 'brand',
      caption: '🤖 Welcome to the future of automation. Elysiom deploys intelligent agents that transform your business operations. #AgenticAutomation #AITechnology #Elysiom',
      scheduledDate: '2024-01-15T10:00:00',
      postedDate: '2024-01-15T10:00:00',
      likes: 1247,
      comments: 89,
      shares: 34,
      design: { headline: 'Intelligent Agents', subheadline: 'For Your Business', showRobot: true }
    },
    {
      id: 'ig2',
      platform: 'instagram',
      type: 'reel',
      format: 'video',
      status: 'posted',
      title: 'How AI Agents Work',
      category: 'educational',
      caption: '⚡ Ever wondered how AI agents work? Watch them in action! #AIAgents #Automation',
      scheduledDate: '2024-01-17T14:00:00',
      postedDate: '2024-01-17T14:00:00',
      views: 15420,
      likes: 2341,
      comments: 156,
      shares: 89,
      design: { headline: 'How AI Agents Work', animation: 'robot-explain', showRobot: true }
    },
    {
      id: 'ig3',
      platform: 'instagram',
      type: 'post',
      format: 'carousel',
      status: 'scheduled',
      title: 'AutoAgent Pro Features',
      category: 'product',
      caption: '🚀 Introducing AutoAgent Pro - Enterprise automation at scale. Swipe ➡️ #AutoAgentPro',
      scheduledDate: '2024-02-01T09:00:00',
      likes: 0,
      comments: 0,
      design: { showRobot: true, slides: 4 }
    },
    {
      id: 'ig4',
      platform: 'instagram',
      type: 'story',
      status: 'scheduled',
      title: 'Behind the Scenes',
      category: 'brand',
      scheduledDate: '2024-01-28T11:00:00',
      design: { showRobot: true, stickers: true }
    },
    {
      id: 'ig5',
      platform: 'instagram',
      type: 'reel',
      format: 'video',
      status: 'draft',
      title: '300% ROI Success Story',
      category: 'testimonial',
      caption: '📈 TechCorp Global achieved 300% increase with Elysiom. #SuccessStory',
      design: { metric: '300%', animation: 'stats-reveal', showRobot: true }
    },
    {
      id: 'ig6',
      platform: 'instagram',
      type: 'post',
      format: 'single',
      status: 'draft',
      title: 'AI Automation Tips',
      category: 'educational',
      caption: '💡 5 Rules for AI Success. Save this! 🔖 #AITips',
      design: { showRobot: false, listStyle: true }
    },
    {
      id: 'ig7',
      platform: 'instagram',
      type: 'post',
      format: 'single',
      status: 'draft',
      title: 'Client Testimonial',
      category: 'testimonial',
      caption: '💬 "Game-changing technology" - Emily Watson, VP Operations',
      design: { quote: true, showRobot: false }
    },
    {
      id: 'ig8',
      platform: 'instagram',
      type: 'reel',
      format: 'video',
      status: 'draft',
      title: 'Product Demo: WorkFlow Genius',
      category: 'product',
      caption: '⚡ WorkFlow Genius learns and improves daily. #SmartAutomation',
      design: { animation: 'workflow-demo', showRobot: true }
    },
    {
      id: 'ig9',
      platform: 'instagram',
      type: 'post',
      format: 'carousel',
      status: 'draft',
      title: '2024 AI Trends',
      category: 'educational',
      caption: '📊 AI Trends you can\'t ignore. Swipe for insights ➡️',
      design: { showRobot: true, dataViz: true, slides: 4 }
    },
    {
      id: 'ig10',
      platform: 'instagram',
      type: 'story',
      status: 'draft',
      title: 'Quick Tip',
      category: 'educational',
      design: { quickTip: true, showRobot: false }
    }
  ],
  youtube: [
    {
      id: 'yt1',
      platform: 'youtube',
      type: 'video',
      format: 'long',
      status: 'posted',
      title: 'Complete Guide to Agentic Automation in 2024',
      category: 'educational',
      description: 'Learn everything about agentic automation, from basics to advanced implementation. Perfect for business leaders and tech teams.',
      scheduledDate: '2024-01-10T08:00:00',
      postedDate: '2024-01-10T08:00:00',
      views: 45230,
      likes: 3420,
      comments: 234,
      duration: '12:45',
      tags: ['AI', 'Automation', 'Business', 'Technology', 'Tutorial'],
      thumbnail: 'custom'
    },
    {
      id: 'yt2',
      platform: 'youtube',
      type: 'short',
      format: 'short',
      status: 'posted',
      title: 'AI Agents in 60 Seconds',
      category: 'educational',
      description: 'Quick explanation of how AI agents transform businesses.',
      scheduledDate: '2024-01-18T16:00:00',
      postedDate: '2024-01-18T16:00:00',
      views: 89450,
      likes: 7230,
      comments: 456,
      duration: '0:58',
      tags: ['AIShorts', 'QuickTips', 'Automation']
    },
    {
      id: 'yt3',
      platform: 'youtube',
      type: 'video',
      format: 'long',
      status: 'scheduled',
      title: 'AutoAgent Pro - Full Product Demo & Tutorial',
      category: 'product',
      description: 'Complete walkthrough of AutoAgent Pro features, setup, and best practices for enterprise deployment.',
      scheduledDate: '2024-02-05T10:00:00',
      duration: '18:30',
      tags: ['AutoAgentPro', 'ProductDemo', 'Enterprise', 'Tutorial']
    },
    {
      id: 'yt4',
      platform: 'youtube',
      type: 'short',
      format: 'short',
      status: 'scheduled',
      title: '300% ROI Case Study',
      category: 'testimonial',
      scheduledDate: '2024-01-30T14:00:00',
      duration: '0:45',
      tags: ['CaseStudy', 'ROI', 'Success']
    },
    {
      id: 'yt5',
      platform: 'youtube',
      type: 'video',
      format: 'long',
      status: 'draft',
      title: 'Building Your First Automated Workflow',
      category: 'educational',
      description: 'Step-by-step tutorial for creating your first automated workflow using Elysiom platform.',
      duration: '15:20',
      tags: ['Tutorial', 'Workflow', 'Beginner', 'Automation']
    },
    {
      id: 'yt6',
      platform: 'youtube',
      type: 'community',
      format: 'poll',
      status: 'draft',
      title: 'Poll: What automation challenge do you face?',
      category: 'engagement',
      description: 'Help us understand your biggest automation challenges'
    },
    {
      id: 'yt7',
      platform: 'youtube',
      type: 'short',
      format: 'short',
      status: 'draft',
      title: 'Behind the Scenes: Robot Development',
      category: 'brand',
      duration: '0:52',
      tags: ['BTS', 'Development', 'Team']
    },
    {
      id: 'yt8',
      platform: 'youtube',
      type: 'video',
      format: 'long',
      status: 'draft',
      title: 'AI Trends 2024: What Business Leaders Need to Know',
      category: 'educational',
      description: 'Industry insights and predictions for AI automation in 2024.',
      duration: '22:15',
      tags: ['Trends', 'AI2024', 'BusinessLeaders', 'Industry']
    },
    {
      id: 'yt9',
      platform: 'youtube',
      type: 'community',
      format: 'text',
      status: 'draft',
      title: 'Announcing: New MarketPulse AI Features',
      category: 'product',
      description: 'Excited to share what\'s coming next!'
    },
    {
      id: 'yt10',
      platform: 'youtube',
      type: 'short',
      format: 'short',
      status: 'draft',
      title: 'Client Success Highlight',
      category: 'testimonial',
      duration: '0:38',
      tags: ['ClientSuccess', 'Testimonial']
    }
  ],
  linkedin: [
    {
      id: 'li1',
      platform: 'linkedin',
      type: 'post',
      format: 'text',
      status: 'posted',
      title: 'The Future of Enterprise Automation',
      category: 'thought-leadership',
      content: 'After 5 years in the automation space, I\'ve learned that successful AI implementation isn\'t about technology—it\'s about people.\n\nHere are 3 principles that separate successful automation projects from failed ones:\n\n1. Start with clear business outcomes\n2. Invest in change management\n3. Measure everything\n\nWhat\'s your experience with enterprise automation?',
      scheduledDate: '2024-01-12T09:00:00',
      postedDate: '2024-01-12T09:00:00',
      reactions: 1834,
      comments: 127,
      shares: 89
    },
    {
      id: 'li2',
      platform: 'linkedin',
      type: 'post',
      format: 'image',
      status: 'posted',
      title: 'Introducing AutoAgent Pro',
      category: 'product',
      content: 'Proud to announce AutoAgent Pro—our enterprise-grade agentic automation platform.\n\n✓ Multi-agent orchestration\n✓ Real-time analytics\n✓ Custom integrations\n\nBuilt for teams that need automation at scale. Early access link in comments.',
      scheduledDate: '2024-01-20T11:00:00',
      postedDate: '2024-01-20T11:00:00',
      reactions: 2456,
      comments: 198,
      shares: 234,
      hasImage: true
    },
    {
      id: 'li3',
      platform: 'linkedin',
      type: 'article',
      format: 'article',
      status: 'scheduled',
      title: 'How We Helped TechCorp Achieve 300% ROI with AI Automation',
      category: 'case-study',
      content: 'Deep dive into our implementation strategy, challenges faced, and lessons learned.',
      scheduledDate: '2024-02-03T08:00:00',
      readTime: '8 min'
    },
    {
      id: 'li4',
      platform: 'linkedin',
      type: 'post',
      format: 'video',
      status: 'scheduled',
      title: 'Team Spotlight: Meet Our AI Engineers',
      category: 'culture',
      scheduledDate: '2024-01-29T10:00:00',
      duration: '2:30'
    },
    {
      id: 'li5',
      platform: 'linkedin',
      type: 'post',
      format: 'document',
      status: 'draft',
      title: '2024 State of AI Automation Report',
      category: 'research',
      content: 'Our annual industry report is here. Key findings inside.',
      pages: 24
    },
    {
      id: 'li6',
      platform: 'linkedin',
      type: 'post',
      format: 'poll',
      status: 'draft',
      title: 'What\'s your biggest automation challenge?',
      category: 'engagement',
      content: 'Help us understand the industry better',
      pollOptions: ['Integration complexity', 'Change management', 'ROI measurement', 'Finding talent']
    },
    {
      id: 'li7',
      platform: 'linkedin',
      type: 'post',
      format: 'text',
      status: 'draft',
      title: 'Lessons from 500+ Automation Implementations',
      category: 'thought-leadership',
      content: 'Working with 500+ enterprises taught us what really matters in automation...'
    },
    {
      id: 'li8',
      platform: 'linkedin',
      type: 'article',
      format: 'article',
      status: 'draft',
      title: 'The Complete Guide to Agentic AI for Business Leaders',
      category: 'educational',
      content: 'Everything executives need to know about implementing agentic AI.',
      readTime: '12 min'
    },
    {
      id: 'li9',
      platform: 'linkedin',
      type: 'post',
      format: 'image',
      status: 'draft',
      title: 'We\'re Hiring: Senior AI Engineers',
      category: 'recruiting',
      content: 'Join us in building the future of automation. 5 open positions.',
      hasImage: true
    },
    {
      id: 'li10',
      platform: 'linkedin',
      type: 'post',
      format: 'text',
      status: 'draft',
      title: 'Client Success Story: FinanceFlow',
      category: 'case-study',
      content: 'How FinanceFlow achieved 10x faster processing with our platform...'
    }
  ],
  facebook: [
    {
      id: 'fb1',
      platform: 'facebook',
      type: 'post',
      format: 'text-image',
      status: 'posted',
      title: 'Welcome to Elysiom!',
      category: 'brand',
      content: '👋 Welcome to our Facebook community! We\'re building the future of business automation with AI agents that work 24/7.\n\nFollow us for:\n✨ Product updates\n📚 Industry insights\n🎯 Success stories\n💡 Automation tips',
      scheduledDate: '2024-01-14T12:00:00',
      postedDate: '2024-01-14T12:00:00',
      reactions: 892,
      comments: 45,
      shares: 23
    },
    {
      id: 'fb2',
      platform: 'facebook',
      type: 'video',
      format: 'video',
      status: 'posted',
      title: 'How AI Agents Transform Your Business',
      category: 'educational',
      content: 'Watch how intelligent agents can automate your workflows and boost productivity by 300%. 🚀',
      scheduledDate: '2024-01-19T15:00:00',
      postedDate: '2024-01-19T15:00:00',
      views: 12450,
      reactions: 1234,
      comments: 89,
      shares: 156,
      duration: '3:45'
    },
    {
      id: 'fb3',
      platform: 'facebook',
      type: 'reel',
      format: 'reel',
      status: 'scheduled',
      title: 'Quick Tip: Automation Best Practices',
      category: 'educational',
      scheduledDate: '2024-02-02T13:00:00',
      duration: '0:45'
    },
    {
      id: 'fb4',
      platform: 'facebook',
      type: 'event',
      format: 'event',
      status: 'scheduled',
      title: 'Live Webinar: Getting Started with AI Automation',
      category: 'event',
      scheduledDate: '2024-02-10T14:00:00',
      eventDate: '2024-02-15T10:00:00',
      description: 'Join us for a live Q&A session'
    },
    {
      id: 'fb5',
      platform: 'facebook',
      type: 'story',
      format: 'story',
      status: 'draft',
      title: 'Behind the Scenes',
      category: 'brand'
    },
    {
      id: 'fb6',
      platform: 'facebook',
      type: 'post',
      format: 'link',
      status: 'draft',
      title: 'New Blog Post: AI Trends 2024',
      category: 'content',
      content: 'Our latest industry analysis is live! Read about the trends shaping automation 📊',
      link: 'blog.elysiom.com/ai-trends-2024'
    },
    {
      id: 'fb7',
      platform: 'facebook',
      type: 'post',
      format: 'poll',
      status: 'draft',
      title: 'Poll: What feature should we build next?',
      category: 'engagement',
      content: 'Help shape our roadmap! Vote below 👇',
      pollOptions: ['Advanced Analytics', 'More Integrations', 'Mobile App', 'API Expansion']
    },
    {
      id: 'fb8',
      platform: 'facebook',
      type: 'post',
      format: 'carousel',
      status: 'draft',
      title: 'Meet Our Products',
      category: 'product',
      content: 'Swipe to see our full product suite ➡️',
      slides: 5
    },
    {
      id: 'fb9',
      platform: 'facebook',
      type: 'video',
      format: 'video',
      status: 'draft',
      title: 'Customer Success: TechCorp',
      category: 'testimonial',
      content: 'Hear how TechCorp achieved 300% growth with Elysiom 🎯',
      duration: '2:15'
    },
    {
      id: 'fb10',
      platform: 'facebook',
      type: 'post',
      format: 'text-image',
      status: 'draft',
      title: 'Automation Tip of the Week',
      category: 'educational',
      content: 'This week\'s tip: Always start with your end goal in mind 🎯'
    }
  ],
  threads: [
    {
      id: 'th1',
      platform: 'threads',
      type: 'text',
      format: 'text',
      status: 'posted',
      title: 'Why we built Elysiom',
      category: 'thought-leadership',
      content: 'After years of watching companies struggle with automation, we realized the problem wasn\'t technology—it was complexity.\n\nSo we built Elysiom to make AI agents accessible to every business. No PhD required.',
      scheduledDate: '2024-01-16T10:00:00',
      postedDate: '2024-01-16T10:00:00',
      likes: 892,
      replies: 67,
      reposts: 45
    },
    {
      id: 'th2',
      platform: 'threads',
      type: 'text',
      format: 'text',
      status: 'posted',
      title: 'Hot take on AI',
      category: 'thought-leadership',
      content: 'Hot take: Most companies don\'t need more AI.\n\nThey need better implementation of what already exists.\n\nFocus on execution, not novelty.',
      scheduledDate: '2024-01-21T14:30:00',
      postedDate: '2024-01-21T14:30:00',
      likes: 1456,
      replies: 234,
      reposts: 189
    },
    {
      id: 'th3',
      platform: 'threads',
      type: 'text-image',
      format: 'text-image',
      status: 'scheduled',
      title: 'Product announcement',
      category: 'product',
      content: 'AutoAgent Pro is here 🚀\n\nEnterprise automation that actually works.\n\nEarly access opening next week.',
      scheduledDate: '2024-02-04T11:00:00'
    },
    {
      id: 'th4',
      platform: 'threads',
      type: 'text',
      format: 'text',
      status: 'scheduled',
      title: 'Quick insight',
      category: 'educational',
      content: '3 signs your business is ready for automation:\n\n1. Repetitive tasks eating team time\n2. Errors from manual processes\n3. Can\'t scale without hiring\n\nSound familiar?',
      scheduledDate: '2024-01-31T16:00:00'
    },
    {
      id: 'th5',
      platform: 'threads',
      type: 'text',
      format: 'text',
      status: 'draft',
      title: 'Behind the code',
      category: 'brand',
      content: 'Behind every AI agent is a team that cares about your success.\n\nBuilding in public. Learning daily. Shipping fast.'
    },
    {
      id: 'th6',
      platform: 'threads',
      type: 'thread',
      format: 'thread',
      status: 'draft',
      title: 'Thread: Automation mistakes',
      category: 'educational',
      content: '5 automation mistakes I see every week (thread 🧵)\n\n1/',
      threadCount: 6
    },
    {
      id: 'th7',
      platform: 'threads',
      type: 'text',
      format: 'text',
      status: 'draft',
      title: 'Client win',
      category: 'testimonial',
      content: 'Client just hit 300% ROI in 3 months.\n\nThis is why we build.'
    },
    {
      id: 'th8',
      platform: 'threads',
      type: 'poll',
      format: 'poll',
      status: 'draft',
      title: 'Quick poll',
      category: 'engagement',
      content: 'What\'s stopping you from automating?',
      pollOptions: ['Too expensive', 'Too complex', 'Not sure where to start', 'Already automated']
    },
    {
      id: 'th9',
      platform: 'threads',
      type: 'text',
      format: 'text',
      status: 'draft',
      title: 'Industry insight',
      category: 'thought-leadership',
      content: 'Unpopular opinion:\n\nMost "AI solutions" are just APIs with good marketing.\n\nReal AI means agents that learn and adapt. Everything else is automation with a rebrand.'
    },
    {
      id: 'th10',
      platform: 'threads',
      type: 'text-image',
      format: 'text-image',
      status: 'draft',
      title: 'Team culture',
      category: 'brand',
      content: 'Building something great requires great people.\n\nProud of this team 💜'
    }
  ]
};

export const platformStats = {
  instagram: { total: 10, posted: 2, scheduled: 2, draft: 6, avgEngagement: 8.7 },
  youtube: { total: 10, posted: 2, scheduled: 2, draft: 6, avgViews: 67340 },
  linkedin: { total: 10, posted: 2, scheduled: 2, draft: 6, avgEngagement: 12.3 },
  facebook: { total: 10, posted: 2, scheduled: 2, draft: 6, avgEngagement: 7.2 },
  threads: { total: 10, posted: 2, scheduled: 2, draft: 6, avgEngagement: 15.8 }
};

export const getTotalStats = () => {
  const totals = { total: 0, posted: 0, scheduled: 0, draft: 0 };
  Object.values(platformStats).forEach(stats => {
    totals.total += stats.total;
    totals.posted += stats.posted;
    totals.scheduled += stats.scheduled;
    totals.draft += stats.draft;
  });
  return totals;
};