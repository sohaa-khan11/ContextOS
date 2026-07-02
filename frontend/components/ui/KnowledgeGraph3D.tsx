"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Line } from "@react-three/drei";
import * as THREE from "three";

function GraphNodes() {
  const group = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState<number | null>(null);

  // Generate mock nodes
  const nodes = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6
      ),
      color: i === 0 ? "#FF4D67" : i % 3 === 0 ? "#8b5cf6" : "#ffffff",
    }));
  }, []);

  // Generate mock connections
  const lines = useMemo(() => {
    const connections = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.6) {
          connections.push([nodes[i].position, nodes[j].position]);
        }
      }
    }
    return connections;
  }, [nodes]);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.1;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={group}>
      {lines.map((points, idx) => (
        <Line 
          key={`line-${idx}`}
          points={points}
          color="#ffffff"
          opacity={0.15}
          transparent
          lineWidth={1}
        />
      ))}
      
      {nodes.map((node, idx) => (
        <Sphere 
          key={`node-${idx}`} 
          position={node.position} 
          args={[0.2, 32, 32]}
          onPointerOver={() => setHovered(idx)}
          onPointerOut={() => setHovered(null)}
        >
          <meshStandardMaterial 
            color={node.color} 
            emissive={node.color}
            emissiveIntensity={hovered === idx ? 2 : 0.8}
            toneMapped={false}
          />
          {/* Subtle glowing halo */}
          <Sphere args={[0.3, 16, 16]}>
            <meshBasicMaterial 
              color={node.color} 
              transparent 
              opacity={hovered === idx ? 0.3 : 0.1} 
              blending={THREE.AdditiveBlending} 
            />
          </Sphere>
        </Sphere>
      ))}
    </group>
  );
}

export function KnowledgeGraph3D() {
  return (
    <div className="w-full h-[400px] relative rounded-3xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_10px_30px_-10px_rgba(0,0,0,0.8)] cursor-move">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Live Graph Sync</span>
      </div>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <GraphNodes />
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.5}
          minDistance={3}
          maxDistance={12}
        />
      </Canvas>
    </div>
  );
}
