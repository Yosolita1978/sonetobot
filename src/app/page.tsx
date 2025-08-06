import { Hero } from '@/components/public/Hero'
import { StatsSection } from '@/components/public/StatsSection'
import { RandomPoemSection } from '@/components/public/RandomPoemSection'
import { MastodonPostsSection } from '@/components/public/MastodonPostsSection'
import { TechStackSection } from '@/components/public/TechStackSection'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-25 via-orange-25 to-red-25">
      {/* Hero Section */}
      <Hero />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Random Poem Section */}
      <RandomPoemSection />
      
      {/* Recent Mastodon Posts */}
      <MastodonPostsSection />
      
      {/* Tech Stack */}
      <TechStackSection />
      
      {/* Footer */}
      <footer className="py-12 bg-amber-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">Spanish Poetry Automation Platform</h3>
            <p className="text-amber-200">
              Bringing centuries of Spanish literary heritage to the digital age
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <a
              href="https://col.social/@sonetobot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-200 hover:text-white transition-colors"
            >
              🐘 @sonetobot@col.social
            </a>
            
            <a
              href="https://www.palabravirtual.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-200 hover:text-white transition-colors"
            >
              📚 palabravirtual.com
            </a>
            
            <a
              href="https://github.com/Yosolita1978"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-200 hover:text-white transition-colors"
            >
              🐙 Built by Yosolita1978
            </a>
          </div>
          
          <div className="mt-8 pt-6 border-t border-amber-800">
            <p className="text-sm text-amber-300">
              © 2025 Spanish Poetry Automation Platform. Built with ❤️ for poetry lovers everywhere.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

