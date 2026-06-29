import { Header } from "@/components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-background">
      <Header />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="w-full h-full p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
