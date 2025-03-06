import "./globals.css";
import Link from "next/link"; // Correct import for Next.js Link
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger
} from "@/components/ui/tabs"

{/* THINGS TO ADD: MOBILE SIZING SUPPORT, ACTUAL STAT IMPORT??, MEET THE TEAM SECTION??*/}
{/* THINGS TO CHANGE: COLOUR SCHEME, TEXT BOXES, PLACEHOLDER IMAGES, SELECTION COLOUR FOR TABS (you cant see the selected item well)*/}

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* NAVBAR ON TOP */}
      <header className="sticky top-0 z-50 bg-white text-slate-100 shadow-lg">
        <div className="flex justify-between items-center px-4 py-2">
          <h1 className="text-xl text-black font-bold">Job Seek</h1>
          <nav>
            <ul className="flex space-x-4">
              <Button className="text-x1" asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
              <Button className="text-x1" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button className="text-x1" asChild>
                <Link href="/companySignup">Register As Employer</Link>
              </Button>
            </ul>
          </nav>
        </div>
      </header>

      {/* SECTION 1 - START WITH BACKGROUND IMAGE */}
      <section className="flex justify-center items-center h-[75vh] min-h-[500px] text-white text-4xl font-bold py-6">
        {/* INTRO TEXT AND BUTTON */}
        <div className="w-1/2 flex flex-col items-center justify-left text-right px-10 gap-6">
          <h1 className="text-black text-6xl font-bold self-end mr-5">Name of the app or something.</h1>
          <p className="text-gray-600 text-4x1 italic self-end mr-5">get a job ️‍🔥️‍🔥.</p>
          <Button className="bg-slate-700 text-2xl self-end mr-5 bold italic" asChild>
            <Link href="/sign-up">Start now →</Link>
          </Button>
        </div>

        <div className="w-1/3 flex items-center justify-right">
          {/* old code with dynamic image (scrapped for carousel but kept here just incase)
          <img src="https://t3.ftcdn.net/jpg/02/99/04/20/360_F_299042079_vGBD7wIlSeNl7vOevWHiL93G4koMM967.jpg" alt="Example" 
          className="w-3/4 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 hover:rotate-1 self-start mr-5" />*/}

          {/* CAROUSEL(shadcnui) TO DISPLAY IMAGES OF APP */}
          <Carousel opts={{loop: true}}>
            <CarouselContent>
              {/* LIST OF IMAGES OF THE APP */}
              {/* TBC - make sure all images are the same proportions. the carousell will adjust based on the largest image's dimensions. */}
              <CarouselItem><img src="https://media.gettyimages.com/id/1410538853/photo/young-man-in-the-public-park.jpg?s=612x612&w=gi&k=20&c=EpcwID8Bfxufrodoyo_x10JgFcnkPNuShJuJHRZkIlM=" alt="Example" 
              className="rounded-lg shadow-lg"></img></CarouselItem>
              <CarouselItem><img src="https://media.gettyimages.com/id/1410538853/photo/young-man-in-the-public-park.jpg?s=612x612&w=gi&k=20&c=EpcwID8Bfxufrodoyo_x10JgFcnkPNuShJuJHRZkIlM=" alt="Example" 
              className="rounded-lg shadow-lg"></img></CarouselItem>
              <CarouselItem><img src="https://media.gettyimages.com/id/1410538853/photo/young-man-in-the-public-park.jpg?s=612x612&w=gi&k=20&c=EpcwID8Bfxufrodoyo_x10JgFcnkPNuShJuJHRZkIlM=" alt="Example" 
              className="rounded-lg shadow-lg"></img></CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="bg-slate-500"/>
            <CarouselNext className="bg-slate-500"/>
          </Carousel>

        </div>
        {/* empty div to center the rest (this likely has alternatives that I am unaware of)*/}
        <div className="w-1/6"></div>
      </section>

      {/* SECTION 2 - EXPLANATION OF PRODUCT SPLIT WITH TABS(shadcnui) */}
      <div className="flex flex-col items-center justify-center">
        <Tabs defaultValue="personal" className="bg-slate-100">
          <TabsList className="w-full">
            <TabsTrigger value="personal" className="w-1/2 bg-slate-100">
              <h1 className="text-slate-800 text-2xl italic font-bold self-end mr-5">Job Hunters (might need a better word)</h1>
            </TabsTrigger>
            <TabsTrigger value="business" className="w-1/2 bg-slate-100">
              <h1 className="text-slate-800 text-2xl italic font-bold self-end mr-5">Businesses</h1>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="personal">
            <section className="w-screen bg-slate-200 flex justify-center items-center h-[75vh] min-h-[500px] text-white text-4xl font-bold py-6"
            style={{ backgroundImage: 'url(https://media.gettyimages.com/id/1410538853/photo/young-man-in-the-public-park.jpg?s=612x612&w=gi&k=20&c=EpcwID8Bfxufrodoyo_x10JgFcnkPNuShJuJHRZkIlM=)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              {/* Message for Job Hunters */}
              <Card className="bg-slate-200">
                <CardHeader>
                  <CardTitle><b>Searching for a career perfect for You?</b></CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-left text-lg mr-2 max-w-3xl">
                    PLACEHOLDER: text that will waffle about the app for users, maybe including some bullet points. 
                    As a Kings student, you have exclusive access to an unparalleled range of activities to 
                    enjoy around your studies and enrich your experience. These extracurricular activities 
                    are a great way to meet new people, develop skills, gain experience and make a difference.
                    Kings Edge: extracurricular activities and events available to all students
                    Kings Start-up Accelerator: take your ideas and ventures to the next level
                    Volunteering opportunities at Kings.
                  </p>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
          <TabsContent value="business">
            <section className="w-screen bg-slate-300 flex justify-center items-center h-[75vh] min-h-[500px] text-white text-4xl font-bold py-6"
            style={{ backgroundImage: 'url(https://media.istockphoto.com/id/1696781145/photo/modern-building-in-the-city-with-blue-sky.jpg?s=612x612&w=0&k=20&c=POfayTyDe06tGX4CeJgS8-fb896MUC46dl3ZbHXBqN4=)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              {/* Message for Employers */}
              <Card className="bg-slate-100">
                <CardHeader>
                  <CardTitle><b>Looking to hire the best for your Business?</b></CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-left text-lg mr-2 max-w-3xl">
                    PLACEHOLDER: text that will waffle about the app for businesses, maybe including some bullet points. 
                    As a Kings student, you have exclusive access to an unparalleled range of activities to 
                    enjoy around your studies and enrich your experience. These extracurricular activities 
                    are a great way to meet new people, develop skills, gain experience and make a difference.
                    Kings Edge: extracurricular activities and events available to all students
                    Kings Start-up Accelerator: take your ideas and ventures to the next level
                    Volunteering opportunities at Kings.
                  </p>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
        </Tabs>
      </div>

      {/* SECTION 3 - WHY CHOOSE US + STATS */}
      <section className="bg-white flex justify-center items-center h-[75vh] min-h-[500px] text-black text-4xl font-bold py-6">
        WIP
      </section>

      {/* to add a future section
      <section className="bg-slate-300 flex justify-center items-center h-[75vh] min-h-[500px] text-white text-4xl font-bold py-6">
        CONTENT
      </section>*/}
    </div>
  );
}

