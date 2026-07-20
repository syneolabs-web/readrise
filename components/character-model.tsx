'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

const damp = THREE.MathUtils.damp;

export interface CharacterColors {
  skin: string;
  hair: string;
  top: string;
  bottom: string;
  shoes: string;
}

export interface CharacterPose {
  spineX?: number; spineY?: number; spineZ?: number;
  neckX?: number; neckY?: number; neckZ?: number;
  leftShoulderX?: number; leftShoulderY?: number; leftShoulderZ?: number;
  rightShoulderX?: number; rightShoulderY?: number; rightShoulderZ?: number;
  leftElbowX?: number; rightElbowX?: number;
  leftHipX?: number; leftHipY?: number; leftHipZ?: number;
  rightHipX?: number; rightHipY?: number; rightHipZ?: number;
  leftKneeX?: number; rightKneeX?: number;
  posY?: number;
}

const defaultPose = {
  spineX: 0, spineY: 0, spineZ: 0,
  neckX: 0, neckY: 0, neckZ: 0,
  leftShoulderX: 0, leftShoulderY: 0, leftShoulderZ: 0,
  rightShoulderX: 0, rightShoulderY: 0, rightShoulderZ: 0,
  leftElbowX: 0, rightElbowX: 0,
  leftHipX: 0, leftHipY: 0, leftHipZ: 0,
  rightHipX: 0, rightHipY: 0, rightHipZ: 0,
  leftKneeX: 0, rightKneeX: 0,
  posY: 0,
};

interface StylizedCharacterProps {
  colors: CharacterColors;
  targetPose: CharacterPose;
  hairStyle: 'boy' | 'girl1' | 'girl2';
  item: 'phone' | 'book' | 'none';
  opacity?: number;
}

