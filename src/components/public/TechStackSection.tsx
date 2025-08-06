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
          { name: "GitHub OAuth", description: "Secure admin access control", icon: "🐙" }
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
          { name: "Mastodon API", description: "Social media posting automation", icon: "🐘" },
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
          
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-amber-900 mb-4">
              Technology Stack
            </h2>
            <p className="text-xl text-amber-700 max-w-3xl mx-auto">
              Built with modern technologies to showcase full-stack development skills and automated content processing
            </p>
          </div>
  
          {/* Tech Stack Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {techStack.map((section) => (
              <div key={section.category} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-lg border border-amber-100">
                <h3 className="text-xl font-bold text-amber-900 mb-6 text-center">
                  {section.category}
                </h3>
                
                <div className="space-y-4">
                  {section.technologies.map((tech) => (
                    <div key={tech.name} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start">
                        <div className="text-2xl mr-3 mt-0.5">
                          {tech.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">
                            {tech.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {tech.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
  
          {/* Interview Note */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl border border-amber-200">
              <span className="text-2xl mr-2">💼</span>
              <span className="text-amber-800 font-medium">
                This project demonstrates full-stack development, API integration, and automated content processing
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  