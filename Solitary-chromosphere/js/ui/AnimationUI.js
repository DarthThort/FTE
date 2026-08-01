/**
 * AnimationUI.js
 * 
 * Handles transition animations: WARP jump sequences and SUBLIGHT planetary travel.
 * Features realistic 3D WebGL / Canvas rendering with realistic planets, atmospheric scattering,
 * planetary rings, metallic starship model, thruster plasma trails, and 3D hyperspace warp tunnels.
 */
class AnimationUI {
    constructor(game, root) {
        this.game = game;
        this.root = root;
    }

    /**
     * Alias for showTransition to support showTravelAnimation calls
     */
    showTravelAnimation(type, callback) {
        this.showTransition(type, callback);
    }

    showWarpAnimation(callback) {
        this.showTransition('WARP', callback);
    }

    showSublightAnimation(callback) {
        this.showTransition('SUBLIGHT', callback);
    }

    /**
     * Trigger transition animation
     * @param {string} type - 'WARP' or 'SUBLIGHT'
     * @param {Function} callback - Executed when animation ends
     */
    showTransition(type, callback) {
        const existing = document.getElementById('animation-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'animation-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: #030712; z-index: 9999; display: flex; align-items: center; justify-content: center;
            flex-direction: column; overflow: hidden; font-family: 'Orbitron', var(--font-tech, monospace);
        `;

        if (type === 'WARP') {
            this._createWarpAnimation(overlay, callback);
        } else {
            this._createSublightAnimation(overlay, callback);
        }
    }

    /**
     * Spectacular 3D WebGL Hyperspace / Warp Tunnel Interstellar Jump Animation
     */
    _createWarpAnimation(overlay, callback) {
        overlay.innerHTML = `
            <div id="warp-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>
            <div style="position: absolute; top: 35px; left: 50%; transform: translateX(-50%); z-index: 10; text-align: center; pointer-events: none;">
                <div style="color: #00f0ff; font-size: 2.2rem; font-weight: 900; letter-spacing: 6px; text-shadow: 0 0 25px #00f0ff; animation: pulseWarp 1.2s infinite alternate;">
                    SALTO HIPERESPACIAL FTL INTERESTELAR
                </div>
                <div style="color: #ffaa00; font-size: 0.9rem; letter-spacing: 3px; margin-top: 8px; text-shadow: 0 0 10px #ffaa00;">
                    DISTORSIÓN ALCUBIERRE: 99.9% VELOCIDAD LUZ
                </div>
            </div>
            <div id="warp-flash" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #ffffff; opacity: 0; pointer-events: none; transition: opacity 0.4s ease; z-index: 20;"></div>
            <style>
                @keyframes pulseWarp {
                    0% { text-shadow: 0 0 15px #00f0ff, 0 0 30px #00f0ff; transform: scale(1); }
                    100% { text-shadow: 0 0 35px #00f0ff, 0 0 70px #00f0ff; transform: scale(1.03); }
                }
            </style>
        `;

        document.body.appendChild(overlay);
        const container = document.getElementById('warp-container');
        const flashOverlay = document.getElementById('warp-flash');

        if (window.THREE) {
            this._renderThreeJSWarp(container, callback, overlay, flashOverlay);
        } else {
            this._renderCanvasWarp(container, callback, overlay, flashOverlay);
        }
    }

    /**
     * 3D WebGL Hyperspace Vortex Scene
     */
    _renderThreeJSWarp(container, callback, overlay, flashOverlay) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x001020, 0.001);

        const camera = new THREE.PerspectiveCamera(50, width / height, 1, 3000);
        camera.position.set(0, 0, 180);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.4;
        container.appendChild(renderer.domElement);

        // 1. Hyperspace Vortex Tunnel Cylinder Mesh
        const tunnelGeo = new THREE.CylinderGeometry(140, 140, 3000, 32, 64, true);
        tunnelGeo.rotateX(Math.PI / 2);

        const tunnelCanvas = this._generateWarpTunnelTexture();
        const tunnelTex = new THREE.CanvasTexture(tunnelCanvas);
        tunnelTex.wrapS = THREE.RepeatWrapping;
        tunnelTex.wrapT = THREE.RepeatWrapping;
        tunnelTex.repeat.set(2, 20);

        const tunnelMat = new THREE.MeshBasicMaterial({
            map: tunnelTex,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.95
        });

        const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
        scene.add(tunnel);

        // 2. Fast Speed Particle Streaks (600 3D warp lines)
        const lineGeo = new THREE.BufferGeometry();
        const linePos = [];
        const lineColors = [];
        for (let i = 0; i < 600; i++) {
            const rad = Math.random() * 120 + 10;
            const ang = Math.random() * Math.PI * 2;
            const z = (Math.random() - 0.5) * 2000;
            linePos.push(Math.cos(ang) * rad, Math.sin(ang) * rad, z);

            const c = new THREE.Color().setHSL(0.5 + Math.random() * 0.2, 1, 0.7);
            lineColors.push(c.r, c.g, c.b);
        }
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
        lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

        const lineMat = new THREE.PointsMaterial({ size: 4, vertexColors: true, transparent: true, opacity: 0.8 });
        const warpParticles = new THREE.Points(lineGeo, lineMat);
        scene.add(warpParticles);

        // 3. 3D Battleship flying inside the tunnel
        const shipGroup = new THREE.Group();
        shipGroup.position.set(0, -12, 60);

        const hullGeo = new THREE.ConeGeometry(10, 50, 8);
        hullGeo.rotateX(Math.PI / 2);
        const hullMat = new THREE.MeshStandardMaterial({ color: 0x3b4c66, metalness: 0.9, roughness: 0.2 });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        shipGroup.add(hull);

        const wingGeo = new THREE.BoxGeometry(50, 2, 14);
        const wings = new THREE.Mesh(wingGeo, new THREE.MeshStandardMaterial({ color: 0x1e2838, metalness: 0.9 }));
        wings.position.set(0, 0, -5);
        shipGroup.add(wings);

        // Glowing Blue FTL Engine Flare
        const engGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const eng1 = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 10, 16), engGlowMat);
        eng1.rotation.x = Math.PI / 2;
        eng1.position.set(-6, 0, -28);
        shipGroup.add(eng1);

        const eng2 = eng1.clone();
        eng2.position.set(6, 0, -28);
        shipGroup.add(eng2);

        // Dynamic Warp Field Shield Aura around ship
        const shieldGeo = new THREE.SphereGeometry(30, 32, 16);
        shieldGeo.scale(1, 0.4, 1.4);
        const shieldMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.18,
            wireframe: true
        });
        const shield = new THREE.Mesh(shieldGeo, shieldMat);
        shipGroup.add(shield);

        scene.add(shipGroup);

        // Ambient Lighting inside tunnel
        const light = new THREE.PointLight(0x00f0ff, 4, 300);
        light.position.set(0, 0, 30);
        scene.add(light);

        // Animation Loop
        const clock = new THREE.Clock();
        let animId;

        const animate = () => {
            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();

            // Rotate and stream the tunnel texture
            tunnelTex.offset.y -= delta * 3.5;
            tunnel.rotation.z += delta * 0.4;

            // Camera dynamic shake & FOV acceleration
            if (elapsed < 2.5) {
                camera.fov = 50 + elapsed * 12; // FOV zoom effect
                camera.updateProjectionMatrix();

                // Camera rumble
                camera.position.x = (Math.random() - 0.5) * 1.5;
                camera.position.y = (Math.random() - 0.5) * 1.5;
            }

            // Ship movement inside tunnel
            shipGroup.position.z -= delta * 15;
            shipGroup.rotation.z = Math.sin(elapsed * 4) * 0.05;
            shieldMat.opacity = 0.18 + Math.sin(elapsed * 10) * 0.08;

            renderer.render(scene, camera);
            animId = requestAnimationFrame(animate);
        };
        animate();

        // Warp Exit Flash Sequence
        setTimeout(() => {
            if (flashOverlay) flashOverlay.style.opacity = '1';
        }, 2700);

        setTimeout(() => {
            cancelAnimationFrame(animId);
            renderer.dispose();
            overlay.style.transition = 'opacity 0.4s ease';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                if (callback) callback();
            }, 400);
        }, 3400);
    }

    /**
     * Fallback 2D Warp Animation
     */
    _renderCanvasWarp(container, callback, overlay, flashOverlay) {
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let animId;
        let speed = 2;

        const stars = [];
        for (let i = 0; i < 300; i++) {
            stars.push({
                x: (Math.random() - 0.5) * canvas.width * 2,
                y: (Math.random() - 0.5) * canvas.height * 2,
                z: Math.random() * canvas.width,
                color: '#00f0ff'
            });
        }

        const animate = () => {
            speed += 0.5;
            ctx.fillStyle = 'rgba(3, 7, 18, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                star.z -= speed;
                if (star.z <= 0) star.z = canvas.width;
                const k = 300 / star.z;
                const px = star.x * k + canvas.width / 2;
                const py = star.y * k + canvas.height / 2;

                ctx.fillStyle = star.color;
                ctx.fillRect(px, py, 3, 3);
            });

            animId = requestAnimationFrame(animate);
        };
        animate();

        setTimeout(() => {
            if (flashOverlay) flashOverlay.style.opacity = '1';
        }, 2500);

        setTimeout(() => {
            cancelAnimationFrame(animId);
            overlay.remove();
            if (callback) callback();
        }, 3000);
    }

    /**
     * Sublight Planetary Travel Scene (Realistic 3D / Shader Planets & Realistic Battleship)
     */
    _createSublightAnimation(overlay, callback) {
        overlay.innerHTML = `
            <div id="sublight-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>
            <div style="position: absolute; top: 35px; left: 50%; transform: translateX(-50%); z-index: 10; text-align: center; pointer-events: none;">
                <div style="color: #ffcc00; font-size: 1.3rem; font-weight: 700; letter-spacing: 4px; text-shadow: 0 0 15px rgba(255,204,0,0.8);">
                    NAVEGACIÓN INTERPLANETARIA SUBLUMÍNICA
                </div>
                <div style="color: #00f0ff; font-size: 0.85rem; letter-spacing: 2px; margin-top: 5px; opacity: 0.8;">
                    APROXIMACIÓN AL SISTEMA DESTINO
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        const container = document.getElementById('sublight-container');

        // Check if Three.js is available
        if (window.THREE) {
            this._renderThreeJSTravel(container, callback, overlay);
        } else {
            this._renderCanvasTravel(container, callback, overlay);
        }
    }

    /**
     * Realistic 3D WebGL Scene using Three.js
     */
    _renderThreeJSTravel(container, callback, overlay) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x030712, 0.0003);

        const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
        camera.position.set(0, 40, 260);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        container.appendChild(renderer.domElement);

        // Lighting
        const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
        sunLight.position.set(-300, 150, 200);
        scene.add(sunLight);

        const ambientLight = new THREE.AmbientLight(0x1a2636, 0.6);
        scene.add(ambientLight);

        const blueLight = new THREE.PointLight(0x00f0ff, 2, 500);
        blueLight.position.set(200, -100, -100);
        scene.add(blueLight);

        // 1. Starfield Background
        const starsGeo = new THREE.BufferGeometry();
        const starPositions = [];
        const starColors = [];
        for (let i = 0; i < 4000; i++) {
            starPositions.push(
                (Math.random() - 0.5) * 6000,
                (Math.random() - 0.5) * 6000,
                (Math.random() - 0.5) * 6000
            );
            const col = new THREE.Color().setHSL(Math.random() * 0.2 + 0.5, 0.8, Math.random() * 0.5 + 0.5);
            starColors.push(col.r, col.g, col.b);
        }
        starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
        starsGeo.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

        const starsMat = new THREE.PointsMaterial({ size: 2.5, vertexColors: true, transparent: true, opacity: 0.9 });
        const starField = new THREE.Points(starsGeo, starsMat);
        scene.add(starField);

        // 2. Realistic 3D Planet 1: Terran World with Atmosphere
        const planet1Group = new THREE.Group();
        planet1Group.position.set(-280, -30, -350);

        const p1Geo = new THREE.SphereGeometry(110, 64, 64);
        const p1Canvas = this._generateTerranTexture();
        const p1Tex = new THREE.CanvasTexture(p1Canvas);
        const p1Mat = new THREE.MeshStandardMaterial({
            map: p1Tex,
            roughness: 0.7,
            metalness: 0.1
        });
        const planet1 = new THREE.Mesh(p1Geo, p1Mat);
        planet1Group.add(planet1);

        // Atmosphere halo shell
        const atmoGeo = new THREE.SphereGeometry(114, 64, 64);
        const atmoMat = new THREE.MeshBasicMaterial({
            color: 0x00d0ff,
            transparent: true,
            opacity: 0.22,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
        planet1Group.add(atmosphere);

        scene.add(planet1Group);

        // 3. Realistic 3D Planet 2: Ringed Gas Giant
        const planet2Group = new THREE.Group();
        planet2Group.position.set(380, 80, -700);

        const p2Geo = new THREE.SphereGeometry(140, 64, 64);
        const p2Canvas = this._generateGasGiantTexture();
        const p2Tex = new THREE.CanvasTexture(p2Canvas);
        const p2Mat = new THREE.MeshStandardMaterial({ map: p2Tex, roughness: 0.9 });
        const planet2 = new THREE.Mesh(p2Geo, p2Mat);
        planet2Group.add(planet2);

        // Saturn-like 3D Ring
        const ringGeo = new THREE.RingGeometry(170, 260, 64);
        const ringCanvas = this._generateRingTexture();
        const ringTex = new THREE.CanvasTexture(ringCanvas);
        const ringMat = new THREE.MeshBasicMaterial({
            map: ringTex,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.3;
        ring.rotation.y = -0.2;
        planet2Group.add(ring);

        scene.add(planet2Group);

        // 4. Realistic 3D Spaceship Model
        const shipGroup = new THREE.Group();
        shipGroup.position.set(-150, 0, 80);
        shipGroup.rotation.y = Math.PI / 2.2;
        shipGroup.rotation.z = -0.08;

        // Fuselage hull
        const hullGeo = new THREE.ConeGeometry(12, 60, 8);
        hullGeo.rotateX(Math.PI / 2);
        const hullMat = new THREE.MeshStandardMaterial({
            color: 0x2e3c50,
            metalness: 0.85,
            roughness: 0.2,
            wireframe: false
        });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        shipGroup.add(hull);

        // Command Bridge Windows
        const bridgeGeo = new THREE.BoxGeometry(6, 4, 18);
        const bridgeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
        bridge.position.set(0, 4, 5);
        shipGroup.add(bridge);

        // Wings
        const wingGeo = new THREE.BoxGeometry(60, 2, 18);
        const wingMat = new THREE.MeshStandardMaterial({ color: 0x1a2433, metalness: 0.9, roughness: 0.3 });
        const wings = new THREE.Mesh(wingGeo, wingMat);
        wings.position.set(0, -1, -6);
        shipGroup.add(wings);

        // Engine Thruster Nozzles
        const engineMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
        const eng1 = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 8, 16), engineMat);
        eng1.rotation.x = Math.PI / 2;
        eng1.position.set(-8, 0, -32);
        shipGroup.add(eng1);

        const eng2 = eng1.clone();
        eng2.position.set(8, 0, -32);
        shipGroup.add(eng2);

        // Engine Thruster Glowing Light
        const thrusterLight = new THREE.PointLight(0xff7700, 3, 60);
        thrusterLight.position.set(0, 0, -35);
        shipGroup.add(thrusterLight);

        scene.add(shipGroup);

        // Animation Loop
        let animId;
        const clock = new THREE.Clock();

        const animate = () => {
            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();

            // Rotate planets
            planet1.rotation.y += delta * 0.05;
            planet2.rotation.y += delta * 0.03;

            // Move planets across view
            planet1Group.position.x += delta * 25;
            planet2Group.position.x += delta * 20;

            // Ship flight dynamics (gentle floating/banking)
            shipGroup.position.x += delta * 45;
            shipGroup.position.y = Math.sin(elapsed * 1.5) * 3;
            shipGroup.rotation.z = -0.08 + Math.sin(elapsed * 1.2) * 0.04;

            // Camera subtle movement
            camera.position.x = Math.sin(elapsed * 0.5) * 10;

            renderer.render(scene, camera);
            animId = requestAnimationFrame(animate);
        };
        animate();

        setTimeout(() => {
            cancelAnimationFrame(animId);
            renderer.dispose();
            overlay.style.transition = 'opacity 0.6s ease';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                if (callback) callback();
            }, 600);
        }, 5500);
    }

    /**
     * Fallback Canvas travel renderer if WebGL is unavailable
     */
    _renderCanvasTravel(container, callback, overlay) {
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let animId;
        let time = 0;

        const animate = () => {
            time += 0.016;
            ctx.fillStyle = '#030712';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Gas Giant with Ring
            const pX = (time * 80) % (canvas.width + 400) - 200;
            const pY = canvas.height * 0.45;

            // Planet Body
            const pGrad = ctx.createRadialGradient(pX - 30, pY - 30, 10, pX, pY, 120);
            pGrad.addColorStop(0, '#6488b0');
            pGrad.addColorStop(0.5, '#2e486b');
            pGrad.addColorStop(1, '#0e1a2b');
            ctx.fillStyle = pGrad;
            ctx.beginPath(); ctx.arc(pX, pY, 120, 0, Math.PI * 2); ctx.fill();

            // Ship
            const sX = canvas.width * 0.45;
            const sY = canvas.height * 0.55 + Math.sin(time * 2) * 6;
            ctx.fillStyle = '#00f0ff';
            ctx.fillRect(sX, sY, 60, 20);

            animId = requestAnimationFrame(animate);
        };
        animate();

        setTimeout(() => {
            cancelAnimationFrame(animId);
            overlay.remove();
            if (callback) callback();
        }, 5000);
    }

    /**
     * Helper: Generate Procedural Warp Tunnel Texture
     */
    _generateWarpTunnelTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 1024;
        const ctx = c.getContext('2d');

        // Deep blue to cyan & magenta streaks
        const bgGrad = ctx.createLinearGradient(0, 0, c.width, 0);
        bgGrad.addColorStop(0, '#030a1c');
        bgGrad.addColorStop(0.3, '#0c2756');
        bgGrad.addColorStop(0.5, '#0055aa');
        bgGrad.addColorStop(0.7, '#6600cc');
        bgGrad.addColorStop(1, '#030a1c');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, c.width, c.height);