export function StylizedCharacter({ colors, targetPose, hairStyle, item, opacity = 1 }: StylizedCharacterProps) {
  const root = useRef<THREE.Group>(null);
  const spine = useRef<THREE.Group>(null);
  const neck = useRef<THREE.Group>(null);
  const leftShoulder = useRef<THREE.Group>(null);
  const leftElbow = useRef<THREE.Group>(null);
  const rightShoulder = useRef<THREE.Group>(null);
  const rightElbow = useRef<THREE.Group>(null);
  const leftHip = useRef<THREE.Group>(null);
  const leftKnee = useRef<THREE.Group>(null);
  const rightHip = useRef<THREE.Group>(null);
  const rightKnee = useRef<THREE.Group>(null);

  const phoneMat = useRef<THREE.MeshStandardMaterial>(null);
  const phoneScreenMat = useRef<THREE.MeshBasicMaterial>(null);
  const bookCoverMat1 = useRef<THREE.MeshStandardMaterial>(null);
  const bookPagesMat1 = useRef<THREE.MeshStandardMaterial>(null);
  const bookCoverMat2 = useRef<THREE.MeshStandardMaterial>(null);
  const bookPagesMat2 = useRef<THREE.MeshStandardMaterial>(null);

  const materials = useMemo(() => {
    return {
      skin: new THREE.MeshStandardMaterial({ color: colors.skin, roughness: 0.4, transparent: true }),
      hair: new THREE.MeshStandardMaterial({ color: colors.hair, roughness: 0.8, transparent: true }),
      top: new THREE.MeshStandardMaterial({ color: colors.top, roughness: 0.7, transparent: true }),
      bottom: new THREE.MeshStandardMaterial({ color: colors.bottom, roughness: 0.7, transparent: true }),
      shoes: new THREE.MeshStandardMaterial({ color: colors.shoes, roughness: 0.6, transparent: true }),
      eye: new THREE.MeshBasicMaterial({ color: '#0f172a', transparent: true }),
    };
  }, [colors]);

  const pose = { ...defaultPose, ...targetPose };

  useFrame((state, delta) => {
    if (!root.current) return;
    const speed = 4;

    // Fade opacities
    Object.values(materials).forEach(mat => {
      mat.opacity = damp(mat.opacity, opacity, speed, delta);
    });

    if (phoneMat.current) {
      const pOp = damp(phoneMat.current.opacity, item === 'phone' ? opacity : 0, speed, delta);
      phoneMat.current.opacity = pOp;
      phoneMat.current.transparent = true;
      if (phoneScreenMat.current) {
        phoneScreenMat.current.opacity = pOp;
        phoneScreenMat.current.transparent = true;
      }
    }
    if (bookCoverMat1.current) {
      const bOp = damp(bookCoverMat1.current.opacity, item === 'book' ? opacity : 0, speed, delta);
      [bookCoverMat1, bookCoverMat2, bookPagesMat1, bookPagesMat2].forEach(ref => {
        if (ref.current) {
          ref.current.opacity = bOp;
          ref.current.transparent = true;
        }
      });
    }

    root.current.visible = materials.skin.opacity > 0.01;
    if (!root.current.visible) return;

    // Apply poses
    root.current.position.y = damp(root.current.position.y, pose.posY, speed, delta);
    
    if (spine.current) {
      spine.current.rotation.x = damp(spine.current.rotation.x, pose.spineX, speed, delta);
      spine.current.rotation.y = damp(spine.current.rotation.y, pose.spineY, speed, delta);
      spine.current.rotation.z = damp(spine.current.rotation.z, pose.spineZ, speed, delta);
    }
    if (neck.current) {
      neck.current.rotation.x = damp(neck.current.rotation.x, pose.neckX, speed, delta);
      neck.current.rotation.y = damp(neck.current.rotation.y, pose.neckY, speed, delta);
      neck.current.rotation.z = damp(neck.current.rotation.z, pose.neckZ, speed, delta);
    }
    
    if (leftShoulder.current) {
      leftShoulder.current.rotation.x = damp(leftShoulder.current.rotation.x, pose.leftShoulderX, speed, delta);
      leftShoulder.current.rotation.y = damp(leftShoulder.current.rotation.y, pose.leftShoulderY, speed, delta);
      leftShoulder.current.rotation.z = damp(leftShoulder.current.rotation.z, pose.leftShoulderZ, speed, delta);
    }
    if (rightShoulder.current) {
      rightShoulder.current.rotation.x = damp(rightShoulder.current.rotation.x, pose.rightShoulderX, speed, delta);
      rightShoulder.current.rotation.y = damp(rightShoulder.current.rotation.y, pose.rightShoulderY, speed, delta);
      rightShoulder.current.rotation.z = damp(rightShoulder.current.rotation.z, pose.rightShoulderZ, speed, delta);
    }
    
    if (leftElbow.current) leftElbow.current.rotation.x = damp(leftElbow.current.rotation.x, pose.leftElbowX, speed, delta);
    if (rightElbow.current) rightElbow.current.rotation.x = damp(rightElbow.current.rotation.x, pose.rightElbowX, speed, delta);
    
    if (leftHip.current) {
      leftHip.current.rotation.x = damp(leftHip.current.rotation.x, pose.leftHipX, speed, delta);
      leftHip.current.rotation.y = damp(leftHip.current.rotation.y, pose.leftHipY, speed, delta);
      leftHip.current.rotation.z = damp(leftHip.current.rotation.z, pose.leftHipZ, speed, delta);
    }
    if (rightHip.current) {
      rightHip.current.rotation.x = damp(rightHip.current.rotation.x, pose.rightHipX, speed, delta);
      rightHip.current.rotation.y = damp(rightHip.current.rotation.y, pose.rightHipY, speed, delta);
      rightHip.current.rotation.z = damp(rightHip.current.rotation.z, pose.rightHipZ, speed, delta);
    }
    
    if (leftKnee.current) leftKnee.current.rotation.x = damp(leftKnee.current.rotation.x, pose.leftKneeX, speed, delta);
    if (rightKnee.current) rightKnee.current.rotation.x = damp(rightKnee.current.rotation.x, pose.rightKneeX, speed, delta);
  });

  return (
    <group ref={root}>
      <group position={[0, 0.9, 0]}>
        
        {/* Pelvis / Lower Torso */}
        <mesh material={materials.bottom} position={[0, -0.05, 0]}>
          <capsuleGeometry args={[0.14, 0.1, 16, 16]} />
        </mesh>

        {/* Spine / Upper Torso */}
        <group ref={spine}>
          <mesh material={materials.top} position={[0, 0.15, 0]}>
            <capsuleGeometry args={[0.14, 0.2, 16, 16]} />
          </mesh>

          {/* Neck & Head */}
          <group ref={neck} position={[0, 0.38, 0]}>
            {/* Head */}
            <mesh material={materials.skin} position={[0, 0.22, 0]}>
              <sphereGeometry args={[0.22, 32, 32]} />
            </mesh>
            
            {/* Eyes */}
            <mesh material={materials.eye} position={[-0.08, 0.22, 0.2]}>
              <sphereGeometry args={[0.03, 16, 16]} />
            </mesh>
            <mesh material={materials.eye} position={[0.08, 0.22, 0.2]}>
              <sphereGeometry args={[0.03, 16, 16]} />
            </mesh>

            {/* Hair */}
            {hairStyle === 'boy' && (
              <mesh material={materials.hair} position={[0, 0.25, -0.02]}>
                <sphereGeometry args={[0.23, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
              </mesh>
            )}
            
            {hairStyle === 'girl1' && (
              <group>
                <mesh material={materials.hair} position={[0, 0.25, -0.02]}>
                  <sphereGeometry args={[0.23, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                </mesh>
                <mesh material={materials.hair} position={[0, 0.05, -0.15]}>
                  <capsuleGeometry args={[0.14, 0.35, 16, 16]} />
                </mesh>
              </group>
            )}

            {hairStyle === 'girl2' && (
              <group>
                <mesh material={materials.hair} position={[0, 0.25, -0.02]}>
                  <sphereGeometry args={[0.23, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                </mesh>
                <mesh material={materials.hair} position={[-0.22, 0.25, -0.05]}>
                  <sphereGeometry args={[0.09, 16, 16]} />
                </mesh>
                <mesh material={materials.hair} position={[0.22, 0.25, -0.05]}>
                  <sphereGeometry args={[0.09, 16, 16]} />
                </mesh>
              </group>
            )}
          </group>

          {/* Left Arm */}
          <group ref={leftShoulder} position={[-0.2, 0.28, 0]}>
            <mesh material={materials.top} position={[0, -0.12, 0]}>
              <capsuleGeometry args={[0.06, 0.12, 16, 16]} />
            </mesh>
            <group ref={leftElbow} position={[0, -0.24, 0]}>
              <mesh material={materials.skin} position={[0, -0.12, 0]}>
                <capsuleGeometry args={[0.055, 0.12, 16, 16]} />
              </mesh>
            </group>
          </group>

          {/* Right Arm */}
          <group ref={rightShoulder} position={[0.2, 0.28, 0]}>
            <mesh material={materials.top} position={[0, -0.12, 0]}>
              <capsuleGeometry args={[0.06, 0.12, 16, 16]} />
            </mesh>
            <group ref={rightElbow} position={[0, -0.24, 0]}>
              <mesh material={materials.skin} position={[0, -0.12, 0]}>
                <capsuleGeometry args={[0.055, 0.12, 16, 16]} />
              </mesh>

              {/* Props */}
              <group position={[-0.1, -0.25, 0.05]}>
                <mesh rotation={[-0.5, 0.2, 0.2]} position={[0, 0, 0]}>
                  <boxGeometry args={[0.1, 0.2, 0.02]} />
                  <meshStandardMaterial ref={phoneMat} color="#111" />
                  <mesh position={[0, 0, 0.011]}>
                    <planeGeometry args={[0.09, 0.19]} />
                    <meshBasicMaterial ref={phoneScreenMat} color="#93c5fd" transparent />
                  </mesh>
                </mesh>
              </group>
              <group position={[-0.18, -0.15, 0.05]}>
                <group rotation={[-0.5, 0, 0]}>
                  {/* Left Side */}
                  <group position={[-0.125, 0, 0]} rotation={[0, -0.15, 0]}>
                    <mesh position={[0, 0, -0.015]}>
                      <boxGeometry args={[0.25, 0.35, 0.01]} />
                      <meshStandardMaterial ref={bookCoverMat1} color="#0f766e" />
                    </mesh>
                    <mesh position={[0.01, 0, 0]}>
                      <boxGeometry args={[0.23, 0.33, 0.02]} />
                      <meshStandardMaterial ref={bookPagesMat1} color="#fefce8" />
                    </mesh>
                  </group>
                  {/* Right Side */}
                  <group position={[0.125, 0, 0]} rotation={[0, 0.15, 0]}>
                    <mesh position={[0, 0, -0.015]}>
                      <boxGeometry args={[0.25, 0.35, 0.01]} />
                      <meshStandardMaterial ref={bookCoverMat2} color="#0f766e" />
                    </mesh>
                    <mesh position={[-0.01, 0, 0]}>
                      <boxGeometry args={[0.23, 0.33, 0.02]} />
                      <meshStandardMaterial ref={bookPagesMat2} color="#fefce8" />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>

        {/* Legs */}
        <group ref={leftHip} position={[-0.1, -0.15, 0]}>
          <mesh material={materials.bottom} position={[0, -0.16, 0]}>
            <capsuleGeometry args={[0.07, 0.18, 16, 16]} />
          </mesh>
          <group ref={leftKnee} position={[0, -0.32, 0]}>
            <mesh material={materials.skin} position={[0, -0.18, 0]}>
              <capsuleGeometry args={[0.06, 0.2, 16, 16]} />
            </mesh>
            <mesh material={materials.shoes} position={[0, -0.35, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <capsuleGeometry args={[0.07, 0.12, 16, 16]} />
            </mesh>
          </group>
        </group>

        <group ref={rightHip} position={[0.1, -0.15, 0]}>
          <mesh material={materials.bottom} position={[0, -0.16, 0]}>
            <capsuleGeometry args={[0.07, 0.18, 16, 16]} />
          </mesh>
          <group ref={rightKnee} position={[0, -0.32, 0]}>
            <mesh material={materials.skin} position={[0, -0.18, 0]}>
              <capsuleGeometry args={[0.06, 0.2, 16, 16]} />
            </mesh>
            <mesh material={materials.shoes} position={[0, -0.35, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <capsuleGeometry args={[0.07, 0.12, 16, 16]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

