name: "When2meet - One-Pager Presentation Website"
description: |

## Purpose
Build a modern, interactive one-page presentation website that showcases the When2meet concept for gaming teams. The site will demonstrate core features with live API integrations and serve as a compelling pitch for potential users and investors.

## Core Principles
1. **Modern Design**: Sleek, gaming-aesthetic with smooth animations
2. **Live Data**: Real gaming stats from tracker.gg API
3. **Interactive Demo**: Clickable prototypes showing key features
4. **Mobile Responsive**: Perfect on all devices
5. **Performance**: Fast loading, optimized assets

---

## Goal
Create a stunning one-page presentation website that:
- Clearly communicates the problem and solution
- Showcases core features with interactive demos
- Displays live gaming statistics
- Captures interest with modern design
- Includes a clear call-to-action

## Why
- **Pitch Deck Alternative**: Interactive presentation beats static slides
- **Proof of Concept**: Live API integration shows technical capability
- **User Testing**: Gauge interest with interactive prototypes
- **Marketing Tool**: Shareable link for team recruitment

## What
A single-page website with:
- Hero section with value proposition
- Problem/solution showcase
- Interactive feature demonstrations
- Live player stats from tracker.gg
- Team testimonials or use cases
- Download/signup CTA

### Success Criteria
- [ ] Page loads in under 2 seconds
- [ ] Smooth scroll navigation between sections
- [ ] Live CS:GO stats displaying from tracker.gg
- [ ] Interactive calendar demo
- [ ] Interactive chat demo
- [ ] Mobile responsive design
- [ ] Contact form working

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://tracker.gg/developers/docs/getting-started
  why: tracker.gg API authentication and setup
  
- url: https://tracker.gg/developers/docs/titles/csgo
  why: CS:GO specific endpoints for player stats
  
- url: https://nextjs.org/docs
  why: Next.js 14 with App Router for modern React
  
- url: https://tailwindcss.com/docs
  why: Utility-first CSS for rapid modern styling
  
- url: https://framer.com/motion/introduction/
  why: Framer Motion for smooth animations
  
- url: https://ui.shadcn.com/docs
  why: Modern React components with Radix UI
  
- url: https://react-hot-toast.com/
  why: Beautiful notifications
  
- url: https://swiperjs.com/react
  why: Touch-friendly feature carousel
  
- url: https://lottiefiles.com/
  why: Gaming-themed animations
