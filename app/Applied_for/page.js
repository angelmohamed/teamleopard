// 'use client'

// import React, { useEffect, useState } from 'react'
// import { supabase } from '@/lib/supabaseClient'
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
//   CardFooter
// } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/button'
// import { CalendarDays, FileText, BarChart3 } from 'lucide-react'
// import { useRouter } from 'next/navigation'

// export default function Dashboard() {
//   const [applications, setApplications] = useState([])
//   const [loading, setLoading] = useState(true)
//   const router = useRouter()

//   useEffect(() => {
//     const fetchApplications = async () => {
//       const { data: { user } } = await supabase.auth.getUser()

//       const { data, error } = await supabase
//         .from('Applications')
//         .select(`
//           Application_id,
//           created_at,
//           status,
//           resume_file_name,
//           Job_Posting (
//             posting_id,
//             title,
//             location,
//             employment_type
//           )
//         `)
//         .eq('employee_ID', user?.id)

//       if (error) {
//         console.error('Error fetching applications:', error)
//       } else {
//         setApplications(data)
//       }
//       setLoading(false)
//     }

//     fetchApplications()
//   }, [])

//   const getStatusVariant = (status) => {
//     if (status === 'Accepted') return 'success'
//     if (status === 'Rejected') return 'destructive'
//     return null 
//   }

//   return (
//     <section className="p-6">
//       <h2 className="text-3xl font-bold mb-8 text-foreground">Your Applications</h2>

//       {loading ? (
//         <p className="text-muted-foreground">Loading...</p>
//       ) : applications.length === 0 ? (
//         <p className="text-center text-muted-foreground italic">
//           You haven’t applied to any jobs yet.
//         </p>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {applications.map((app) => (
//             <Card key={app.Application_id} className="flex flex-col justify-between h-full">
//               <div>
//                 <CardHeader>
//                   <CardTitle className="text-lg">{app.Job_Posting.title}</CardTitle>
//                   <p className="text-sm text-muted-foreground">
//                     {app.Job_Posting.location} • {app.Job_Posting.employment_type}
//                   </p>
//                 </CardHeader>

//                 <CardContent className="space-y-3 text-sm">
//                   <div className="flex items-center gap-2 text-muted-foreground">
//                     <CalendarDays className="w-4 h-4" />
//                     <span>
//                       Applied:{' '}
//                       <span className="text-foreground font-medium">
//                         {new Date(app.created_at).toLocaleDateString()}
//                       </span>
//                     </span>
//                   </div>

//                   <div className="flex items-center gap-2 text-muted-foreground">
//                     <FileText className="w-4 h-4" />
//                     <span>
//                       Resume: <span className="text-foreground">{app.resume_file_name}</span>
//                     </span>
//                   </div>

//                   {app.status === 'Pending' ? (
//                     <Badge className="bg-yellow-100 text-yellow-800">
//                       {app.status}
//                     </Badge>
//                   ) : (
//                     <Badge variant={getStatusVariant(app.status)}>
//                       {app.status}
//                     </Badge>
//                   )}
//                 </CardContent>
//               </div>
//               <CardFooter className="mt-auto pt-4">
//                 <Button
//                     variant="outline"
//                     className="w-full gap-2"
//                     onClick={() =>
//                         router.push(`/jobs/${app.Job_Posting.posting_id}/stats`)
//     }
//   >
//                 <BarChart3 className="w-4 h-4" />
//                 <Button onClick={() => router.push(`/View_Stat/${app.Job_Posting.posting_id}`)}></Button>
//                 View Stats
//         </Button>
// </CardFooter>


//             </Card>
//           ))}
//         </div>
//       )}
//     </section>
//   )
// }
'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, FileText, BarChart3 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchApplications = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('Applications')
        .select(`
          Application_id,
          created_at,
          status,
          resume_file_name,
          Job_Posting (
            posting_id,
            title,
            location,
            employment_type
          )
        `)
        .eq('employee_ID', user?.id)

      if (error) {
        console.error('Error fetching applications:', error)
      } else {
        setApplications(data)
      }
      setLoading(false)
    }

    fetchApplications()
  }, [])

  const getStatusVariant = (status) => {
    if (status === 'Accepted') return 'success'
    if (status === 'Rejected') return 'destructive'
    return null 
  }

  return (
    <section className="p-6">
      <h2 className="text-3xl font-bold mb-8 text-foreground">Your Applications</h2>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : applications.length === 0 ? (
        <p className="text-center text-muted-foreground italic">
          You haven’t applied to any jobs yet.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <Card key={app.Application_id} className="flex flex-col justify-between h-full">
              <div>
                <CardHeader>
                  <CardTitle className="text-lg">{app.Job_Posting.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {app.Job_Posting.location} • {app.Job_Posting.employment_type}
                  </p>
                </CardHeader>

                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                    <span>
                      Applied:{' '}
                      <span className="text-foreground font-medium">
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>
                      Resume: <span className="text-foreground">{app.resume_file_name}</span>
                    </span>
                  </div>

                  {app.status === 'Pending' ? (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {app.status}
                    </Badge>
                  ) : (
                    <Badge variant={getStatusVariant(app.status)}>
                      {app.status}
                    </Badge>
                  )}
                </CardContent>
              </div>

              <CardFooter className="mt-auto pt-4">
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  onClick={() =>
                    router.push(`/View_Stat/${app.Job_Posting.posting_id}`)
                  }
                >
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  View Stats
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
