import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "../components/Navber";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata = {
  metadataBase: new URL("https://dazroshop.vercel.app"),
  title: {
    default: "DazroShop | Online Shopping in Bangladesh",
    template: "%s | DazroShop",
  },
  description: "DazroShop is an online shopping platform in Bangladesh...",
  icons: {
    icon: "/icon.png",
  },
};
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <Navbar />
        {children}
        <Footer/>
      </body>
    </html>
  );
}