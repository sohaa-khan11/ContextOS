"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

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
        child.rotation.y = state.clock.elapsedTime * layers[i].speed;
        child.rotation.x = Math.sin(state.clock.elapsedTime * layers[i].speed * 1.5) * 0.05;
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
              count={layer.points.length}
              array={new Float32Array(layer.points.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
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
function ProjectKnowledgeGraph({ color, active, position }: { color: string, active: boolean, position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null!);
  const materialsRef = useRef<THREE.Material[]>([]);
  
  const nodes = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => {
      const type = i % 5 === 0 ? "decision" : i % 7 === 0 ? "risk" : "context";
      const nodeColor = type === "decision" ? "#FF4D67" : type === "risk" ? "#facc15" : color;
      return {
        id: i,
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        ),
        type,
        color: nodeColor,
        size: type === "context" ? Math.random() * 0.1 + 0.05 : 0.25
      };
    });
  }, [color]);

  const lines = useMemo(() => {
    const connections = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].pos.distanceTo(nodes[j].pos) < 3.5) {
          connections.push([nodes[i].pos, nodes[j].pos]);
        }
      }
    }
    return connections;
  }, [nodes]);

  useEffect(() => {
    materialsRef.current.forEach(mat => {
      if (mat) mat.opacity = 0;
    });
    if (group.current) group.current.visible = false;
  }, []);

  useFrame((state) => {
    if (group.current) {
      if (active) group.current.rotation.y += 0.002;
      
      const targetOpacity = active ? 1 : 0;
      materialsRef.current.forEach(mat => {
        if (mat) mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity * (mat.userData.baseOpacity || 0.8), 0.05);
      });
      
      group.current.visible = materialsRef.current[0]?.opacity > 0.001;
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
          lineWidth={1} 
          material-userData={{ baseOpacity: 0.05 }}
          ref={(m: any) => { if (m?.material && !materialsRef.current.includes(m.material)) materialsRef.current.push(m.material) }}
        />
      ))}
      {nodes.map((node) => (
        <group key={`pnode-${node.id}`} position={node.pos}>
          <mesh>
            {node.type === "decision" ? <octahedronGeometry args={[node.size]} /> : 
             node.type === "risk" ? <icosahedronGeometry args={[node.size]} /> : 
             <sphereGeometry args={[node.size, 16, 16]} />}
            <meshBasicMaterial 
              color={node.color} 
              transparent 
              userData={{ baseOpacity: 0.8 }}
              ref={(m: any) => { if (m && !materialsRef.current.includes(m)) materialsRef.current.push(m) }} 
            />
          </mesh>
          {node.type !== "context" && (
            <mesh>
              <sphereGeometry args={[node.size * 1.5, 16, 16]} />
              <meshBasicMaterial 
                color={node.color} 
                transparent 
                blending={THREE.AdditiveBlending} 
                userData={{ baseOpacity: 0.2 }}
                ref={(m: any) => { if (m && !materialsRef.current.includes(m)) materialsRef.current.push(m) }} 
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

  const projects = [
    { id: "1", name: "ContextOS Core", nodesCount: 142, position: new THREE.Vector3(-6, 2, -5), color: "#FF4D67" },
    { id: "2", name: "Marketing Strategy", nodesCount: 56, position: new THREE.Vector3(5, -2, -2), color: "#8b5cf6" },
    { id: "3", name: "Q3 Fundraising", nodesCount: 230, position: new THREE.Vector3(0, 4, -8), color: "#3b82f6" },
  ];
  
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

      // Fly into project
      gsap.to(camera.position, {
        x: activeProject.position.x,
        y: activeProject.position.y,
        z: activeProject.position.z + 10,
        duration: 2,
        ease: "expo.inOut"
      });
      gsap.to(camera.rotation, {
        x: 0, y: 0, z: 0,
        duration: 2,
        ease: "expo.inOut"
      });
    } else if (isHub) {
      // Restore FOV gently if it was mid-warp
      gsap.to(camera, {
        fov: 45,
        duration: 1.5,
        ease: "power3.inOut",
        onUpdate: () => camera.updateProjectionMatrix(),
      });

      // Fly back to Hub wide angle
      gsap.to(camera.position, {
        x: 0, y: 0, z: 15,
        duration: 1.5,
        ease: "expo.inOut"
      });
      
      // Delay unmounting the project graph so the fade-out completes
      const timer = setTimeout(() => {
        setMountedProject(null);
      }, 1500);
      return () => clearTimeout(timer);
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
        if (!p) return null;
        return (
          <ProjectKnowledgeGraph 
            key={`pkg-${p.id}`} 
            color={p.color} 
            active={activeProjectId === p.id} 
            position={[p.position.x, p.position.y, p.position.z]} 
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
