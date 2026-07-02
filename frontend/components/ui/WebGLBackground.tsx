"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function ParticleSwarm() {
  const ref = useRef<THREE.Points>(null!);
  
  // Create thousands of particles for a deep space feeling
  const [positions, colors] = useMemo(() => {
    const count = 4000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const colorA = new THREE.Color("#FF4D67"); // Primary
    const colorB = new THREE.Color("#8b5cf6"); // Purple
    const colorC = new THREE.Color("#ffffff");
    
    for (let i = 0; i < count; i++) {
      // Sphere distribution
      const r = 20 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // Assign random color gradient
      const mix = Math.random();
      const mixedColor = mix > 0.8 ? colorC : mix > 0.4 ? colorB : colorA;
      
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }
    
    return [positions, colors];
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    // Slow cinematic rotation
    ref.current.rotation.x = state.clock.elapsedTime * 0.05;
    ref.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  return (
    <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export function WebGLBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-black">
      {/* Background vignette & noise overlay */}
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80" />
      <div 
        className="absolute inset-0 z-20 opacity-[0.03]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />
      
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }} dpr={[1, 2]}>
        <ParticleSwarm />
      </Canvas>
    </div>
  );
}
