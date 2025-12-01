export default function MissingClerkKey() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl text-center">
        <h1 className="text-2xl font-semibold mb-2">Missing Clerk Publishable Key</h1>
        <p className="text-muted-foreground mb-4">
          Set <code className="px-1 py-0.5 bg-muted rounded">VITE_CLERK_PUBLISHABLE_KEY</code> in a <code className="px-1 py-0.5 bg-muted rounded">.env.local</code> file at the client root and restart the dev server.
        </p>
        <pre className="text-left whitespace-pre-wrap rounded border p-3 text-sm">
{`# client/.env.local
VITE_CLERK_PUBLISHABLE_KEY=pk_XXXXXXXXXXXXXXXXXXXXXXXXXXXX
# Optional if your API URL differs
VITE_API_URL=http://localhost:3001/api`}
        </pre>
      </div>
    </div>
  )
}
