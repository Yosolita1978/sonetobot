
export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">SonetoBot Dashboard</h1>
      <p className="mt-4">Your Spanish poetry bot is running!</p>
      
      <div className="mt-8">
        <a 
          href="/api/test-db" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Database Connection
        </a>
      </div>
    </div>
  )
}