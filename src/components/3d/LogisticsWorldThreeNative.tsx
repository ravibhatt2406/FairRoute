'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';
import { Community, Vehicle } from '@/types/logistics';

export default function LogisticsWorldThreeNative({
  onHoverCommunity,
  onHoverVehicle,
}: {
  onHoverCommunity: (c: Community | null) => void;
  onHoverVehicle: (v: Vehicle | null) => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const { communities, vehicles, simulationStatus } = useLogisticsStore();

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = null;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 13, 15);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 24;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(12, 18, 12);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 2, 20);
    pointLight.position.set(0, 6, 0);
    scene.add(pointLight);

    // 6. Ground Grid & Base
    const gridHelper = new THREE.GridHelper(24, 24, 0xcbd5e1, 0xe2e8f0);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    const groundGeo = new THREE.PlaneGeometry(24, 24);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // 7. Central Warehouse Depot
    const depotGroup = new THREE.Group();

    const depotBaseGeo = new THREE.BoxGeometry(2.8, 0.4, 2.4);
    const depotBaseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const depotBase = new THREE.Mesh(depotBaseGeo, depotBaseMat);
    depotBase.position.y = 0.2;
    depotGroup.add(depotBase);

    const depotMainGeo = new THREE.BoxGeometry(2.5, 1.2, 2.0);
    const depotMainMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.2 });
    const depotMain = new THREE.Mesh(depotMainGeo, depotMainMat);
    depotMain.position.y = 1.0;
    depotGroup.add(depotMain);

    const roofGeo = new THREE.BoxGeometry(2.6, 0.1, 2.1);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.6 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 1.65;
    depotGroup.add(roof);

    const ringGeo = new THREE.RingGeometry(0.5, 0.7, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 1.75;
    depotGroup.add(ring);

    scene.add(depotGroup);

    // 8. Communities Nodes
    const communityMeshes: { mesh: THREE.Mesh; data: Community }[] = [];
    const communityBeacons: THREE.Mesh[] = [];

    communities.forEach((c) => {
      const cx = c.coordinates.x || 0;
      const cz = c.coordinates.z || 0;
      const isCritical = c.priorityTier === 'CRITICAL';
      const hexColor = isCritical ? 0xef4444 : c.urgencyScore >= 7 ? 0xf59e0b : 0x10b981;

      const padGeo = new THREE.CircleGeometry(0.7, 24);
      const padMat = new THREE.MeshBasicMaterial({ color: hexColor, transparent: true, opacity: 0.3 });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(cx, 0.02, cz);
      scene.add(pad);

      const bldgGeo = new THREE.CylinderGeometry(0.4, 0.55, 0.7, 6);
      const bldgMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
      const bldg = new THREE.Mesh(bldgGeo, bldgMat);
      bldg.position.set(cx, 0.4, cz);
      scene.add(bldg);

      const beaconGeo = new THREE.SphereGeometry(0.22, 16, 16);
      const beaconMat = new THREE.MeshStandardMaterial({ color: hexColor, emissive: hexColor, emissiveIntensity: 0.8 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(cx, 0.85, cz);
      scene.add(beacon);

      communityMeshes.push({ mesh: beacon, data: c });
      communityBeacons.push(beacon);

      const start = new THREE.Vector3(0, 0.04, 0);
      const end = new THREE.Vector3(cx, 0.04, cz);
      const curve = new THREE.LineCurve3(start, end);
      const tubeGeo = new THREE.TubeGeometry(curve, 1, 0.03, 6, false);
      const tubeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5, transparent: true, opacity: 0.4 });
      const road = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(road);
    });

    // 8B. Render 3D Route Intelligence Tubes & Barriers for Selected Vehicle
    const storeState = useLogisticsStore.getState();
    const selVehId = storeState.selectedVehicleId || 'veh-01';
    const activeIntel = storeState.routeIntelligenceMap[selVehId];

    if (activeIntel && activeIntel.candidateRoutes) {
      activeIntel.candidateRoutes.forEach((cRoute) => {
        if (!cRoute.coordinates || cRoute.coordinates.length < 2) return;

        // Map lat/lng to 3D plane offsets relative to depot center
        const depotLat = storeState.depot.coordinates.lat;
        const depotLng = storeState.depot.coordinates.lng;

        const points = cRoute.coordinates.map((coord) => {
          const x = (coord.lng - depotLng) * 120; // Scale factor for 3D grid
          const z = (depotLat - coord.lat) * 120;
          return new THREE.Vector3(x, 0.08, z);
        });

        if (points.length >= 2) {
          const pathCurve = new THREE.CatmullRomCurve3(points);
          let tubeColor = 0xf59e0b; // Yellow for Alternative
          let tubeRadius = 0.05;
          let opacity = 0.8;

          if (cRoute.isSelected) {
            tubeColor = 0x10b981; // Bright Green for Selected
            tubeRadius = 0.09;
            opacity = 0.95;
          } else if (cRoute.isBlocked) {
            tubeColor = 0xef4444; // Bright Red for Blocked
            tubeRadius = 0.06;
            opacity = 0.9;
          }

          const tubeGeo = new THREE.TubeGeometry(pathCurve, 32, tubeRadius, 8, false);
          const tubeMat = new THREE.MeshStandardMaterial({
            color: tubeColor,
            emissive: tubeColor,
            emissiveIntensity: cRoute.isSelected ? 0.6 : 0.2,
            roughness: 0.3,
            transparent: true,
            opacity,
          });
          const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
          scene.add(tubeMesh);

          // Add 3D Road Barrier for Blocked Route
          if (cRoute.isBlocked && points.length >= 2) {
            const midPoint = points[Math.floor(points.length / 2)];
            const barrierGeo = new THREE.BoxGeometry(0.6, 0.4, 0.15);
            const barrierMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xd97706, emissiveIntensity: 0.5 });
            const barrierMesh = new THREE.Mesh(barrierGeo, barrierMat);
            barrierMesh.position.set(midPoint.x, 0.2, midPoint.z);
            scene.add(barrierMesh);
          }
        }
      });
    }

    // 9. Animated Trucks
    const truckItems: { group: THREE.Group; vehicle: Vehicle; targetX: number; targetZ: number; color: number }[] = [];
    const colors = [0x0284c7, 0x4f46e5, 0x10b981, 0xf59e0b, 0xec4899, 0x8b5cf6];

    vehicles.forEach((v, idx) => {
      const targetComm = communities[idx % communities.length];
      const tx = targetComm.coordinates.x || 0;
      const tz = targetComm.coordinates.z || 0;

      const truckGroup = new THREE.Group();

      const bodyGeo = new THREE.BoxGeometry(0.38, 0.28, 0.65);
      const bodyMat = new THREE.MeshStandardMaterial({ color: colors[idx % colors.length], roughness: 0.3, metalness: 0.4 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.15;
      truckGroup.add(body);

      const cabGeo = new THREE.BoxGeometry(0.34, 0.22, 0.28);
      const cabMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
      const cab = new THREE.Mesh(cabGeo, cabMat);
      cab.position.set(0, 0.22, 0.26);
      truckGroup.add(cab);

      scene.add(truckGroup);
      truckItems.push({ group: truckGroup, vehicle: v, targetX: tx, targetZ: tz, color: colors[idx % colors.length] });
    });

    // 10. Raycaster for Hover Inspect
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const commIntersects = raycaster.intersectObjects(communityBeacons);
      if (commIntersects.length > 0) {
        const hitBeacon = commIntersects[0].object;
        const found = communityMeshes.find((item) => item.mesh === hitBeacon);
        if (found) {
          onHoverCommunity(found.data);
          onHoverVehicle(null);
          return;
        }
      }

      let hitVehicle: Vehicle | null = null;
      for (const item of truckItems) {
        const truckIntersects = raycaster.intersectObjects(item.group.children);
        if (truckIntersects.length > 0) {
          hitVehicle = item.vehicle;
          break;
        }
      }

      if (hitVehicle) {
        onHoverVehicle(hitVehicle);
        onHoverCommunity(null);
      } else {
        onHoverCommunity(null);
        onHoverVehicle(null);
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousemove', handleMouseMove);

    // 11. Animation Loop with Simulation State Aware movement
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      roofMat.emissiveIntensity = 0.5 + Math.sin(elapsedTime * 3) * 0.3;

      communityBeacons.forEach((b, i) => {
        b.position.y = 0.85 + Math.sin(elapsedTime * 4 + i) * 0.12;
      });

      // Animate truck position according to current simulationStatus
      truckItems.forEach((t, i) => {
        let progress = 0;

        if (simulationStatus === 'WAITING' || simulationStatus === 'LOADING') {
          progress = 0.05 * (i + 1); // Stationary at depot
        } else if (simulationStatus === 'COMPLETED' || simulationStatus === 'DELIVERING') {
          progress = 0.95; // Arrived at destination community
        } else {
          // EN_ROUTE or ARRIVING: Moving continuously along path
          const speedFactor = (t.vehicle.speedKmh / 60) * 0.15;
          progress = (elapsedTime * speedFactor + i * 0.25) % 1;
        }

        const startX = 0;
        const startZ = 0;

        const curX = THREE.MathUtils.lerp(startX, t.targetX, progress);
        const curZ = THREE.MathUtils.lerp(startZ, t.targetZ, progress);

        t.group.position.set(curX, 0.2, curZ);
        t.group.lookAt(t.targetX, 0.2, t.targetZ);
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [communities, vehicles, simulationStatus, onHoverCommunity, onHoverVehicle]);

  return <div ref={mountRef} className="w-full h-full min-h-[520px]" />;
}
