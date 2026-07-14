"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect, useState } from "react";
import {
  QuadraticBezierCurve3,
  Vector3,
  Group,
  MeshStandardMaterial,
  TubeGeometry,
} from "three";

export function MatchArcs() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Theme colors
  const coralHex = isDark ? "#F2622A" : "#E85A24";
  const tealHex = isDark ? "#2DD4BF" : "#0F9E8E";
  const accentHex = isDark ? "#F2622A" : "#5A3F8C";

  // Geometry: two start points and a shared midpoint
  const start1 = useMemo(() => new Vector3(-1.4, 0.0, 0.0), []);
  const start2 = useMemo(() => new Vector3(1.4, 0.0, 0.0), []);
  const mid = useMemo(() => new Vector3(0, 1.0, 0.0), []);

  const curve1 = useMemo(
    () => new QuadraticBezierCurve3(start1, new Vector3(-0.7, 1.2, 0.0), mid),
    [start1, mid]
  );
  const curve2 = useMemo(
    () => new QuadraticBezierCurve3(start2, new Vector3(0.7, 1.2, 0.0), mid),
    [start2, mid]
  );

  // TubeGeometry — thicker tubes for visibility
  const tube1 = useMemo(() => new TubeGeometry(curve1, 48, 0.04, 12, false), [curve1]);
  const tube2 = useMemo(() => new TubeGeometry(curve2, 48, 0.04, 12, false), [curve2]);

  // Refs for imperative animation
  const mat1Ref = useRef<MeshStandardMaterial>(null);
  const mat2Ref = useRef<MeshStandardMaterial>(null);
  const marker1MatRef = useRef<MeshStandardMaterial>(null);
  const marker2MatRef = useRef<MeshStandardMaterial>(null);
  const pulseRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const cycle = 5;
    const p = (t % cycle) / cycle;

    // Markers always visible, arcs and pulse animate
    let arcOpacity = 0;
    let pulseScale = 0.01;
    let pulseOpacity = 0;

    if (p < 0.25) {
      // Arcs fade in
      const fadeIn = p / 0.25;
      arcOpacity = fadeIn * fadeIn * 0.9;
    } else if (p < 0.75) {
      // Hold arcs + animate pulse
      arcOpacity = 0.9;
      const pulseP = (p - 0.25) / 0.5;
      const sin = Math.sin(pulseP * Math.PI);
      pulseScale = 0.5 + sin * 0.6;
      pulseOpacity = sin * 0.95;
    } else {
      // Fade out arcs
      const fadeOut = 1 - (p - 0.75) / 0.25;
      arcOpacity = fadeOut * fadeOut * 0.9;
      pulseScale = 0.5;
      pulseOpacity = fadeOut * 0.3;
    }

    if (mat1Ref.current) mat1Ref.current.opacity = arcOpacity;
    if (mat2Ref.current) mat2Ref.current.opacity = arcOpacity;

    if (pulseRef.current) {
      pulseRef.current.scale.setScalar(pulseScale);
      pulseRef.current.children.forEach((child: unknown) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material) (mesh.material as THREE.Material).opacity = pulseOpacity;
      });
    }
  });

  return (
    <group>
      {/* Marker 1 — Coral sphere — always visible */}
      <mesh position={start1}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial
          ref={marker1MatRef}
          color={coralHex}
          emissive={coralHex}
          emissiveIntensity={2}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Marker 2 — Teal sphere — always visible */}
      <mesh position={start2}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial
          ref={marker2MatRef}
          color={tealHex}
          emissive={tealHex}
          emissiveIntensity={2}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Arc 1 — Coral tube */}
      <mesh geometry={tube1}>
        <meshStandardMaterial
          ref={mat1Ref}
          color={coralHex}
          emissive={coralHex}
          emissiveIntensity={1.5}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Arc 2 — Teal tube */}
      <mesh geometry={tube2}>
        <meshStandardMaterial
          ref={mat2Ref}
          color={tealHex}
          emissive={tealHex}
          emissiveIntensity={1.5}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Convergence pulse at midpoint */}
      <group ref={pulseRef} position={mid}>
        <mesh>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial
            color={accentHex}
            emissive={accentHex}
            emissiveIntensity={2.5}
            transparent
            opacity={0}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.26, 32]} />
          <meshStandardMaterial
            color={accentHex}
            emissive={accentHex}
            emissiveIntensity={1.8}
            transparent
            opacity={0}
          />
        </mesh>
      </group>
    </group>
  );
}
