import ChartStats from '@/components/ui/chartstats' 

import { supabase } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function ViewStatPage({ params }) {
  const jobId = params.id

  const { data: applications, error } = await supabase
    .from('Applications')
    .select('status')
    .eq('job_posting_id', jobId)

  if (error) {
    return <div className="p-6 text-destructive">Error loading job statistics.</div>
  }

  const total = applications.length
  const accepted = applications.filter(app => app.status?.toLowerCase() === 'accepted').length
  const rejected = applications.filter(app => app.status?.toLowerCase() === 'rejected').length
  const pending = applications.filter(app => app.status?.toLowerCase() === 'pending').length

  const chartData = [
    { status: 'accepted', label: 'Accepted', count: accepted },
    { status: 'rejected', label: 'Rejected', count: rejected },
    { status: 'pending', label: 'Pending', count: pending }
  ]

  return (
    <section className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Job Application Statistics</h1>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Total Applications</span>
            <span className="text-foreground font-semibold">{total}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">Accepted</Badge>
            </span>
            <span className="text-foreground">{accepted}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-2">
              <Badge className="bg-red-100 text-red-800">Rejected</Badge>
            </span>
            <span className="text-foreground">{rejected}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-2">
              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
            </span>
            <span className="text-foreground">{pending}</span>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Visual Breakdown</h2>
        <ChartStats chartData={chartData} />
      </div>
    </section>
  )
}
