import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function DashboardLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  )
}
