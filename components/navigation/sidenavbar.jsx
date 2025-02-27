// 'use client';

// import { ChevronLeft, Home, Image, Menu, Tag, Upload, Users } from 'lucide-react';
// import { useState } from 'react';

// export default function SideNavbar() {
//   const [isOpen, setIsOpen] = useState(true);

//   return (
//     <div className={`h-screen bg-[#061028] text-white flex flex-col p-4 transition-all ${isOpen ? 'w-64' : 'w-20'}`}>
//       {/* Header: Logo + Collapse Button */}
//       <div className="flex items-center justify-between mb-6 p-3">
//         {isOpen && <span className="text-lg font-bold">SmileShot</span>}

//         {/* html body.__className_d3a18c div.flex.h-screen div.h-screen.bg-[#061028].text-white.flex.flex-col.p-4.transition-all.w-20 nav.flex.flex-col.gap-2 button.flex.items-center.gap-3.p-3.text-left.w-full.rounded-lg.hover:bg-gray-700 */}
//         <button type="button" onClick={() => setIsOpen(!isOpen)} className="rounded-md flex-none hover:bg-gray-700">
//           {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
//         </button>
//       </div>

//       {/* Navigation Buttons */}
//       <nav className="flex flex-col gap-2">
//         {/* <Menu size={35} className="hover:bg-gray-700 rounded-md p-2" /> */}

//         <button type="button" className="flex items-center gap-3 p-3 text-left w-full rounded-md hover:bg-gray-700">
//           <Home className="hover:bg-gray-700 rounded-md p-2 size-[4rem]" />
//           {isOpen && <span>Hiii</span>}
//         </button>

//         <div className="w-full">
//           <button type="button" className="rounded-md flex-row hover:bg-gray-700">
//             <Home size={35} className="hover:bg-gray-700 rounded-md p-2" />
//             Hi
//           </button>
//         </div>

//         <Home size={35} className="hover:bg-gray-700 rounded-md p-2">
//           {/* {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />} */}
//         </Home>
//         <Upload size={35} className="hover:bg-gray-700 rounded-md p-2" />
//         <Users size={35} className="hover:bg-gray-700 rounded-md p-2" />
//         <Image size={35} className="hover:bg-gray-700 rounded-md p-2" />
//         <Tag size={35} className="hover:bg-gray-700 rounded-md p-2" />

//         <div className="border-t border-gray-600 my-2" />

//         <Tag size={35} className="hover:bg-gray-700 rounded-md p-2" />
//       </nav>

//       {/* User Profile Section */}
//       <div className="mt-auto flex items-center gap-3 p-3 hover:bg-gray-700 rounded-md cursor-pointer">
//         <img src="/images/profile.jpg" alt="User" className="w-10 h-10 rounded-full" />
//         {isOpen && (
//           <div>
//             <p className="font-medium">Dr. John Doe</p>
//             <p className="text-sm text-gray-400">Dentist Role</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function NavButton({ icon, label, isOpen }: { icon: React.ReactNode; label: string; isOpen: boolean }) {
//   return (
//     <button type="button" className="flex items-center gap-3 p-3 text-left w-full rounded-md hover:bg-gray-700">
//       {icon}
//       {isOpen && <span>{label}</span>}
//     </button>
//   );
// }
