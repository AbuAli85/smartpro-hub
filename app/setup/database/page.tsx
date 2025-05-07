import { DatabaseSetup } from "@/components/setup/database-setup"

export default function DatabaseSetupPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Database Setup</h1>
      <DatabaseSetup />
    </div>
  )
}
