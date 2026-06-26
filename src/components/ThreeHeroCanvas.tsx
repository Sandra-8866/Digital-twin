import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGovernanceStore } from '../store/governanceStore';

interface RegionNode {
  id: 'india' | 'Kerala' | 'Andaman & Nicobar Islands' | 'lakshadweep';
  name: string;
  position: [number, number, number];
  color: string;
}

const REGION_NODES: RegionNode[] = [
  {
    id: 'india',
    name: 'Government of India',
    position: [0, 1.2, 0],
    color: '#4f46e5'
  },
  {
    id: 'Kerala',
    name: 'State of Kerala',
    position: [-2.2, -0.8, 1.2],
    color: '#2563eb'
  },
  {
    id: 'Andaman & Nicobar Islands',
    name: 'Andaman & Nicobar Islands',
    position: [2.2, -0.8, 1.2],
    color: '#10b981'
  },
  {
    id: 'lakshadweep',
    name: 'Union Territory of Lakshadweep',
    position: [-1.0, -0.8, -2.0],
    color: '#6366f1'
  }
];

const ConnectionLine = ({ start, end, color = "#c7d2fe" }: { start: [number, number, number], end: [number, number, number], color?: string }) => {
  const points = React.useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
  const lineGeometry = React.useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <lineSegments geometry={lineGeometry}>
      <lineBasicMaterial color={color} transparent opacity={0.3} linewidth={1.5} />
    </lineSegments>
  );
};

const DataPacket = ({ start, end, color = "#4f46e5", speed = 0.5, delay = 0 }: { start: [number, number, number], end: [number, number, number], color?: string, speed?: number, delay?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const startVec = React.useMemo(() => new THREE.Vector3(...start), [start]);
  const endVec = React.useMemo(() => new THREE.Vector3(...end), [end]);

  useFrame((state) => {
    if (meshRef.current) {
      const t = ((state.clock.getElapsedTime() * speed) + delay) % 1.0;
      meshRef.current.position.copy(startVec).lerp(endVec, t);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
};

const NodeMesh = ({ node, onHover, onClick }: { 
  node: RegionNode, 
  onHover: (node: RegionNode | null) => void, 
  onClick: (node: RegionNode) => void 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 3 + node.position[0]) * 0.08;
      meshRef.current.scale.setScalar(hovered ? 1.4 * pulse : 1.0 * pulse);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={node.position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(node);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(node);
      }}
    >
      <sphereGeometry args={[node.id === 'india' ? 0.16 : 0.12, 32, 32]} />
      <meshBasicMaterial color={node.color} toneMapped={false} />
      <mesh scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[node.id === 'india' ? 0.16 : 0.12, 16, 16]} />
        <meshBasicMaterial color={node.color} transparent opacity={0.15} depthWrite={false} />
      </mesh>
    </mesh>
  );
};

const MeshScene = ({ onHover, onClick }: {
  onHover: (node: RegionNode | null) => void;
  onClick: (node: RegionNode) => void;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const GLOBE_RADIUS = 3.2;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 24, 24]} />
        <meshBasicMaterial color="#cbd5e1" wireframe transparent opacity={0.15} depthWrite={false} />
      </mesh>
      <gridHelper args={[10, 10, '#e2e8f0', '#cbd5e1']} position={[0, -1.8, 0]} />

      {REGION_NODES.filter(n => n.id !== 'india').map(node => (
        <React.Fragment key={`connections-${node.id}`}>
          <ConnectionLine start={REGION_NODES[0].position} end={node.position} color="#c7d2fe" />
          <DataPacket start={REGION_NODES[0].position} end={node.position} color="#818cf8" speed={0.4} delay={0} />
          <DataPacket start={node.position} end={REGION_NODES[0].position} color="#4f46e5" speed={0.4} delay={0.25} />
        </React.Fragment>
      ))}

      {REGION_NODES.map(node => (
        <NodeMesh key={node.id} node={node} onHover={onHover} onClick={onClick} />
      ))}
    </group>
  );
};

export const ThreeHeroCanvas: React.FC = () => {
  const { loadRegion, setViewMode } = useGovernanceStore();
  const [, setHoveredNode] = useState<RegionNode | null>(null);

  const handleNodeClick = async (node: RegionNode) => {
    await loadRegion(node.id);
    setViewMode('dashboard');
  };

  return (
    <div className="w-full h-full relative overflow-hidden flex justify-center items-center">
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 60 } as any}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <MeshScene 
          onHover={setHoveredNode} 
          onClick={handleNodeClick} 
        />
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          minDistance={2.5}
          maxDistance={8}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
};

export default ThreeHeroCanvas;
