import { Navbar } from "@/components/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="fixed w-full top-0 left-0 right-0 z-10">
        <Navbar />
      </div>
      <div className="mt-20">{children}</div>
    </>
  );
}