        // Speed line streaks
        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * c.width;
            const y = Math.random() * c.height;
            const w = Math.random() * 6 + 1;
            const h = Math.random() * 250 + 50;
            ctx.fillRect(x, y, w, h);
        }

        // Magenta energy arcs
        ctx.fillStyle = 'rgba(255, 0, 200, 0.35)';
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * c.width;
            const y = Math.random() * c.height;
            const w = Math.random() * 4 + 1;
            const h = Math.random() * 180 + 40;
            ctx.fillRect(x, y, w, h);
        }

        return c;
    }

    /**
     * Helper: Generate Terran Planet Texture Canvas
     */
    _generateTerranTexture() {
        const c = document.createElement('canvas');
        c.width = 1024; c.height = 512;
        const ctx = c.getContext('2d');

        // Oceans
        ctx.fillStyle = '#0a2342';
        ctx.fillRect(0, 0, c.width, c.height);

        // Continents (Procedural noise patches)
        ctx.fillStyle = '#2d5a27';
        for (let i = 0; i < 60; i++) {
            const rx = Math.random() * c.width;
            const ry = Math.random() * c.height * 0.7 + c.height * 0.15;
            const r = Math.random() * 80 + 30;
            ctx.beginPath(); ctx.arc(rx, ry, r, 0, Math.PI * 2); ctx.fill();
        }

        // Desert patches
        ctx.fillStyle = '#8b7355';
        for (let i = 0; i < 20; i++) {
            const rx = Math.random() * c.width;
            const ry = Math.random() * c.height * 0.5 + c.height * 0.25;
            ctx.beginPath(); ctx.arc(rx, ry, Math.random() * 40 + 10, 0, Math.PI * 2); ctx.fill();
        }

        // Polar ice caps
        ctx.fillStyle = '#eef5fc';
        ctx.fillRect(0, 0, c.width, 40);
        ctx.fillRect(0, c.height - 40, c.width, 40);

        // White cloud bands
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 35; i++) {
            const cx = Math.random() * c.width;
            const cy = Math.random() * c.height;
            ctx.beginPath(); ctx.ellipse(cx, cy, Math.random() * 120 + 40, Math.random() * 15 + 5, 0, 0, Math.PI * 2); ctx.fill();
        }

        return c;
    }

    /**
     * Helper: Generate Gas Giant Texture Canvas
     */
    _generateGasGiantTexture() {
        const c = document.createElement('canvas');
        c.width = 1024; c.height = 512;
        const ctx = c.getContext('2d');

        const bands = ['#2b1810', '#7c4327', '#d99b6c', '#4a2818', '#b87340', '#efc69b', '#3d2012'];
        const bandH = c.height / bands.length;

        bands.forEach((color, i) => {
            ctx.fillStyle = color;
            ctx.fillRect(0, i * bandH, c.width, bandH);
        });

        // Turbulent atmospheric swirls
        ctx.fillStyle = 'rgba(255, 220, 180, 0.25)';
        for (let i = 0; i < 40; i++) {
            const sx = Math.random() * c.width;
            const sy = Math.random() * c.height;
            ctx.beginPath();
            ctx.ellipse(sx, sy, Math.random() * 150 + 50, Math.random() * 12 + 4, Math.random() * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Great Red Spot storm
        ctx.fillStyle = '#a83220';
        ctx.beginPath();
        ctx.ellipse(c.width * 0.65, c.height * 0.6, 70, 40, 0, 0, Math.PI * 2);
        ctx.fill();

        return c;
    }

    /**
     * Helper: Generate Planetary Ring Texture Canvas
     */
    _generateRingTexture() {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 1;
        const ctx = c.getContext('2d');

        const grad = ctx.createLinearGradient(0, 0, c.width, 0);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.2, 'rgba(217, 155, 108, 0.8)');
        grad.addColorStop(0.4, 'rgba(124, 67, 39, 0.6)');
        grad.addColorStop(0.5, 'rgba(0,0,0,0.4)'); // Cassini division gap
        grad.addColorStop(0.7, 'rgba(239, 198, 155, 0.9)');
        grad.addColorStop(0.9, 'rgba(184, 115, 64, 0.5)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, c.width, 1);

        return c;
    }
}
