'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function WebGLBreakAnimation() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0055ff);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create animated particles/stars
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 30;
      posArray[i + 1] = (Math.random() - 0.5) * 30;
      posArray[i + 2] = (Math.random() - 0.5) * 30;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.12,
      color: 0xccff00,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Create floating geometric shapes
    const geometries = [
      new THREE.TetrahedronGeometry(0.8),
      new THREE.OctahedronGeometry(0.8),
      new THREE.IcosahedronGeometry(0.8),
    ];

    const shapeColors = [0xccff00, 0x0055ff, 0xff00ff, 0xffa500];
    const shapes = [];
    const shapeCount = 6;

    for (let i = 0; i < shapeCount; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const color = shapeColors[Math.floor(Math.random() * shapeColors.length)];
      const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        wireframe: true,
      });

      const shape = new THREE.Mesh(geometry, material);
      shape.position.x = (Math.random() - 0.5) * 16;
      shape.position.y = (Math.random() - 0.5) * 16;
      shape.position.z = (Math.random() - 0.5) * 12;
      shape.rotation.x = Math.random() * Math.PI;
      shape.rotation.y = Math.random() * Math.PI;

      shape.userData = {
        speedX: (Math.random() - 0.5) * 0.012,
        speedY: (Math.random() - 0.5) * 0.012,
        speedZ: (Math.random() - 0.5) * 0.012,
        rotationSpeed: Math.random() * 0.012,
      };

      scene.add(shape);
      shapes.push(shape);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xccff00, 1.0);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0055ff, 0.8);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xff00ff, 0.6);
    pointLight3.position.set(0, 15, -5);
    scene.add(pointLight3);

    // Animation loop
    let animationFrameId;
    let time = 0;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.01;

      // Rotate and move particles
      particles.rotation.x += 0.0003;
      particles.rotation.y += 0.0005;

      // Animate shapes with more dynamic movement
      shapes.forEach((shape) => {
        shape.position.x += shape.userData.speedX;
        shape.position.y += shape.userData.speedY;
        shape.position.z += shape.userData.speedZ;

        shape.rotation.x += shape.userData.rotationSpeed * 0.5;
        shape.rotation.y += shape.userData.rotationSpeed * 0.7;
        shape.rotation.z += shape.userData.rotationSpeed * 0.3;

        // Bounce back when out of bounds with increased range
        if (Math.abs(shape.position.x) > 12) shape.userData.speedX *= -1;
        if (Math.abs(shape.position.y) > 12) shape.userData.speedY *= -1;
        if (Math.abs(shape.position.z) > 10) shape.userData.speedZ *= -1;
      });

      // Subtle camera orbit
      camera.position.x = Math.sin(time * 0.3) * 0.5;
      camera.position.y = Math.cos(time * 0.25) * 0.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometries.forEach(g => g.dispose());
      particlesMaterial.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    />
  );
}
