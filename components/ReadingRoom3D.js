"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { BookOpen, Camera, Sparkles, X, Eye, Maximize2, Minimize2, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const hasBengali = (text) => /[\u0980-\u09FF]/.test(text || "");

// FNV-1a hash
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed) {
  const t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  return ((t ^ (t >>> 7)) >>> 0) / 4294967296;
}

const SPINE_COLORS = {
  "from-neutral-800 to-neutral-900": 0x3d3d44, // Slate
  "from-slate-900 to-blue-950":      0x22427a, // Navy
  "from-slate-900 to-emerald-950":   0x1f5c49, // Forest
  "from-slate-900 to-rose-950":      0x7a283c, // Wine
  "from-neutral-900 to-neutral-950": 0x2f2f35, // Charcoal
  "from-slate-900 to-purple-950":    0x57307e, // Aubergine
};

// Generates a 2D canvas texture for the book spine with Bengali/English text
function createSpineTexture(title, author, isBn, baseHex) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Base background
  ctx.fillStyle = `#${baseHex.toString(16).padStart(6, "0")}`;
  ctx.fillRect(0, 0, 128, 512);

  // Subtle cloth texture noise
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  for (let i = 0; i < 512; i += 4) {
    ctx.fillRect(0, i, 128, 1);
  }

  // Top & Bottom Gold Foil Bands
  ctx.fillStyle = "#c89b3c";
  ctx.fillRect(16, 24, 96, 4);
  ctx.fillRect(16, 32, 96, 2);
  ctx.fillRect(16, 480, 96, 4);
  ctx.fillRect(16, 472, 96, 2);

  // Vertical Spine Title
  ctx.save();
  ctx.translate(64, 260);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#f3eedf";
  ctx.font = isBn
    ? "bold 20px 'Noto Serif Bengali', 'Hind Siliguri', serif"
    : "600 18px 'Outfit', sans-serif";
  
  // Truncate if long
  let displayTitle = title;
  if (displayTitle.length > 28) {
    displayTitle = displayTitle.slice(0, 26) + "…";
  }
  ctx.fillText(displayTitle, 0, 0);

  // Author near bottom
  ctx.font = isBn
    ? "14px 'Hind Siliguri', sans-serif"
    : "13px 'Outfit', sans-serif";
  ctx.fillStyle = "#c89b3c";
  let displayAuthor = author;
  if (displayAuthor.length > 18) {
    displayAuthor = displayAuthor.slice(0, 16) + "…";
  }
  ctx.fillText(displayAuthor, -130, 0);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function ReadingRoom3D({ books = [], onSelectBook, onClose }) {
  const mountRef = useRef(null);
  const { theme } = useTheme();
  const [activeStation, setActiveStation] = useState("stacks"); // "overview" | "stacks" | "desk"
  const [hoveredBook, setHoveredBook] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Camera station targets
  const STATIONS = {
    overview: {
      position: new THREE.Vector3(0, 2.4, 6.2),
      target: new THREE.Vector3(0, 1.4, 0),
      label: "Room Overview",
    },
    stacks: {
      position: new THREE.Vector3(0, 1.8, 3.2),
      target: new THREE.Vector3(0, 1.7, 0),
      label: "The Stacks",
    },
    desk: {
      position: new THREE.Vector3(-1.2, 1.35, 1.8),
      target: new THREE.Vector3(-0.9, 0.95, 0.6),
      label: "Reading Desk",
    },
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === "dark" ? 0x0c0e14 : 0x1a1c23);
    scene.fog = new THREE.FogExp2(theme === "dark" ? 0x0c0e14 : 0x1e2029, 0.07);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.copy(STATIONS.stacks.position);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = theme === "dark" ? 1.05 : 1.25;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, theme === "dark" ? 0.35 : 0.6);
    scene.add(ambientLight);

    // Warm tungsten desk lamp light
    const lampLight = new THREE.PointLight(0xffb854, 2.4, 6, 1.2);
    lampLight.position.set(-1.0, 1.6, 0.6);
    lampLight.castShadow = true;
    lampLight.shadow.mapSize.width = 1024;
    lampLight.shadow.mapSize.height = 1024;
    scene.add(lampLight);

    // Lamp bulb visual
    const bulbGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe29a });
    const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
    bulbMesh.position.copy(lampLight.position);
    scene.add(bulbMesh);

    // Shelf accent spotlight
    const shelfSpot = new THREE.SpotLight(0xffedd5, 2.2, 8, Math.PI / 4, 0.3);
    shelfSpot.position.set(0, 3.8, 3.2);
    shelfSpot.target.position.set(0, 1.8, 0);
    scene.add(shelfSpot);
    scene.add(shelfSpot.target);

    // Cool window moonlight / daylight entering from side
    const windowLight = new THREE.DirectionalLight(
      theme === "dark" ? 0x8ba6d6 : 0xfff7ed,
      theme === "dark" ? 0.5 : 0.9
    );
    windowLight.position.set(4, 4, 3);
    scene.add(windowLight);

    // 3. Architecture: Walnut Floor, Rug, and Walls
    // Floor
    const floorGeo = new THREE.PlaneGeometry(12, 10);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x221710,
      roughness: 0.8,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Oxblood Rug
    const rugGeo = new THREE.PlaneGeometry(4.8, 3.4);
    const rugMat = new THREE.MeshStandardMaterial({
      color: 0x4a1822,
      roughness: 0.95,
      metalness: 0.05,
    });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.005, 1.8);
    rug.receiveShadow = true;
    scene.add(rug);

    // Back Library Wall
    const wallGeo = new THREE.PlaneGeometry(12, 6);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x16181f,
      roughness: 0.9,
    });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 3, -0.4);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // 4. Bookshelf Unit (Walnut wood)
    const shelfMat = new THREE.MeshStandardMaterial({
      color: 0x3d2719,
      roughness: 0.7,
      metalness: 0.1,
    });

    // 4 horizontal planks
    const shelfWidth = 6.2;
    const shelfHeights = [0.9, 1.45, 2.0, 2.55];
    shelfHeights.forEach((y) => {
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(shelfWidth, 0.05, 0.35),
        shelfMat
      );
      plank.position.set(0, y, 0);
      plank.receiveShadow = true;
      plank.castShadow = true;
      scene.add(plank);
    });

    // Vertical shelf dividers
    [-3.1, -1.05, 1.05, 3.1].forEach((x) => {
      const divider = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 2.0, 0.35),
        shelfMat
      );
      divider.position.set(x, 1.72, 0);
      divider.castShadow = true;
      scene.add(divider);
    });

    // 5. Reading Desk with Open Book
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x352115,
      roughness: 0.6,
      metalness: 0.1,
    });
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.9), deskMat);
    deskTop.position.set(-1.0, 0.75, 1.0);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    scene.add(deskTop);

    // Desk legs
    [[-1.7, 0.6], [-0.3, 0.6], [-1.7, 1.35], [-0.3, 1.35]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.75, 0.05), deskMat);
      leg.position.set(x, 0.375, z);
      scene.add(leg);
    });

    // Open Book on desk
    const openBookGeo = new THREE.BoxGeometry(0.38, 0.02, 0.28);
    const openBookMat = new THREE.MeshStandardMaterial({ color: 0xede6d4, roughness: 0.9 });
    const openBook = new THREE.Mesh(openBookGeo, openBookMat);
    openBook.position.set(-0.9, 0.79, 0.9);
    openBook.rotation.y = 0.2;
    openBook.castShadow = true;
    scene.add(openBook);

    // Bookmark ribbon on desk
    const ribbonGeo = new THREE.PlaneGeometry(0.025, 0.2);
    const ribbonMat = new THREE.MeshBasicMaterial({ color: 0xe11d48, side: THREE.DoubleSide });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.position.set(-0.85, 0.805, 0.9);
    ribbon.rotation.x = Math.PI / 2;
    ribbon.rotation.z = -0.2;
    scene.add(ribbon);

    // 6. Interactive 3D Books on Shelves
    const interactiveMeshes = [];
    const interactiveBooks = books.filter((b) => b.status !== "upcoming").slice(0, 54);

    // Distribute books across middle shelves (shelfHeights[1] = 1.45 and shelfHeights[2] = 2.0)
    let currentShelfIdx = 1;
    let currentX = -2.9;

    interactiveBooks.forEach((book, i) => {
      const seed = hashString(book.slug || book.id || book.title);
      const r1 = seededRandom(seed);
      const r2 = seededRandom(seed + 1);

      const bWidth = 0.045 + r1 * 0.025;   // 4.5cm - 7cm
      const bHeight = 0.26 + r2 * 0.08;    // 26cm - 34cm
      const bDepth = 0.21;                 // 21cm deep

      if (currentX + bWidth > 2.9) {
        currentShelfIdx = currentShelfIdx === 1 ? 2 : 1;
        currentX = -2.9;
      }

      const spineHex = SPINE_COLORS[book.coverGradient] || 0x2f2f35;
      const isBn = hasBengali(book.title);
      const spineTex = createSpineTexture(book.title, book.author, isBn, spineHex);

      // Materials: Front/Back, Top/Bottom, Spine (Front Z), Page Edge
      const pageEdgeMat = new THREE.MeshStandardMaterial({ color: 0xe8e2d2, roughness: 0.9 });
      const coverMat = new THREE.MeshStandardMaterial({ color: spineHex, roughness: 0.8 });
      const spineMat = new THREE.MeshStandardMaterial({
        map: spineTex,
        roughness: 0.75,
        metalness: 0.1,
      });

      const bookMaterials = [
        coverMat,    // Right
        coverMat,    // Left
        pageEdgeMat, // Top
        pageEdgeMat, // Bottom
        spineMat,    // Spine facing front (+Z)
        pageEdgeMat, // Page edge facing back (-Z)
      ];

      const bookGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
      const bookMesh = new THREE.Mesh(bookGeo, bookMaterials);

      const shelfBaseY = shelfHeights[currentShelfIdx] + 0.025;
      const bookY = shelfBaseY + bHeight / 2;
      const bookX = currentX + bWidth / 2;

      bookMesh.position.set(bookX, bookY, 0.04);
      bookMesh.castShadow = true;
      bookMesh.receiveShadow = true;

      // Store book data on mesh
      bookMesh.userData = {
        book,
        basePosition: bookMesh.position.clone(),
        baseRotation: bookMesh.rotation.clone(),
      };

      scene.add(bookMesh);
      interactiveMeshes.push(bookMesh);

      currentX += bWidth + 0.015;
    });

    // 7. Floating Dust Motes (Subtle particles)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let p = 0; p < particleCount * 3; p += 3) {
      particlePos[p] = (Math.random() - 0.5) * 6;
      particlePos[p + 1] = Math.random() * 3.5;
      particlePos[p + 2] = Math.random() * 4;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffe29a,
      size: 0.025,
      transparent: true,
      opacity: 0.55,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 8. Raycasting & Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let selectedMesh = null;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData?.book) {
          onSelectBook(hit.userData.book);
        }
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("click", handleClick);

    // 9. Animation Loop with Camera Interpolation
    let targetCameraPos = STATIONS.stacks.position.clone();
    let targetCameraTarget = STATIONS.stacks.target.clone();
    const currentCameraTarget = STATIONS.stacks.target.clone();

    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth camera transition to active station
      const targetStation = STATIONS[activeStation] || STATIONS.stacks;
      targetCameraPos = targetStation.position;
      targetCameraTarget = targetStation.target;

      camera.position.lerp(targetCameraPos, 0.045);
      currentCameraTarget.lerp(targetCameraTarget, 0.045);
      camera.lookAt(currentCameraTarget);

      // Gentle dust particle float
      const positions = particleGeo.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(time + positions[i]) * 0.001;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Raycasting for book hover
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (selectedMesh !== hit) {
          // Reset previous
          if (selectedMesh) {
            selectedMesh.position.z = selectedMesh.userData.basePosition.z;
          }
          selectedMesh = hit;
          // Pull hovered book slightly forward
          selectedMesh.position.z = selectedMesh.userData.basePosition.z + 0.08;
          setHoveredBook(hit.userData.book);
          container.style.cursor = "pointer";
        }
      } else {
        if (selectedMesh) {
          selectedMesh.position.z = selectedMesh.userData.basePosition.z;
          selectedMesh = null;
          setHoveredBook(null);
          container.style.cursor = "default";
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("click", handleClick);
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [books, theme, activeStation]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-color bg-slate-950 transition-all duration-300 shadow-2xl ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none h-screen" : "h-[540px] sm:h-[620px]"
      }`}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg pointer-events-auto">
          <Sparkles size={14} className="text-amber-400" />
          <span className="text-xs font-bold text-white tracking-wide">
            Sojib&apos;s Reading Room (3D)
          </span>
          <span className="text-[0.65rem] text-white/50 hidden sm:inline">
            · Click any 3D book to open
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen 3D Room"}
            className="p-2 rounded-xl bg-slate-900/85 backdrop-blur-md text-white/80 hover:text-white border border-white/10 shadow-lg transition-all"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {/* Close 3D View */}
          {onClose && (
            <button
              onClick={onClose}
              title="Return to 2D Shelf"
              className="p-2 rounded-xl bg-slate-900/85 backdrop-blur-md text-white/80 hover:text-white border border-white/10 shadow-lg transition-all"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Station Navigation Rail Overlay (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg">
        <span className="text-[0.62rem] font-bold uppercase tracking-wider text-white/50 px-2 hidden sm:inline">
          Station:
        </span>
        <button
          onClick={() => setActiveStation("stacks")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeStation === "stacks"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          The Stacks
        </button>
        <button
          onClick={() => setActiveStation("desk")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeStation === "desk"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          Reading Desk
        </button>
        <button
          onClick={() => setActiveStation("overview")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeStation === "overview"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          Overview
        </button>
      </div>

      {/* Hovered Book Card Overlay (Bottom Right) */}
      {hoveredBook && (
        <div className="absolute bottom-4 right-4 z-10 max-w-xs bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-amber-400/30 shadow-2xl animate-fade-in pointer-events-none">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[0.62rem] uppercase font-bold text-amber-400">
              {hoveredBook.genre}
            </span>
            {hoveredBook.rating && (
              <span className="text-[0.68rem] text-amber-400 font-bold">
                {hoveredBook.rating} ★
              </span>
            )}
          </div>
          <h4
            lang={hasBengali(hoveredBook.title) ? "bn" : "en"}
            className={`text-xs font-bold text-white line-clamp-1 ${
              hasBengali(hoveredBook.title) ? "font-bengali-serif" : ""
            }`}
          >
            {hoveredBook.title}
          </h4>
          <p className="text-[0.7rem] text-white/60">
            by {hoveredBook.author}
          </p>
          <div className="mt-2 text-[0.62rem] text-indigo-400 font-semibold flex items-center gap-1">
            <Eye size={11} /> Click to open review spread
          </div>
        </div>
      )}
    </div>
  );
}
