'use client';
import { Canvas } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function EmeraldFlowerMesh() {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    // Remove the scroll trigger entirely to only show the front of the flower!
    // The flower will simply spin on its Z-axis like a pinwheel.

    gsap.to(groupRef.current.rotation, {
      z: Math.PI * 2,
      duration: 120,
      repeat: -1,
      ease: 'none'
    });
  }, []);

  const petals = useMemo(() => {
    const items = [];
    const layers = 5;
    const petalsPerLayer = [6, 12, 18, 24, 30];
    
    for (let l = 0; l < layers; l++) {
      const count = petalsPerLayer[l];
      const radius = 0.5 + l * 0.4;
      const tilt = Math.PI * 0.15 + (l * 0.12); // Outer petals lean back more
      
      for (let i = 0; i < count; i++) {
        // Stagger rotation for organic look
        const angle = (i / count) * Math.PI * 2 + (l * 0.5); 
        const petalLength = 2.5 + l * 1.2;
        
        items.push(
          <group key={`${l}-${i}`} rotation={[0, 0, angle]}>
            <mesh 
              position={[0, radius + petalLength, -l * 1.5]} 
              rotation={[tilt, 0, 0]}
              scale={[1 + l * 0.3, petalLength, 0.15]}
            >
              <sphereGeometry args={[1, 16, 12]} />
              <meshStandardMaterial 
                color="#005B41" // Deep Emerald Green
                roughness={0.25}
                metalness={0.8}
              />
            </mesh>
          </group>
        );
      }
    }
    return items;
  }, []);

  return (
    <Float speed={1.5} rotationIntensity={0.8} floatIntensity={2}>
      <group ref={groupRef} position={[15, 0, -25]} scale={[1.2, 1.2, 1.2]}>
        {/* Flower Center Stigma */}
        <mesh position={[0, 0, 1]}>
          <sphereGeometry args={[1.8, 24, 24]} />
          <meshStandardMaterial color="#001F12" roughness={0.9} metalness={0.1} />
        </mesh>
        
        {/* Flower Petals */}
        {petals}
      </group>
    </Float>
  );
}

export default function EmeraldDahlia() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <Canvas dpr={[1, 2]} gl={{ antialias: false, powerPreference: 'high-performance' }} camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={1.5} color="#EDE8DF" />
        <directionalLight position={[10, 20, 15]} intensity={3} color="#ffffff" />
        <directionalLight position={[-10, -20, -15]} intensity={1} color="#EDE8DF" />
        
        {/* Cinematic Emerald Glare Lights */}
        <pointLight position={[0, 0, -5]} intensity={1500} color="#00FF88" distance={150} />
        <pointLight position={[15, -5, -10]} intensity={2000} color="#00CC66" distance={150} />
        <pointLight position={[-10, 10, -20]} intensity={1000} color="#005B41" distance={150} />

        <Environment preset="city" />
        <EmeraldFlowerMesh />
      </Canvas>
    </div>
  );
}
