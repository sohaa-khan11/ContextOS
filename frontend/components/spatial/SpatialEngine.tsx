"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { useGraphStore } from "@frontend/store/useGraphStore";

// --- PREMIUM NEBULA BACKGROUND (Hub Atmosphere) ---
function PremiumNebulaBackground({ isHub }: { isHub: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);
  const materialsRef = useRef<THREE.PointsMaterial[]>([]);

  const layers = useMemo(() => {
    return [
      { count: 600, size: 0.08, color: "#ffffff", speed: 0.0002, depth: 40, baseOpacity: 0.15 },
      { count: 250, size: 0.2, color: "#8b5cf6", speed: 0.0003, depth: 30, baseOpacity: 0.2 },
      { count: 150, size: 0.35, color: "#FF4D67", speed: 0.0004, depth: 20, baseOpacity: 0.25 },
      { count: 100, size: 0.5, color: "#3b82f6", speed: 0.0005, depth: 15, baseOpacity: 0.3 },
    ].map(layer => {
      const pts = [];
      for (let i = 0; i < layer.count; i++) {
        pts.push(new THREE.Vector3(
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * layer.depth - 5
        ));
      }
      return { ...layer, points: pts };
    });
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        if (layers[i]) {
            child.rotation.y = state.clock.elapsedTime * layers[i].speed;
            child.rotation.x = Math.sin(state.clock.elapsedTime * layers[i].speed * 1.5) * 0.05;
        }
      });
    }
    const targetOpacity = isHub ? 1 : 0;
    materialsRef.current.forEach((mat, i) => {
      if (mat) mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity * layers[i].baseOpacity, 0.05);
    });
  });

  return (
    <group ref={groupRef}>
      {layers.map((layer, idx) => (
        <points key={idx}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(layer.points.flatMap(p => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <pointsMaterial 
            ref={(el) => { if (el) materialsRef.current[idx] = el }}
            size={layer.size} 
            color={layer.color} 
            transparent 
            opacity={0} 
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      ))}
    </group>
  );
}

// --- PROJECT INDEPENDENT KNOWLEDGE GRAPH (Only visible in project) ---
function ProjectKnowledgeGraph({ color, active, position, projectId }: { color: string, active: boolean, position: [number, number, number], projectId: string }) {
  const group = useRef<THREE.Group>(null!);
  const materialsRef = useRef<THREE.Material[]>([]);
  const { scene, camera } = useThree();
  
  const { nodes: rawNodes, edges: rawEdges, fetchGraph, projectId: storeProjectId } = useGraphStore();

  useEffect(() => {
    if (active && projectId && storeProjectId !== projectId) {
        fetchGraph(projectId);
    }
  }, [active, projectId, storeProjectId, fetchGraph]);

  const { nodes, lines } = useMemo(() => {
    if (!rawNodes || !rawEdges) return { nodes: [], lines: [] };
    
    // We deterministically seed position using id hash to avoid jumping if node re-renders
    // But for now, we just assign random positions as before, just seeded once per graph update
    const nodesWithPos = rawNodes.map((n: any) => {
        const pos = new THREE.Vector3(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
        );
        const nType = (n.type || "").toLowerCase();
        return { 
            ...n, 
            pos, 
            color: nType === "decision" ? "#FF4D67" : nType === "risk" ? "#facc15" : color,
            size: nType === "context" ? Math.random() * 0.1 + 0.05 : 0.25
        };
    });
    
    const validEdges = rawEdges.map((e: any) => {
        const src = nodesWithPos.find((n: any) => n.id === e.source);
        const tgt = nodesWithPos.find((n: any) => n.id === e.target);
        return src && tgt ? [src.pos, tgt.pos] : null;
    }).filter(Boolean) as any[];
    
    return { nodes: nodesWithPos, lines: validEdges };
  }, [rawNodes, rawEdges, color]);

  useFrame((state) => {
    if (group.current && active) {
      group.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={group} position={position}>
      {lines.map((pts, idx) => (
        <Line 
          key={`pline-${idx}`} 
          points={pts} 
          color="#ffffff" 
          transparent 
          lineWidth={2} 
          opacity={0.3}
        />
      ))}
      {nodes.map((node) => (
        <group key={`pnode-${node.id}`} position={node.pos}>
          <mesh>
            {(() => {
              const nType = (node.type || "").toLowerCase();
              if (nType === "decision") return <octahedronGeometry args={[node.size * 2]} />;
              if (nType === "risk") return <icosahedronGeometry args={[node.size * 2]} />;
              return <sphereGeometry args={[node.size * 2, 16, 16]} />;
            })()}
            <meshBasicMaterial  
              color={node.color} 
              transparent 
              opacity={0.8}
            />
          </mesh>
          {(node.type || "").toLowerCase() !== "context" && (
            <mesh>
              <sphereGeometry args={[node.size * 3, 16, 16]} />
              <meshBasicMaterial 
                color={node.color} 
                transparent 
                opacity={0.2}
                blending={THREE.AdditiveBlending} 
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

// --- CONSTELLATION OVERVIEW (Home Hub) ---
function Constellation({ 
  position, name, nodesCount, color, id, isHub 
}: { 
  position: [number, number, number], name: string, nodesCount: number, color: string, id: string, isHub: boolean
}) {
  const group = useRef<THREE.Group>(null!);
  const materialsRef = useRef<THREE.Material[]>([]);
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  const nodes = useMemo(() => {
    return Array.from({ length: 60 }).map(() => ({
      pos: new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4),
      size: Math.random() * 0.15 + 0.05
    }));
  }, []);

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.002;
      group.current.rotation.x += 0.001;
      
      const targetScale = hovered && isHub ? 1.1 : 1;
      group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

      // Fade out completely when not in Hub
      const targetOpacity = isHub ? 1 : 0;
      materialsRef.current.forEach(mat => {
        if (mat) mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity * (mat.userData.baseOpacity || 0.4), 0.05);
      });
      
      group.current.visible = materialsRef.current[0]?.opacity > 0.001;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!isHub) return;
    router.push(`/projects/${id}`);
  };

  return (
    <group position={position} ref={group}>
      <mesh 
        visible={false} 
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[2.5, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <group>
        {nodes.map((node, i) => (
          <mesh key={i} position={node.pos}>
            <sphereGeometry args={[node.size, 16, 16]} />
            <meshBasicMaterial 
              color={hovered ? "#ffffff" : color} 
              transparent 
              userData={{ baseOpacity: hovered ? 0.9 : 0.4 }}
              ref={(m: any) => { if (m && !materialsRef.current.includes(m)) materialsRef.current.push(m) }} 
            />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            blending={THREE.AdditiveBlending} 
            userData={{ baseOpacity: hovered ? 0.8 : 0.3 }}
            ref={(m: any) => { if (m && !materialsRef.current.includes(m)) materialsRef.current.push(m) }} 
          />
        </mesh>
      </group>

      <Html position={[0, -3, 0]} center className="pointer-events-none" style={{ opacity: isHub ? 1 : 0, transition: 'opacity 0.5s' }}>
        <div className={`transition-all duration-500 flex flex-col items-center ${hovered ? 'opacity-100 scale-110' : 'opacity-40 scale-100'}`}>
          <div className="text-white font-semibold tracking-wider text-xl mb-1 whitespace-nowrap drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            {name}
          </div>
          <div className="text-[#FF4D67] font-mono text-xs uppercase tracking-[0.2em]">
            {nodesCount} Memories
          </div>
        </div>
      </Html>
    </group>
  );
}

function SceneDirector() {
  const pathname = usePathname();
  const { camera } = useThree();
  const isHub = pathname === "/";
  const activeProjectId = pathname.startsWith("/projects/") ? pathname.split("/projects/")[1] : null;

  const [projects, setProjects] = useState<any[]>([]);
  
  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
          console.log("[DEBUG] /api/projects response:", data);
          if (Array.isArray(data)) {
              // Assign random colors and positions since this is just visualization for now
              const colors = ["#FF4D67", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"];
              setProjects(data.map((p, i) => ({
                  ...p,
                  nodesCount: p.nodesCount || Math.floor(Math.random() * 200 + 50),
                  position: new THREE.Vector3((i * 5) % 15 - 5, (i * 3) % 10 - 2, (i * -4) % 15 - 2),
                  color: colors[i % colors.length]
              })));
          } else {
              console.log("[DEBUG] /api/projects is NOT an array!");
          }
      })
      .catch(e => console.error("Failed to load projects", e));
      
    const handleProjectDeleted = (e: any) => {
        setProjects(prev => prev.filter(p => p.id !== e.detail.id));
    };
    
    document.addEventListener('project-deleted', handleProjectDeleted);
    return () => {
        document.removeEventListener('project-deleted', handleProjectDeleted);
    };
  }, []);
  
  const activeProject = projects.find(p => p.id === activeProjectId);
  const orbitControlsRef = useRef<any>(null);

  const [mountedProject, setMountedProject] = useState<string | null>(activeProjectId);

  useEffect(() => {
    if (!isHub && activeProject) {
      setMountedProject(activeProject.id);
      
      // Cinematic FOV Warp
      gsap.to(camera, {
        fov: 75,
        duration: 0.8,
        ease: "power2.in",
        onUpdate: () => camera.updateProjectionMatrix(),
        onComplete: () => {
          gsap.to(camera, {
            fov: 45,
            duration: 1.2,
            ease: "power3.out",
            onUpdate: () => camera.updateProjectionMatrix(),
          });
        }
      });

      // Camera Fly-in
      gsap.to(camera.position, {
        x: activeProject.position.x,
        y: activeProject.position.y,
        z: activeProject.position.z + 15,
        duration: 1.5,
        ease: "power3.inOut"
      });
      
      if (orbitControlsRef.current) {
        gsap.to(orbitControlsRef.current.target, {
          x: activeProject.position.x,
          y: activeProject.position.y,
          z: activeProject.position.z,
          duration: 1.5,
          ease: "power3.inOut"
        });
      }
    } else if (isHub) {
      // Fly back to Hub
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 15,
        duration: 1.5,
        ease: "power3.inOut",
        onComplete: () => setMountedProject(null)
      });
      if (orbitControlsRef.current) {
        gsap.to(orbitControlsRef.current.target, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1.5,
          ease: "power3.inOut"
        });
      }
    }
  }, [isHub, activeProject, camera]);

  useFrame((state) => {
    if (isHub) {
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, (state.mouse.x * 2), 0.02);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, (state.mouse.y * 2), 0.02);
      state.camera.lookAt(0, 0, 0);
    } else if (orbitControlsRef.current) {
      orbitControlsRef.current.update();
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
      
      <PremiumNebulaBackground isHub={isHub} />
      
      {projects.map(p => (
        <Constellation 
          key={p.id} 
          id={p.id} 
          name={p.name} 
          nodesCount={p.nodesCount} 
          position={[p.position.x, p.position.y, p.position.z]} 
          color={p.color} 
          isHub={isHub} 
        />
      ))}

      {mountedProject && (() => {
        const p = projects.find(proj => proj.id === mountedProject);
        console.log("[DEBUG] mountedProject is", mountedProject, "Found project in SpatialEngine:", p ? p.name : "NOT FOUND");
        if (!p) return null;
        return (
          <ProjectKnowledgeGraph 
            key={`pkg-${p.id}`} 
            color={p.color} 
            active={activeProjectId === p.id} 
            position={[p.position.x, p.position.y, p.position.z]} 
            projectId={p.id}
          />
        );
      })()}
      
      {!isHub && activeProject && (
        <OrbitControls 
          ref={orbitControlsRef}
          enableDamping 
          dampingFactor={0.05} 
          minDistance={2} 
          maxDistance={30}
          target={activeProject.position}
          makeDefault
        />
      )}
    </>
  );
}

export function SpatialEngine() {
  return (
    <div className="fixed inset-0 w-screen h-screen z-0 bg-[#05010a] overflow-hidden pointer-events-auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#130722] via-[#05010a] to-black opacity-80 pointer-events-none" />

      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <fog attach="fog" args={["#05010a", 5, 45]} />
        
        <SceneDirector />

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.8} />
          <DepthOfField focusDistance={0.01} focalLength={0.03} bokehScale={3} height={480} />
          <Vignette eskil={false} offset={0.1} darkness={1.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
