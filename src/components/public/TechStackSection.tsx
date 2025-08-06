export function TechStackSection() {
  const techStack = [
    {
      category: "Frontend",
      technologies: [
        { name: "Next.js 14", description: "React framework with App Router", icon: "⚛️" },
        { name: "TypeScript", description: "Type-safe JavaScript development", icon: "📘" },
        { name: "Tailwind CSS", description: "Utility-first CSS framework", icon: "🎨" }
      ]
    },
    {
      category: "Authentication",
      technologies: [
        { name: "NextAuth.js", description: "Authentication for Next.js", icon: "🔐" },
        { name: "GitHub OAuth", description: "Secure admin access", icon: "🐙" }
      ]
    },
    {
      category: "Backend & Database",
      technologies: [
        { name: "Next.js API Routes", description: "Server-side API endpoints", icon: "🔌" },
        { name: "Supabase", description: "PostgreSQL database as a service", icon: "🗄️" }
      ]
    },
    {
      category: "External Integrations",
      technologies: [
        { name: "Mastodon API", description: "Social media posting", icon: "🐘" },
        { name: "Web Scraping", description: "Intelligent poetry extraction", icon: "🕷️" },
        { name: "AI Formatting", description: "Smart poem structure detection", icon: "🤖" }
      ]
    },
    {
      category: "Deployment & Tools",
      technologies: [
        { name: "Vercel", description: "Cloud platform deployment", icon: "▲" },
        { name: "Spanish NLP", description: "Language-specific text processing", icon: "🇪🇸" }
      ]
    }
  ]

  return (
    <div className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-[#ffa93a]">
            Technology Stack
          </h2>
          <p className="text-xl mb-12 text-[#7caaf0]">
            Built with modern technologies to showcase full-stack development skills and automated content processing
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {techStack.map((section) => (
            <div key={section.category} className="bg-white rounded-2xl p-6 shadow-lg border-2 mb-10"
              style={{ borderColor: '#3e8672' }}>
              <h3 className="text-xl font-bold mb-6 text-center" style={{ color: '#303162' }}>
                {section.category}
              </h3>
              <div className="space-y-4">
                {section.technologies.map((tech) => (
                  <div key={tech.name}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-start"
                    style={{
                      border: `1px solid #eee`
                    }}
                  >
                    <span className="text-2xl mr-3">{tech.icon}</span>
                    <div>
                      <div className="font-semibold mb-1" style={{ color: '#ffa93a' }}>
                        {tech.name}
                      </div>
                      <div className="text-sm" style={{ color: '#3e8672' }}>
                        {tech.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-6 py-3 rounded-xl border-2"
            style={{
              background: '#7caaf020',
              borderColor: '#ffa93a',
              color: '#303162'
            }}>
            <span className="text-2xl mr-2">💼</span>
            <span className="font-medium">
              This project demonstrates full-stack development, API integration, and automated content processing
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