```

### Current Codebase tree
```bash
.
├── .claude/
├── PRPs/
├── CLAUDE.md
├── feature_1.md
└── README.md
```

### Desired Codebase tree
```bash
.
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Home page component
│   ├── globals.css              # Global styles with Tailwind
│   └── api/
│       ├── stats/route.ts       # tracker.gg proxy endpoint
│       └── contact/route.ts     # Contact form handler
├── components/
│   ├── sections/
│   │   ├── Hero.tsx            # Hero section with CTA
│   │   ├── Problem.tsx         # Problem statement
│   │   ├── Features.tsx        # Interactive feature demos
│   │   ├── LiveStats.tsx       # Real CS:GO stats
│   │   ├── HowItWorks.tsx      # Step-by-step guide
│   │   └── CTA.tsx             # Final call-to-action
│   ├── demos/
│   │   ├── CalendarDemo.tsx    # Interactive calendar
│   │   ├── ChatDemo.tsx        # Simulated chat
│   │   ├── TeamDemo.tsx        # Team management demo
│   │   └── StatsCard.tsx       # Player stat display
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── AnimatedSection.tsx
│   └── layout/
│       ├── Navigation.tsx       # Sticky nav with scroll spy
│       └── Footer.tsx          # Contact info
├── lib/
│   ├── tracker-gg.ts           # tracker.gg API client
│   ├── animations.ts           # Framer Motion variants
│   └── utils.ts                # Helper functions
├── public/
│   ├── images/                 # Optimized images
│   ├── lottie/                 # Animation files
│   └── mockups/                # App mockups
├── styles/
│   └── themes.ts               # Color schemes
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── package.json                # Dependencies
├── tsconfig.json              # TypeScript config
├── .env.example               # Environment variables
└── README.md                  # Setup instructions
```

### Known Gotchas
```typescript
// CRITICAL: tracker.gg requires API key and has rate limits
// CRITICAL: CORS requires API calls through Next.js backend
// CRITICAL: Animations can impact performance - use will-change
// CRITICAL: Large images must be optimized with next/image
// CRITICAL: Intersection Observer for scroll animations
// CRITICAL: Preload critical fonts for gaming aesthetic
// CRITICAL: Use CSS containment for performance
```

## Implementation Blueprint

### Data models and structure

```typescript
// lib/types.ts
export interface PlayerStats {
  platformInfo: {
    platformSlug: string;
    platformUserId: string;
    avatarUrl: string;
  };
  userInfo: {
    displayName: string;
  };
  segments: {
    type: string;
    stats: {
      kills: { value: number };
      deaths: { value: number };
      kd: { value: number };
      wins: { value: number };
      timePlayed: { value: number };
      headshots: { value: number };
    };
  }[];
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  demo: 'calendar' | 'chat' | 'team' | 'files';
  color: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'game' | 'practice' | 'scrim' | 'tournament';
  date: string;
  time: string;
  team: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  message: string;
  timestamp: string;
  isOwn?: boolean;
}
```

### List of tasks

```yaml
Task 1: Setup Next.js 14 Project
CREATE Next.js app:
  - Use TypeScript
  - Configure Tailwind CSS
  - Set up ESLint/Prettier
  - Configure environment variables

Task 2: Design System & Theme
CREATE design tokens:
  - Gaming color palette (dark theme)
  - Typography scale
  - Spacing system
  - Animation timing functions
SETUP Tailwind theme:
  - Custom colors
  - Gaming fonts (Bebas Neue, etc)
  - Gradient utilities

Task 3: Build Navigation Component
CREATE components/layout/Navigation.tsx:
  - Sticky header with blur backdrop
  - Smooth scroll to sections
  - Active section highlighting
  - Mobile hamburger menu
  - Progress indicator

Task 4: Implement Hero Section
CREATE components/sections/Hero.tsx:
  - Animated title with gradient
  - Tagline with typewriter effect
  - 3D mockup carousel
  - Primary CTA button
  - Background particle effect

Task 5: Create Problem/Solution Section
CREATE components/sections/Problem.tsx:
  - Split screen design
  - Problem visualization
  - Animated solution reveal
  - Icon grid of pain points

Task 6: Build Interactive Feature Demos
CREATE components/demos/CalendarDemo.tsx:
  - Mini calendar widget
  - Draggable events
  - Event type selector
  - Animated transitions
CREATE components/demos/ChatDemo.tsx:
  - Auto-scrolling messages
  - Typing indicators
  - Media message examples
  - Reaction animations
CREATE components/demos/TeamDemo.tsx:
  - Team card carousel
  - Member avatars
  - Role badges
  - Stats preview

Task 7: Integrate tracker.gg API
CREATE lib/tracker-gg.ts:
  - API client setup
  - Rate limit handling
  - Error boundaries
CREATE app/api/stats/route.ts:
  - Proxy endpoint for CORS
  - Response caching
  - Error handling
CREATE components/sections/LiveStats.tsx:
  - Real-time stat cards
  - Loading skeletons
  - Auto-refresh timer
  - Player comparison

Task 8: Add How It Works Section
CREATE components/sections/HowItWorks.tsx:
  - Step-by-step timeline
  - Animated connectors
  - Icon illustrations
  - Mobile app download mockup

Task 9: Implement Contact/CTA Section
CREATE components/sections/CTA.tsx:
  - Email capture form
  - Social proof counters
  - Download buttons
  - Contact form with validation

