import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ── Floating AI nodes ── */
function Nodes({ count = 60, mousePos }) {
  const group = useRef();
  const { size } = useThree();

  const data = useMemo(() => {
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8
      ),
      speed: 0.2 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      color: ['#7c3aed', '#06b6d4', '#a855f7', '#3b82f6', '#10b981'][Math.floor(Math.random() * 5)],
      scale: 0.04 + Math.random() * 0.08,
    }));
  }, [count]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.children.forEach((mesh, i) => {
      const d = data[i];
      mesh.position.y = d.pos.y + Math.sin(t * d.speed + d.phase) * 0.6;
      mesh.position.x = d.pos.x + Math.cos(t * d.speed * 0.7 + d.phase) * 0.3;
      mesh.rotation.y = t * 0.5;
      mesh.rotation.x = t * 0.3;
    });
    // Mouse parallax
    if (mousePos) {
      group.current.rotation.y = mousePos.x * 0.00015;
      group.current.rotation.x = mousePos.y * 0.00015;
    }
  });

  return (
    <group ref={group}>
      {data.map((d, i) => (
        <mesh key={i} position={d.pos} scale={d.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={d.color} transparent opacity={0.7} wireframe />
        </mesh>
      ))}
    </group>
  );
}

/* ── Neural connections (lines between nodes) ── */
function NeuralLines({ count = 40 }) {
  const ref = useRef();

  const geometry = useMemo(() => {
    const points = [];
    for (let i = 0; i < count; i++) {
      const a = new THREE.Vector3((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8);
      const b = new THREE.Vector3((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8);
      points.push(a, b);
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.material.opacity = 0.06 + Math.sin(clock.getElapsedTime() * 0.5) * 0.03;
    }
  });

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#7c3aed" transparent opacity={0.08} />
    </lineSegments>
  );
}

/* ── Particle field ── */
function ParticleField({ count = 2000 }) {
  const ref = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#7c3aed'),
      new THREE.Color('#06b6d4'),
      new THREE.Color('#a855f7'),
      new THREE.Color('#1d4ed8'),
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.015;
      ref.current.rotation.x = clock.getElapsedTime() * 0.008;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

/* ── Holographic rings ── */
function HoloRings() {
  const rings = [
    { r: 5, speed: 0.08, color: '#7c3aed', tilt: 0.3, opacity: 0.12 },
    { r: 7, speed: -0.05, color: '#06b6d4', tilt: 1.2, opacity: 0.08 },
    { r: 3.5, speed: 0.15, color: '#a855f7', tilt: 0.7, opacity: 0.15 },
    { r: 9, speed: -0.03, color: '#3b82f6', tilt: 0.5, opacity: 0.05 },
  ];
  return (
    <>
      {rings.map((r, i) => <Ring key={i} {...r} />)}
    </>
  );
}

function Ring({ r, speed, color, tilt, opacity }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = clock.getElapsedTime() * speed;
      ref.current.rotation.x = tilt;
    }
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[r, 0.008, 16, 200]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

export default function NeuralBackground({ mousePos, intensity = 1 }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={Math.min(window.devicePixelRatio, 2)}
      >
        <ParticleField count={Math.floor(1500 * intensity)} />
        <Nodes count={Math.floor(50 * intensity)} mousePos={mousePos} />
        <NeuralLines count={Math.floor(35 * intensity)} />
        <HoloRings />
      </Canvas>
    </div>
  );
}
