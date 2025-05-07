import { VercelSupabaseGuide } from "@/components/setup/vercel-supabase-guide"

export default function DeploymentGuidePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Deployment Guide</h1>
      <VercelSupabaseGuide />
    </div>
  )
}
