import React, { useMemo, useRef } from "react";
import { Points, PointMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import * as THREE from "three";

type WarpParticlesProps = {
  mesh: THREE.Mesh;
  mode: "WARP_OUT" | "WARP_IN";
  onAnimationComplete: () => void;
};

type Particle = {
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  life: number;
};

const PARTICLE_COUNT = 2000;

const WarpParticles: React.FC<WarpParticlesProps> = ({ mesh, mode, onAnimationComplete }) => {
  const pointsRef = useRef<THREE.Points>(null!);

  const particles = useMemo<Particle[] | null>(() => {
    if (!mesh) {
      return null;
    }

    const sampler = new MeshSurfaceSampler(mesh).build();
    const tempParticles: Particle[] = [];
    const position = new THREE.Vector3();
    const normal = new THREE.Vector3();

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      sampler.sample(position, normal);
      if (mode === "WARP_OUT") {
        tempParticles.push({
          startPos: position.clone(),
          endPos: position.clone().add(normal.multiplyScalar(0.5 + Math.random() * 0.5)),
          life: 1,
        });
      } else {
        tempParticles.push({
          startPos: position.clone().add(normal.multiplyScalar(0.5 + Math.random() * 0.5)),
          endPos: position.clone(),
          life: 1,
        });
      }
    }
    return tempParticles;
  }, [mesh, mode]);

  useFrame((_, delta) => {
    if (!particles || !pointsRef.current) {
      return;
    }

    const { current } = pointsRef;
    const positions = current.geometry.attributes.position.array as Float32Array;
    let allDone = true;

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const particle = particles[i];
      if (particle.life > 0) {
        allDone = false;
        particle.life -= delta * 0.8;
        const t = Math.max(0, particle.life);
        const currentPos = new THREE.Vector3().lerpVectors(particle.endPos, particle.startPos, t);
        positions.set(currentPos.toArray(), i * 3);
      } else {
        positions.set([1000, 1000, 1000], i * 3);
      }
    }

    current.geometry.attributes.position.needsUpdate = true;

    if (allDone) {
      onAnimationComplete();
    }
  });

  if (!particles) {
    return null;
  }

  const initialPositions = new Float32Array(particles.flatMap((particle) => particle.startPos.toArray()));

  return (
    <Points ref={pointsRef} positions={initialPositions}>
      <PointMaterial
        transparent
        color="#00ffff"
        size={0.03}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </Points>
  );
};

export default WarpParticles;
