import { SpatialEngine } from "@frontend/components/spatial/SpatialEngine";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-black text-foreground overflow-hidden selection:bg-primary/30 selection:text-white">
      {/* Global CSS noise overlay for cinematic texture */}
      <div 
        className="absolute inset-0 z-50 pointer-events-none mix-blend-overlay opacity-[0.15]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />
      
      {/* The Global WebGL 3D Engine */}
      <SpatialEngine />

      {/* The HTML HUD Layer */}
      <main className="relative z-10 w-full h-full pointer-events-none">
        {children}
      </main>
    </div>
  );
}
