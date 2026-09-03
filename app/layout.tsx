import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"StayGuwahati | Local stays, locally known",description:"Discover handpicked homestays across Guwahati."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}