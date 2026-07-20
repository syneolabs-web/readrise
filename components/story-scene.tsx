'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, ContactShadows, PerspectiveCamera, Stars, Sparkles } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useScroll } from 'framer-motion';
import { useTheme } from '@/components/theme-provider';
import { StylizedCharacter, CharacterPose, CharacterColors } from './character-model';

const damp = THREE.MathUtils.damp;

function SceneContents() {
  const { scrollYProgress } = useScroll();
  const [progress, setProgress] = useState(0);
  const { vibe, theme } = useTheme();

  useEffect(() => {
    return scrollYProgress.on('change', (v) => {
      setProgress(v);
    });
  }, [scrollYProgress]);

  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  // States for characters
  const [boyPose, setBoyPose] = useState<CharacterPose>({
    spineX: 0.5, neckX: 0.4, 
    rightShoulderX: -0.4, rightShoulderZ: 0.2, rightElbowX: -1.2, 
    leftShoulderX: -0.4, leftShoulderZ: -0.2, leftElbowX: -1.2, 
    posY: 0
  });
  const [boyItem, setBoyItem] = useState<'phone' | 'book' | 'none'>('phone');
  
  const [girlsOpacity, setGirlsOpacity] = useState(0);

  const sittingPose: CharacterPose = {
    spineX: 0.1, neckX: 0.2, 
    leftShoulderX: -0.2, rightShoulderX: -0.2, 
    leftShoulderZ: -0.15, rightShoulderZ: 0.15, 
    leftElbowX: -0.8, rightElbowX: -0.8, 
    leftHipX: -1.5, rightHipX: -1.5, 
    leftKneeX: 1.5, rightKneeX: 1.5, 
    posY: -0.3
  };

  const girl1Pose: CharacterPose = {
    ...sittingPose,
    spineZ: -0.15, neckY: -0.4, neckZ: -0.1
  };

  const girl2Pose: CharacterPose = {
    ...sittingPose,
    spineZ: 0.15, neckY: 0.4, neckZ: 0.1
  };

  useFrame((state, delta) => {
    if (!cameraRef.current) return;

    const p = progress;

    let camZ = 5;
    let camY = 2;
    let camX = 0;
    let groupX = 1.8;
    let gOp = 0;

    let newBoyPose: CharacterPose = { ...boyPose };
    let newBoyItem: 'phone' | 'book' = 'phone';

    if (p < 0.15) {
      newBoyPose = {
        spineX: 0.5, neckX: 0.4, 
        rightShoulderX: -0.4, rightShoulderZ: 0.2, rightElbowX: -1.2, 
        leftShoulderX: -0.4, leftShoulderZ: -0.2, leftElbowX: -1.2, 
        posY: 0
      };
      newBoyItem = 'phone';
      camZ = 4.5; camY = 1.5; groupX = 1.8;
    } else if (p < 0.35) {
      const t = (p - 0.15) / 0.2;
      newBoyPose = {
        spineX: 0.5 * (1 - t) + 0.1 * t, 
        neckX: 0.4 * (1 - t) + 0.2 * t, 
        rightShoulderX: -0.4 * (1 - t) - 0.2 * t, 
        leftShoulderX: -0.4 * (1 - t) - 0.2 * t, 
        rightShoulderZ: 0.2 * (1 - t) + 0.15 * t, 
        leftShoulderZ: -0.2 * (1 - t) - 0.15 * t, 
        rightElbowX: -1.2 * (1 - t) + -0.8 * t, 
        leftElbowX: -1.2 * (1 - t) + -0.8 * t, 
        posY: 0
      };
      newBoyItem = t < 0.5 ? 'phone' : 'book';
      camZ = 4.5 + t * 0.5; camY = 1.5 + t * 0.5; groupX = 1.8;
    } else if (p < 0.55) {
      const t = (p - 0.35) / 0.2;
      newBoyPose = {
        spineX: 0.1, neckX: 0.2, 
        leftShoulderX: -0.2, rightShoulderX: -0.2, 
        leftShoulderZ: -0.15, rightShoulderZ: 0.15, 
        leftElbowX: -0.8, rightElbowX: -0.8, 
        leftHipX: -1.5 * t, rightHipX: -1.5 * t, 
        leftKneeX: 1.5 * t, rightKneeX: 1.5 * t, 
        posY: -0.3 * t
      };
      newBoyItem = 'book';
      camZ = 5 + t * 0.5; camY = 2; groupX = 1.8 - t * 1.8;
    } else if (p < 0.75) {
      const t = (p - 0.55) / 0.2;
      newBoyPose = sittingPose;
      newBoyItem = 'book';
      gOp = t;
      camZ = 5.5 + t * 1; camY = 2 + t * 0.5; groupX = 0;
    } else {
      const t = (p - 0.75) / 0.25;
      newBoyPose = sittingPose;
      newBoyItem = 'book';
      gOp = 1;
      camZ = 6.5 + t * 1.5; camY = 2.5 + t * 0.5; groupX = 0;
    }

    setBoyPose(newBoyPose);
    setBoyItem(newBoyItem);
    setGirlsOpacity(gOp);


    cameraRef.current.position.x = damp(cameraRef.current.position.x, camX, 4, delta);
    cameraRef.current.position.y = damp(cameraRef.current.position.y, camY, 4, delta);
    cameraRef.current.position.z = damp(cameraRef.current.position.z, camZ, 4, delta);
    cameraRef.current.lookAt(0, 1, 0);

    if (groupRef.current) {
      groupRef.current.position.x = damp(groupRef.current.position.x, groupX, 4, delta);
    }
  });

  const vibeColors: Record<string, string> = {
    ember: '#d97706', tide: '#2563eb', bloom: '#c026d3', meadow: '#16a34a'
  };
  const mainColor = vibeColors[vibe] || '#2563eb';
  const ambientLightIntensity = theme === 'dark' ? 0.4 : 0.9;

  const boyColors: CharacterColors = {
    skin: '#ffcda2', hair: '#1e293b', top: mainColor, bottom: '#334155', shoes: '#f1f5f9'
  };
  const girl1Colors: CharacterColors = {
    skin: '#fcd34d', hair: '#b7791f', top: '#ed64a6', bottom: '#4a5568', shoes: '#f1f5f9'
  };
  const girl2Colors: CharacterColors = {
    skin: '#e2e8f0', hair: '#e53e3e', top: '#48bb78', bottom: '#2d3748', shoes: '#f1f5f9'
  };

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 2, 5]} fov={50} />
      <ambientLight intensity={ambientLightIntensity} />
      <directionalLight position={[5, 10, -5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
      
      {theme === 'dark' && <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />}
      
      <Sparkles count={80} scale={5} size={2.5} speed={0.4} opacity={progress > 0.35 ? 0.6 : 0} color={mainColor} position={[0, 1, 0]} />

      <Float speed={2} rotationIntensity={0.05} floatIntensity={0.1}>
        <group ref={groupRef} position={[1.5, -0.5, 0]}>
          <StylizedCharacter colors={boyColors} targetPose={boyPose} hairStyle="boy" item={boyItem} />
          
          <group visible={girlsOpacity > 0.01}>
            <group position={[-1.2, 0, 0.2]} rotation={[0, 0.5, 0]}>
              <StylizedCharacter colors={girl1Colors} targetPose={girl1Pose} hairStyle="girl1" item="none" opacity={girlsOpacity} />
            </group>
            <group position={[1.2, 0, 0.2]} rotation={[0, -0.5, 0]}>
              <StylizedCharacter colors={girl2Colors} targetPose={girl2Pose} hairStyle="girl2" item="none" opacity={girlsOpacity} />
            </group>
          </group>
        </group>
      </Float>

      <ContactShadows position={[0, -1.1, 0]} opacity={0.7} scale={20} blur={2.5} far={4} color="#000" />
    </>
  );
}

export function StoryScene3D() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[0]">
      <Canvas shadows>
        <SceneContents />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

