"use client";

import "./globals.css";
import Link from "next/link"; // Correct import for Next.js Link
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

{
  /* THINGS TO CHANGE: COLOUR SCHEME, TEXT BOXES, PLACEHOLDER IMAGES, SELECTION COLOUR FOR TABS (you cant see the selected item well), LAST CARDS SECTION*/
}

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.push("/dashboard");
    };
    checkAuth();
  }, [router]);

  return (
    <div className="bg-white">
      {/* NAVBAR ON TOP */}
      <header className="sticky top-0 z-50 bg-white text-x1 text-slate-100 shadow-lg">
        <div className="flex justify-between items-center px-2 py-2">
          <Image
            src="/logo.png"
            alt="Company Logo"
            width={105}
            height={40}
            priority
            className="ml-1"
          />
          <nav>
            <ul className="flex space-x-4">
              <Button asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Sign Up As Employee</Link>
              </Button>
              <Button asChild>
                <Link href="/company-sign-up">Sign Up As Employer</Link>
              </Button>
            </ul>
          </nav>
        </div>
      </header>

      {/* SECTION 1 - START WITH BACKGROUND IMAGE */}
      <section className="flex flex-col md:flex-row justify-center items-center h-[75vh] min-h-[500px] text-white text-4xl font-bold py-6">
        {/* INTRO TEXT AND BUTTON */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center text-center md:text-right gap-6 px-4 md:px-0">
          <Image
            src="/logo_big.png"
            alt=""
            width={420}
            height={120}
            layout="responsive"
            className="w-[90%] max-w-[420px] h-auto"
          />
          <Button
            className="bg-slate-700 text-xl md:text-3xl self-center bold italic"
            asChild
          >
            <Link href="/sign-up">Search now →</Link>
          </Button>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center overflow-hidden mt-6 md:mt-0">
          {/* old code with dynamic image (scrapped for carousel but kept here just incase)
          <img src="https://t3.ftcdn.net/jpg/02/99/04/20/360_F_299042079_vGBD7wIlSeNl7vOevWHiL93G4koMM967.jpg" alt="Example" 
          className="w-3/4 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 hover:rotate-1 self-start mr-5" />*/}

          {/* CAROUSEL(shadcnui) TO DISPLAY IMAGES OF APP */}
          <Carousel opts={{ loop: true }} className="w-[90%] md:w-[80%] shadow-3xl border border-gray-300 rounded-lg">
            <CarouselContent>
              {/* LIST OF IMAGES OF THE APP */}
              {/* TBC - make sure all images are the same proportions. the carousell will adjust based on the largest image's dimensions. */}
              <CarouselItem>
                <Image
                  src="showcase_1.png"
                  alt="Example"
                  className="rounded-lg shadow-lg w-full h-auto"
                ></Image>
              </CarouselItem>
              <CarouselItem>
                <Image
                  src="showcase_2.png"
                  alt="Example"
                  className="rounded-lg shadow-lg w-full h-auto"
                ></Image>
              </CarouselItem>
              <CarouselItem>
                <Image
                  src="showcase_3.png"
                  alt="Example"
                  className="rounded-lg shadow-lg w-full h-auto"
                ></Image>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="bg-slate-500 absolute left-2" />
            <CarouselNext className="bg-slate-500 absolute right-2" />
          </Carousel>
        </div>

      </section>

      {/* SECTION 2 - EXPLANATION OF PRODUCT SPLIT WITH TABS(shadcnui) */}
      <div className="flex flex-col items-center justify-center">
        <Tabs defaultValue="personal" className="bg-slate-100">
          <TabsList className="w-full">
            <TabsTrigger value="personal" className="w-1/2 bg-slate-100">
              <h1 className="text-slate-800 text-xl md:text-2xl  italic font-bold self-end mr-5">
                Job Seekers
              </h1>
            </TabsTrigger>
            <TabsTrigger value="business" className="w-1/2 bg-slate-100">
              <h1 className="text-slate-800 text-xl md:text-2xl italic font-bold self-end mr-5">
                Businesses
              </h1>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="personal" className="w-full flex justify-center">
            <section
              className="w-screen bg-slate-100 flex justify-center items-center h-[75vh] min-h-[500px] text-white text-4xl font-bold py-6"
              style={{
                backgroundImage:
                  "url(/landing_page_jobseekers_bg.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Message for Job Seekers */}
              <Card className="bg-slate-200 w-[90%] max-w-[600px] mx-auto">
                <CardHeader>
                  <CardTitle>
                    <b>Searching for a career perfect for You?</b>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-left text-lg mr-2 max-w-3xl">
                    Find job positions tailored precisely to your skills and interests
                    within minutes, simply by signing up and uploading your CV. 
                    Our growing catalogue of extensive options is guaranteed to have
                    a range of options to your liking.
                    <br/><br/>
                    With an account on Connect, employers are able to discover your skills.
                    If you&apos;re unsure exactly where you want life to take you, let the
                    career you never knew you needed find you instead.
                    <br/><br/>
                    Applying has never been easier with everything in one place. Explore
                    open listings, apply within minutes, and track pending applications
                    all without even leaving the website.
                    <br/><br/>
                    Connect is free and open to anyone - whether it&apos;s your first internship
                    or your final stop. Sign up now to find that next step.
                  </p>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
          <TabsContent value="business" className="w-full flex justify-center">
            <section
              className="w-screen bg-slate-100 flex justify-center items-center h-[75vh] min-h-[500px] text-white text-4xl font-bold py-6"
              style={{
                backgroundImage:
                  "url(/landing_page_businesses_bg.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Message for Employers */}
              <Card className="bg-slate-100 w-[90%] max-w-[600px] mx-auto">
                <CardHeader>
                  <CardTitle>
                    <b>Looking to hire the best for your Business?</b>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-left text-lg mr-2 max-w-3xl">
                    Upload new job listings with ease to advertise them to the people
                    your firm needs. Connect ensures that your positions will be found by
                    those most suitable for it.
                    <br/><br/>
                    With a simple, user-friendly application process, you&apos;ll receive
                    more than enough interest in your positions. Of course, we&apos;ll help you
                    efficiently filter out the ones you need most.
                    <br/><br/>
                    On the dashboard, you&apos;ll have access to advanced analytics for your listings,
                    granting you the information needed to refine your advertising and
                    grow your business faster than ever.
                    <br/><br/>
                    Connect has the perfect companions for your growing business, you just need
                    to let them discover you. Sign up as an employer today.
                  </p>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
        </Tabs>
      </div>

      {/* SECTION 3 - USER REVIEWS AS A CAROUSEL OF CARDS */}
      <section className="bg-slate-300 flex flex-col justify-between items-center w-full h-[75vh] min-h-[500px] text-black text-4xl py-6">
        <div className="text-center text-3xl">
          What our users think...
        </div>
        {/* CAROUSEL */}
        <div className="flex-grow flex justify-center items-center w-[90%]">
          <Carousel opts={{ loop: true }} className="w-[90%] md:w-[80%]">
            <CarouselContent>
              <CarouselItem className="basis-full md:basis-1/3">
                <Card className="h-full flex flex-col bg-slate-100">
                  <CardHeader>★★★★★</CardHeader>
                  <CardContent className="flex-grow"><p className="text-2xl italic">
                    &quot;Landed my current job nearly 6 years ago with <b>Connect</b>, still loving it today!&quot;
                  </p></CardContent>
                  <CardFooter className="mt-auto"><p className="text-xl">
                    @james_heff - Job Seeker
                  </p></CardFooter>
                </Card>
              </CarouselItem>
              <CarouselItem className="basis-full md:basis-1/3">
                <Card className="h-full flex flex-col">
                  <CardHeader>★★★★★</CardHeader>
                  <CardContent className="flex-grow"><p className="text-2xl italic">
                    &quot;Running a small firm had never been easier. Over half of our team crossed paths through <b>Connect</b>.
                  </p></CardContent>
                  <CardFooter className="mt-auto"><p className="text-xl">
                    @jr_clarks - Business Owner
                  </p></CardFooter>
                </Card>
              </CarouselItem>
              <CarouselItem className="basis-full md:basis-1/3">
                <Card className="h-full flex flex-col bg-slate-100">
                  <CardHeader>★★★★★</CardHeader>
                  <CardContent className="flex-grow"><p className="text-2xl italic">
                    &quot;I went through nearly a dozen jobs with little passion. <b>Connect</b> found me my perfect career within days.&quot;
                  </p></CardContent>
                  <CardFooter className="mt-auto"><p className="text-xl">
                    @steverson  - Job Seeker
                  </p></CardFooter>
                </Card>
              </CarouselItem>
              <CarouselItem className="basis-full md:basis-1/3">
                <Card className="h-full flex flex-col">
                  <CardHeader>★★★★★</CardHeader>
                  <CardContent className="flex-grow"><p className="text-2xl italic">
                    &quot;<b>Connect</b> was able to recommend me my dream position within minutes, and got me the offer within days.&quot;
                  </p></CardContent>
                  <CardFooter className="mt-auto"><p className="text-xl">
                    @milans - Job Seeker
                  </p></CardFooter>
                </Card>
              </CarouselItem>
              <CarouselItem className="basis-full md:basis-1/3">
                <Card className="h-full flex flex-col bg-slate-100">
                  <CardHeader>★★★★★</CardHeader>
                  <CardContent className="flex-grow"><p className="text-2xl italic">
                    &quot;Through <b>Connect</b> I&quot;ve grown my online business faster than I ever could alone.&quot;
                  </p></CardContent>
                  <CardFooter className="mt-auto"><p className="text-xl">
                    @leo_j - Business Owner
                  </p></CardFooter>
                </Card>
              </CarouselItem>
              <CarouselItem className="basis-full md:basis-1/3">
                <Card className="h-full flex flex-col">
                  <CardHeader>★★★★★</CardHeader>
                  <CardContent className="flex-grow"><p className="text-2xl italic">
                    &quot;<b>Connect</b> saved me.&quot;
                  </p></CardContent>
                  <CardFooter className="mt-auto"><p className="text-xl">
                    @paul - Job Seeker
                  </p></CardFooter>
                </Card>
              </CarouselItem>
              <CarouselItem className="basis-full md:basis-1/3">
                <Card className="h-full flex flex-col bg-slate-100">
                  <CardHeader>★★★★★</CardHeader>
                  <CardContent className="flex-grow"><p className="text-2xl italic">
                    &quot;The tools offered by <b>Connect</b> are simply unrivaled.&quot;
                  </p></CardContent>
                  <CardFooter className="mt-auto"><p className="text-xl">
                    @marievankane - Job Seeker
                  </p></CardFooter>
                </Card>
              </CarouselItem>
              <CarouselItem className="basis-full md:basis-1/3">
                <Card className="h-full flex flex-col">
                  <CardHeader>★★★★★</CardHeader>
                  <CardContent className="flex-grow"><p className="text-2xl italic">
                    &quot;I wouldn&apos;t be where I am today without the help of <b>Connect</b>.&quot;
                  </p></CardContent>
                  <CardFooter className="mt-auto"><p className="text-xl">
                    @m_puranam - Job Seeker
                  </p></CardFooter>
                </Card>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="bg-slate-500 absolute -left-10" />
            <CarouselNext className="bg-slate-500 absolute -right-10" />
          </Carousel>
        </div>
        <div className="text-center text-3xl">
          Join them today for free.
        </div>
      </section>

      {/* to add a future section
      <section className="bg-slate-300 flex justify-center items-center h-[75vh] min-h-[500px] text-white text-4xl py-6">
        CONTENT
      </section>*/}
    </div>
  );
}
