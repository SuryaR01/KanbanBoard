import { getSession } from "@/app/auth";
import "./globals.css";
import ClientWrapper from "./components/ClientWrapper";

export const metadatd = {
  title: "MyApp - Navbar",
  description: "Navigation bar for MyApp",
  openGraph: {
    title: "MyApp - Navbar",
    description: "Navigation bar for MyApp",
    image: "/og-image.png",
  },
};

// THIS WILL WORK
export default async function RootLayout({ children }) {
  const session = await getSession();
  return (
    <html lang="en">
      <body>
        <ClientWrapper session={session}>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