Task 10: Add Animations & Polish
IMPLEMENT scroll animations:
  - Intersection Observer setup
  - Stagger animations
  - Parallax effects
  - Loading transitions
ADD micro-interactions:
  - Button hover states
  - Card lift effects
  - Smooth transitions

Task 11: Performance Optimization
OPTIMIZE assets:
  - Image compression
  - Font subsetting
  - Code splitting
  - Lazy loading
IMPLEMENT caching:
  - API response cache
  - Static generation
  - Edge optimization

Task 12: Testing & Deployment
CREATE tests:
  - Component tests
  - API route tests
  - Accessibility tests
SETUP deployment:
  - Vercel configuration
  - Environment variables
  - Analytics setup
```

### Per task pseudocode

```typescript
// Task 4: Hero Section with Gaming Aesthetic
// components/sections/Hero.tsx
export function Hero() {
  // PATTERN: Animated entrance with Framer Motion
  const titleControls = useAnimation();
  const { ref, inView } = useInView({ threshold: 0.1 });
  
  useEffect(() => {
    if (inView) {
      titleControls.start('visible');
    }
  }, [inView]);
  
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* PATTERN: Gaming-style gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-blue-900" />
      
      {/* PATTERN: Animated particles for depth */}
      <ParticleField />
      
      <div className="relative z-10 container mx-auto px-4 py-24">
        <motion.h1
          ref={ref}
          initial="hidden"
          animate={titleControls}
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.8, ease: 'easeOut' }
            }
          }}
          className="text-6xl md:text-8xl font-bold"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            When2meet
          </span>
        </motion.h1>
        
        {/* PATTERN: Typewriter effect for tagline */}
        <TypewriterText 
          text="Unite Your Squad. Dominate Together."
          className="text-2xl md:text-3xl text-gray-300 mt-4"
        />
        
        {/* PATTERN: 3D device mockups */}
        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          className="mt-12"
        >
          {mockups.map((mockup) => (
            <SwiperSlide key={mockup.id}>
              <Image
                src={mockup.src}
                alt={mockup.alt}
                width={400}
                height={800}
                className="rounded-2xl shadow-2xl"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

// Task 7: Live Stats Integration
// components/sections/LiveStats.tsx
export function LiveStats() {
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  
  // PATTERN: Fetch stats with error handling
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // CRITICAL: Use API route to avoid CORS
        const response = await fetch('/api/stats?players=s1mple,zywoo,niko');
        const data = await response.json();
        
        // PATTERN: Animate stats on load
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // PATTERN: Show fallback UI
        setLoading(false);
      }
    };
    
    fetchStats();
    // PATTERN: Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <section className="py-24 bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-bold text-center mb-12">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
            Live Player Stats
          </span>
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {loading ? (
            // PATTERN: Skeleton loaders for better UX
            [...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-800 rounded-xl h-64" />
              </div>
            ))
          ) : (
            stats.map((player) => (
              <motion.div
                key={player.platformInfo.platformUserId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <StatsCard player={player} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

// Task 6: Interactive Calendar Demo
// components/demos/CalendarDemo.tsx
export function CalendarDemo() {
  const [events, setEvents] = useState<CalendarEvent[]>(defaultEvents);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // PATTERN: Drag and drop for events
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(events);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // PATTERN: Optimistic update with animation
    setEvents(items);
  };
  
  return (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Mini Calendar */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Team Schedule</h3>
          <div className="grid grid-cols-7 gap-1">
            {/* PATTERN: Interactive calendar grid */}
            {generateCalendarDays(selectedDate).map((day) => (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={cn(
                  "p-2 rounded transition-all",
                  day.isToday && "bg-purple-600 text-white",
                  day.hasEvent && "bg-blue-600/20 border border-blue-500",
                  !day.isToday && !day.hasEvent && "hover:bg-gray-700"
                )}
              >
                {day.number}
              </button>
            ))}
          </div>
        </div>
        
        {/* Event List */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="events">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {events.map((event, index) => (
                  <Draggable key={event.id} draggableId={event.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={cn(
                          "bg-gray-700 p-3 rounded-lg transition-all",
                          snapshot.isDragging && "shadow-lg scale-105"
                        )}
                      >
                        <EventCard event={event} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
```

### Integration Points
```yaml
ENVIRONMENT:
  - TRACKER_GG_API_KEY: Required for stats
  - NEXT_PUBLIC_SITE_URL: For meta tags
  
API SETUP:
  - tracker.gg: Register at tracker.gg/developers
  - Rate limits: 60 requests per minute
  - Caching: 5 minute TTL recommended
  
DEPLOYMENT:
  - Platform: Vercel (optimal for Next.js)
  - Environment: Add API keys in Vercel dashboard
  - Domain: Configure custom domain
  
ASSETS:
  - Fonts: Bebas Neue, Inter
  - Images: WebP format, responsive sizes
  - Animations: Lottie files < 100KB
```

## Validation Loop

### Level 1: Build & Type Check
```bash
# Type checking and build
npm run build
# Expected: No errors

# Linting
npm run lint
# Fix any issues

# Format check
npm run format:check
```

### Level 2: Component Tests
```typescript
// __tests__/components/Hero.test.tsx
describe('Hero Section', () => {
  it('renders with animation', async () => {
    render(<Hero />);
    
    const title = screen.getByText(/When2meet/i);
    expect(title).toBeInTheDocument();
    
    // Wait for animation
    await waitFor(() => {
      expect(title).toHaveStyle({ opacity: 1 });
    });
  });
});

// __tests__/api/stats.test.ts
describe('Stats API', () => {
  it('fetches player stats successfully', async () => {
    const response = await fetch('/api/stats?players=s1mple');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data[0].userInfo.displayName).toBeDefined();
  });
  
  it('handles rate limits gracefully', async () => {
    // Mock rate limit response
    const response = await fetch('/api/stats?players=test');
    expect(response.status).toBe(429);
  });
});
```

### Level 3: Performance Testing
```bash
# Lighthouse CI
npm run lighthouse

# Bundle analysis
npm run analyze

# Expected metrics:
# - Performance: > 90
# - First Contentful Paint: < 1.5s
# - Time to Interactive: < 3s
# - Bundle size: < 200KB (initial)
```

### Level 4: Cross-browser Testing
```bash
# Test on:
# - Chrome (latest)
# - Firefox (latest)
# - Safari (latest)
# - Mobile Safari
# - Chrome Android

# Check:
# - Smooth scrolling
# - Animation performance
# - API integration
# - Responsive design
```

## Final Validation Checklist
- [ ] All sections implemented and responsive
- [ ] Smooth scroll navigation working
- [ ] tracker.gg API integration functional
- [ ] Interactive demos working (calendar, chat)
- [ ] Animations perform well on mobile
- [ ] Contact form submits successfully
- [ ] Loading time under 2 seconds
- [ ] SEO meta tags configured
- [ ] Accessibility score > 95
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Bundle size optimized
- [ ] Deployed to production

---

## Anti-Patterns to Avoid
- ❌ Don't make direct API calls from client - use API routes
- ❌ Don't use heavy animations on mobile
- ❌ Don't load all content at once - use lazy loading
- ❌ Don't forget loading states for API calls
- ❌ Don't hardcode API keys in frontend code
- ❌ Don't skip image optimization
- ❌ Don't use synchronous data fetching
- ❌ Don't ignore accessibility

## Confidence Score: 9/10

High confidence because:
- Clear single-page structure
- Modern tech stack (Next.js 14, Tailwind)
- Well-documented APIs
- Proven animation libraries
- Straightforward implementation path

Minor uncertainty:
- tracker.gg API rate limits and availability
- Performance with complex animations on low-end devices

The presentation site should effectively showcase the When2meet concept with engaging visuals and real data integration.