// MuscleXA Store Interactive Script
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ==========================================
  // 1. THREE.JS KINETIC SPACE BACKGROUND
  // ==========================================
  const initThreeBackground = () => {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas || typeof THREE === "undefined") return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07070a, 0.0035);

    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.z = 100;
    camera.position.y = 10;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // Planet texture generation
    const planetCanvas = document.createElement("canvas");
    planetCanvas.width = 512;
    planetCanvas.height = 256;
    const planetCtx = planetCanvas.getContext("2d");
    if (planetCtx) {
      planetCtx.fillStyle = "#8a8a93";
      planetCtx.fillRect(0, 0, 512, 256);

      // Noise spots
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        const r = Math.random() * 15 + 2;
        const grad = planetCtx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, "rgba(50, 50, 55, 0.5)");
        grad.addColorStop(1, "rgba(138, 138, 147, 0)");
        planetCtx.fillStyle = grad;
        planetCtx.beginPath();
        planetCtx.arc(x, y, r, 0, Math.PI * 2);
        planetCtx.fill();
      }
    }
    const planetTexture = new THREE.CanvasTexture(planetCanvas);

    // Planet mesh
    const planetGeom = new THREE.SphereGeometry(18, 64, 64);
    const planetMat = new THREE.MeshPhongMaterial({
      map: planetTexture,
      shininess: 8,
      color: 0xbbbbbb
    });
    const planet = new THREE.Mesh(planetGeom, planetMat);
    planet.position.set(50, 20, -50);
    scene.add(planet);

    // Stars field
    const starCount = 1200;
    const starsGeom = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 300 + Math.random() * 150;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    starsGeom.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));

    // Star point texture
    const starCanvas = document.createElement("canvas");
    starCanvas.width = 16;
    starCanvas.height = 16;
    const starCtx = starCanvas.getContext("2d");
    if (starCtx) {
      const grad = starCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.3, "rgba(255, 220, 220, 0.8)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      starCtx.fillStyle = grad;
      starCtx.fillRect(0, 0, 16, 16);
    }
    const starTexture = new THREE.CanvasTexture(starCanvas);
    const starsMat = new THREE.PointsMaterial({
      size: 1.6,
      map: starTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const starField = new THREE.Points(starsGeom, starsMat);
    scene.add(starField);

    // Nebula space clouds
    const cloudCanvas = document.createElement("canvas");
    cloudCanvas.width = 128;
    cloudCanvas.height = 128;
    const cloudCtx = cloudCanvas.getContext("2d");
    if (cloudCtx) {
      const grad = cloudCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(220, 38, 38, 0.08)");
      grad.addColorStop(0.5, "rgba(185, 28, 28, 0.02)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      cloudCtx.fillStyle = grad;
      cloudCtx.fillRect(0, 0, 128, 128);
    }
    const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
    const cloudGeom = new THREE.PlaneGeometry(160, 160);
    const clouds = [];
    for (let i = 0; i < 4; i++) {
      const cloudMat = new THREE.MeshBasicMaterial({
        map: cloudTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const cloud = new THREE.Mesh(cloudGeom, cloudMat);
      cloud.position.set(
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 100,
        -150 - Math.random() * 100
      );
      cloud.rotation.z = Math.random() * Math.PI;
      scene.add(cloud);
      clouds.push(cloud);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0f0c0d, 0.6);
    scene.add(ambientLight);

    const spaceGlow = new THREE.PointLight(0xdc2626, 1.8, 400);
    spaceGlow.position.set(-60, 50, -50);
    scene.add(spaceGlow);

    const sunLight = new THREE.DirectionalLight(0xfff0f0, 1.3);
    sunLight.position.set(-80, 45, 120);
    scene.add(sunLight);

    // Mouse movement interaction
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    window.addEventListener("mousemove", (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.04;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.04;
    });

    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Planet rotation
      planet.rotation.y = time * 0.012;
      planet.rotation.x = time * 0.002;

      // Stars rotation
      starField.rotation.y = time * 0.0008;

      // Clouds rotation
      clouds.forEach((c, idx) => {
        c.rotation.z += 0.0002 * (idx + 1);
      });

      // Twinkle size adjustment
      starsMat.size = 1.5 + Math.sin(time * 2.2) * 0.3;

      // Camera parallax damping
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY + 10 - camera.position.y) * 0.05;
      camera.lookAt(new THREE.Vector3(0, 0, -50));

      renderer.render(scene, camera);
    };

    animate();

    window.addEventListener("resize", () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  };

  initThreeBackground();

  // ==========================================
  // 2. CONFIGURATOR STATE & EVENT HANDLING
  // ==========================================
  let activeProduct = "isolate"; // isolate vs concentrate
  let packaging = "pouch";       // pouch vs tub
  let flavor = "chocolate";      // chocolate vs cookies_cream
  let size = "2lbs";             // 2lbs vs 5lbs
  let qty = 1;

  const prices = {
    isolate: { "2lbs": 49.99, "5lbs": 89.99 },
    concentrate: { "2lbs": 39.99, "5lbs": 69.99 }
  };

  const getSpecs = () => {
    if (activeProduct === "isolate") {
      return {
        name: "Whey Isolate (WPI-90)",
        fullName: "MuscleXA Whey Protein Isolate (WPI-90)",
        protein: "25g",
        bcaa: "5.5g",
        glutamine: "4.3g",
        sugar: "0g",
        calories: 110,
        fat: "0g",
        carbs: "1g",
        sodium: "80mg",
        cholesterol: "5mg",
        calcium: "130mg",
        servings: size === "2lbs" ? 30 : 75
      };
    } else {
      return {
        name: "Whey Concentrate (WPC-80)",
        fullName: "MuscleXA Whey Protein Concentrate (WPC-80)",
        protein: "24g",
        bcaa: "5.3g",
        glutamine: "4.0g",
        sugar: "0g",
        calories: 125,
        fat: "1.5g",
        carbs: "2g",
        sodium: "95mg",
        cholesterol: "25mg",
        calcium: "120mg",
        servings: size === "2lbs" ? 30 : 75
      };
    }
  };

  const updateConfiguratorDOM = () => {
    const specs = getSpecs();
    const unitPrice = prices[activeProduct][size];
    const subtotal = unitPrice * qty;

    // Update active state visual classes in config buttons
    document.querySelectorAll("[data-formula]").forEach(btn => {
      const val = btn.getAttribute("data-formula");
      if (val === activeProduct) {
        btn.classList.add("border-red-600", "bg-red-600/10", "text-white");
        btn.classList.remove("border-white/5", "bg-[#101015]/60", "text-gray-400");
        const check = btn.querySelector(".check-indicator");
        if (check) check.classList.remove("hidden");
      } else {
        btn.classList.remove("border-red-600", "bg-red-600/10", "text-white");
        btn.classList.add("border-white/5", "bg-[#101015]/60", "text-gray-400");
        const check = btn.querySelector(".check-indicator");
        if (check) check.classList.add("hidden");
      }
    });

    document.querySelectorAll("[data-packaging]").forEach(btn => {
      const val = btn.getAttribute("data-packaging");
      if (val === packaging) {
        btn.classList.add("border-red-600", "bg-red-600/10", "text-white");
        btn.classList.remove("border-white/5", "bg-[#101015]/60", "text-gray-400");
        const check = btn.querySelector(".check-indicator");
        if (check) check.classList.remove("hidden");
      } else {
        btn.classList.remove("border-red-600", "bg-red-600/10", "text-white");
        btn.classList.add("border-white/5", "bg-[#101015]/60", "text-gray-400");
        const check = btn.querySelector(".check-indicator");
        if (check) check.classList.add("hidden");
      }
    });

    document.querySelectorAll("[data-flavor]").forEach(btn => {
      const val = btn.getAttribute("data-flavor");
      if (val === flavor) {
        btn.classList.add("border-red-600", "bg-red-600/10", "text-white");
        btn.classList.remove("border-white/5", "bg-[#101015]/60", "text-gray-400");
        const check = btn.querySelector(".check-indicator");
        if (check) check.classList.remove("hidden");
      } else {
        btn.classList.remove("border-red-600", "bg-red-600/10", "text-white");
        btn.classList.add("border-white/5", "bg-[#101015]/60", "text-gray-400");
        const check = btn.querySelector(".check-indicator");
        if (check) check.classList.add("hidden");
      }
    });

    document.querySelectorAll("[data-size]").forEach(btn => {
      const val = btn.getAttribute("data-size");
      if (val === size) {
        btn.classList.add("border-red-600", "bg-red-600/10", "text-white");
        btn.classList.remove("border-white/5", "bg-[#101015]/60", "text-gray-400");
        const check = btn.querySelector(".check-indicator");
        if (check) check.classList.remove("hidden");
      } else {
        btn.classList.remove("border-red-600", "bg-red-600/10", "text-white");
        btn.classList.add("border-white/5", "bg-[#101015]/60", "text-gray-400");
        const check = btn.querySelector(".check-indicator");
        if (check) check.classList.add("hidden");
      }
    });

    // Update Text values
    document.getElementById("cfg-product-name").innerText = specs.fullName;
    document.getElementById("cfg-product-desc").innerText = `Flavor: ${flavor === "chocolate" ? "Double Rich Chocolate" : "Creamy Cookies & Cream"} | Packaging: ${packaging === "pouch" ? "Eco Pouch Bag" : "Heavy-duty Tub"} | Size: ${size}`;
    
    document.getElementById("cfg-badge-protein").innerText = specs.protein;
    document.getElementById("cfg-badge-bcaa").innerText = specs.bcaa;
    document.getElementById("cfg-badge-servings").innerText = specs.servings;

    document.getElementById("cfg-unit-price").innerText = `$${unitPrice.toFixed(2)}`;
    document.getElementById("cfg-qty").innerText = qty;
    document.getElementById("cfg-subtotal").innerText = `$${subtotal.toFixed(2)}`;

    // Update FDA Nutrition Label DOM values
    document.getElementById("fda-title").innerText = specs.fullName;
    document.getElementById("fda-servings").innerText = specs.servings;
    document.getElementById("fda-calories").innerText = specs.calories;
    document.getElementById("fda-fat-calories").innerText = activeProduct === "isolate" ? "0" : "15";
    document.getElementById("fda-fat-pct").innerText = activeProduct === "isolate" ? "0%" : "2%";
    document.getElementById("fda-fat-val").innerText = specs.fat;
    document.getElementById("fda-cholesterol").innerText = specs.cholesterol;
    document.getElementById("fda-chol-pct").innerText = activeProduct === "isolate" ? "2%" : "8%";
    document.getElementById("fda-sodium").innerText = specs.sodium;
    document.getElementById("fda-sod-pct").innerText = activeProduct === "isolate" ? "3%" : "4%";
    document.getElementById("fda-carbs").innerText = specs.carbs;
    document.getElementById("fda-carb-pct").innerText = activeProduct === "isolate" ? "0%" : "1%";
    document.getElementById("fda-protein-val").innerText = specs.protein;
    document.getElementById("fda-protein-pct").innerText = activeProduct === "isolate" ? "50%" : "48%";
    document.getElementById("fda-calcium").innerText = specs.calcium;
    document.getElementById("fda-bcaa-val").innerText = specs.bcaa;
    document.getElementById("fda-glutamine-val").innerText = specs.glutamine;
  };

  // Attach Configurator Button Event Listeners
  document.querySelectorAll("[data-formula]").forEach(btn => {
    btn.addEventListener("click", () => {
      activeProduct = btn.getAttribute("data-formula");
      updateConfiguratorDOM();
    });
  });

  document.querySelectorAll("[data-packaging]").forEach(btn => {
    btn.addEventListener("click", () => {
      packaging = btn.getAttribute("data-packaging");
      updateConfiguratorDOM();
    });
  });

  document.querySelectorAll("[data-flavor]").forEach(btn => {
    btn.addEventListener("click", () => {
      flavor = btn.getAttribute("data-flavor");
      updateConfiguratorDOM();
    });
  });

  document.querySelectorAll("[data-size]").forEach(btn => {
    btn.addEventListener("click", () => {
      size = btn.getAttribute("data-size");
      updateConfiguratorDOM();
    });
  });

  // Quantity control
  const btnMinus = document.getElementById("qty-minus");
  const btnPlus = document.getElementById("qty-plus");

  if (btnMinus && btnPlus) {
    btnMinus.addEventListener("click", () => {
      qty = Math.max(1, qty - 1);
      updateConfiguratorDOM();
    });

    btnPlus.addEventListener("click", () => {
      qty += 1;
      updateConfiguratorDOM();
    });
  }

  // Initial Config load
  updateConfiguratorDOM();

  // ==========================================
  // 3. SHOPPING CART SYSTEM (LOCAL STORAGE & DRAWER)
  // ==========================================
  let cart = [];
  const cartDrawer = document.getElementById("cart-drawer");
  const cartOverlay = document.getElementById("cart-overlay");
  const checkoutModal = document.getElementById("checkout-success-modal");

  const saveCart = () => {
    localStorage.setItem("musclexa_cart", JSON.stringify(cart));
    updateCartCountBadge();
  };

  const loadCart = () => {
    const data = localStorage.getItem("musclexa_cart");
    if (data) {
      cart = JSON.parse(data);
    }
    updateCartCountBadge();
  };

  const updateCartCountBadge = () => {
    const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
    const badges = document.querySelectorAll(".cart-count-badge");
    badges.forEach(badge => {
      if (totalCount > 0) {
        badge.innerText = totalCount;
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    });
  };

  const renderCartItems = () => {
    const listContainer = document.getElementById("cart-items-list");
    if (!listContainer) return;

    listContainer.innerHTML = "";

    if (cart.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-20 space-y-4">
          <div class="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500 border border-white/10">
            <i data-lucide="shopping-bag" class="w-6 h-6"></i>
          </div>
          <p class="text-xs text-gray-500 font-light leading-relaxed">
            Your shopping cart is currently empty. Configure a supplement stack and add it to the cart to checkout.
          </p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      document.getElementById("cart-subtotal").innerText = "$0.00";
      document.getElementById("shipping-banner-text").innerHTML = `Add <strong class="text-white">$50.00</strong> more for free shipping.`;
      document.getElementById("btn-checkout").disabled = true;
      document.getElementById("btn-checkout").classList.add("bg-white/5", "text-gray-500", "cursor-not-allowed");
      document.getElementById("btn-checkout").classList.remove("bg-red-600", "hover:bg-red-700", "text-white", "cursor-pointer");
      return;
    }

    let subtotal = 0;
    cart.forEach(item => {
      const itemSubtotal = item.price * item.qty;
      subtotal += itemSubtotal;

      const itemEl = document.createElement("div");
      itemEl.className = "p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between gap-4";
      itemEl.innerHTML = `
        <div class="w-12 h-12 rounded-xl bg-[#07070a] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
          <img src="assets/images/musclexa_products.png" alt="${item.name}" class="w-10 h-auto object-contain">
        </div>
        <div class="flex-1 text-left min-w-0">
          <span class="block text-xs font-bold text-white truncate">${item.name}</span>
          <span class="block text-[10px] text-gray-400 capitalize truncate">${item.flavor.replace("_", " ")} | ${item.size} | ${item.packaging}</span>
          <span class="block text-xs font-bold text-red-500 font-mono mt-1">$${item.price.toFixed(2)}</span>
        </div>
        <div class="flex flex-col items-end gap-2 shrink-0">
          <div class="flex items-center bg-[#07070a] border border-white/10 rounded-lg p-0.5">
            <button class="qty-dec p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded cursor-pointer" data-id="${item.id}">
              <i data-lucide="minus" class="w-2.5 h-2.5"></i>
            </button>
            <span class="px-2 text-xs font-bold text-white font-mono">${item.qty}</span>
            <button class="qty-inc p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded cursor-pointer" data-id="${item.id}">
              <i data-lucide="plus" class="w-2.5 h-2.5"></i>
            </button>
          </div>
          <button class="item-remove text-gray-500 hover:text-red-500 transition-colors p-1 cursor-pointer" data-id="${item.id}">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `;
      listContainer.appendChild(itemEl);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Update Totals in Drawer
    document.getElementById("cart-subtotal").innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById("btn-checkout").disabled = false;
    document.getElementById("btn-checkout").classList.remove("bg-white/5", "text-gray-500", "cursor-not-allowed");
    document.getElementById("btn-checkout").classList.add("bg-red-600", "hover:bg-red-700", "text-white", "cursor-pointer");

    // Shipping calculation
    const shippingBanner = document.getElementById("shipping-banner-text");
    if (subtotal >= 50) {
      shippingBanner.innerHTML = `<span class="text-emerald-500 font-bold">🎉 YOU QUALIFIED FOR FREE SHIPPING!</span>`;
    } else {
      const remaining = 50 - subtotal;
      shippingBanner.innerHTML = `Add <strong class="text-white">$${remaining.toFixed(2)}</strong> more for free shipping.`;
    }

    // Attach listeners in list
    listContainer.querySelectorAll(".qty-dec").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        adjustCartQty(id, -1);
      });
    });

    listContainer.querySelectorAll(".qty-inc").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        adjustCartQty(id, 1);
      });
    });

    listContainer.querySelectorAll(".item-remove").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        removeCartItem(id);
      });
    });
  };

  const adjustCartQty = (id, delta) => {
    cart = cart.map(item => {
      if (item.id === id) {
        return { ...item, qty: item.qty + delta };
      }
      return item;
    }).filter(item => item.qty > 0);
    saveCart();
    renderCartItems();
  };

  const removeCartItem = (id) => {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCartItems();
  };

  const toggleCartDrawer = (open) => {
    if (open) {
      cartDrawer.classList.remove("translate-x-full");
      cartOverlay.classList.remove("hidden");
      renderCartItems();
    } else {
      cartDrawer.classList.add("translate-x-full");
      cartOverlay.classList.add("hidden");
    }
  };

  // Add configuration to cart
  const btnAddToCart = document.getElementById("btn-add-to-cart");
  if (btnAddToCart) {
    btnAddToCart.addEventListener("click", () => {
      const itemUniqueId = `${activeProduct}-${flavor}-${size}-${packaging}`;
      const specs = getSpecs();
      const unitPrice = prices[activeProduct][size];

      const existingIndex = cart.findIndex(item => item.id === itemUniqueId);
      if (existingIndex > -1) {
        cart[existingIndex].qty += qty;
      } else {
        cart.push({
          id: itemUniqueId,
          name: activeProduct === "isolate" ? "Whey Isolate (WPI-90)" : "Whey Protein (WPC-80)",
          type: activeProduct,
          flavor: flavor,
          size: size,
          packaging: packaging,
          price: unitPrice,
          qty: qty
        });
      }

      saveCart();
      qty = 1;
      updateConfiguratorDOM();
      toggleCartDrawer(true);
    });
  }

  // Bind cart drawer buttons
  const openCartBtns = document.querySelectorAll(".btn-open-cart");
  openCartBtns.forEach(btn => {
    btn.addEventListener("click", () => toggleCartDrawer(true));
  });

  const closeCartBtn = document.getElementById("btn-close-cart");
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", () => toggleCartDrawer(false));
  }
  if (cartOverlay) {
    cartOverlay.addEventListener("click", () => toggleCartDrawer(false));
  }

  // Simulated Checkout action
  const btnCheckout = document.getElementById("btn-checkout");
  if (btnCheckout) {
    btnCheckout.addEventListener("click", () => {
      const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
      document.getElementById("checkout-success-subtotal").innerText = `$${subtotal.toFixed(2)}`;
      document.getElementById("checkout-order-id").innerText = `MXA-${Math.floor(100000 + Math.random() * 900000)}`;

      // Show success modal
      checkoutModal.classList.remove("hidden");
      checkoutModal.classList.add("flex");

      // Reset cart
      cart = [];
      saveCart();
      toggleCartDrawer(false);

      // Hide modal after 3.5 seconds
      setTimeout(() => {
        checkoutModal.classList.add("hidden");
        checkoutModal.classList.remove("flex");
      }, 3500);
    });
  }

  // Load initial cart storage
  loadCart();

  // ==========================================
  // 4. DIETARY PROTEIN & BMI CALCULATOR
  // ==========================================
  const calcForm = document.getElementById("protein-calc-form");
  const calcResultsBox = document.getElementById("calc-results-box");
  const calcEmptyBox = document.getElementById("calc-empty-box");

  if (calcForm) {
    calcForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const weight = parseFloat(document.getElementById("calc-weight").value);
      const weightUnit = document.getElementById("calc-weight-unit").value;
      const height = parseFloat(document.getElementById("calc-height").value);
      const activity = document.getElementById("calc-activity").value;
      const goal = document.getElementById("calc-goal").value;

      if (!weight || !height || weight <= 0 || height <= 0) return;

      // Convert weight to kg
      const wKg = weightUnit === "lbs" ? weight * 0.453592 : weight;
      const hM = height / 100;

      // Calculate BMI
      const bmi = wKg / (hM * hM);
      let bmiStatus = "";
      if (bmi < 18.5) bmiStatus = "Underweight";
      else if (bmi < 24.9) bmiStatus = "Normal Weight";
      else if (bmi < 29.9) bmiStatus = "Overweight";
      else bmiStatus = "Obese";

      // Daily Protein intake requirements
      let baseMultiplier = 0.8;
      if (activity === "moderate") baseMultiplier = 1.3;
      if (activity === "active") baseMultiplier = 1.7;
      if (activity === "athlete") baseMultiplier = 2.2;

      let goalAdjustment = 0;
      if (goal === "muscle") goalAdjustment = 0.3;
      if (goal === "fat_loss") goalAdjustment = 0.15;

      const proteinGrams = Math.round(wKg * (baseMultiplier + goalAdjustment));

      // Build Recommendation text
      let recommendation = "";
      if (goal === "fat_loss") {
        recommendation = "MuscleXA Whey Isolate WPI-90 is the ideal choice for you. With 0g added sugar and 0g fat, it supplies 25g of clean muscle-preserving protein with minimal calorie load.";
      } else {
        recommendation = "MuscleXA Whey Protein WPC-80 fits your profile perfectly. Providing 24g of high-quality concentrate protein with rich flavor, it supports clean mass gains and cost-effective daily muscle fuel.";
      }

      // Update DOM with results
      document.getElementById("calc-res-bmi").innerText = bmi.toFixed(1);
      document.getElementById("calc-res-status").innerText = bmiStatus;
      document.getElementById("calc-res-protein").innerText = `${proteinGrams}g`;
      document.getElementById("calc-res-recommendation").innerText = recommendation;

      // Toggle views
      calcEmptyBox.classList.add("hidden");
      calcResultsBox.classList.remove("hidden");
    });

    const btnResetCalc = document.getElementById("btn-reset-calc");
    if (btnResetCalc) {
      btnResetCalc.addEventListener("click", () => {
        calcForm.reset();
        calcResultsBox.classList.add("hidden");
        calcEmptyBox.classList.remove("hidden");
      });
    }
  }

  // ==========================================
  // 5. FAQ ACCORDION HANDLER
  // ==========================================
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item, idx) => {
    const btn = item.querySelector(".faq-btn");
    const content = item.querySelector(".faq-content");
    const icon = item.querySelector(".faq-icon");

    btn.addEventListener("click", () => {
      const isOpen = !content.classList.contains("hidden");

      // Close all first
      document.querySelectorAll(".faq-content").forEach(c => c.classList.add("hidden"));
      document.querySelectorAll(".faq-icon").forEach(i => i.classList.remove("rotate-180", "text-red-500"));

      // Toggle current
      if (!isOpen) {
        content.classList.remove("hidden");
        icon.classList.add("rotate-180", "text-red-500");
      }
    });
  });

  // ==========================================
  // 6. CONTACT FORM SYSTEM
  // ==========================================
  const contactForm = document.getElementById("partner-contact-form");
  const contactSuccess = document.getElementById("contact-success-state");

  if (contactForm && contactSuccess) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      contactForm.classList.add("hidden");
      contactSuccess.classList.remove("hidden");
      contactForm.reset();
    });

    const btnResetContact = document.getElementById("btn-reset-contact");
    if (btnResetContact) {
      btnResetContact.addEventListener("click", () => {
        contactSuccess.classList.add("hidden");
        contactForm.classList.remove("hidden");
      });
    }
  }

  // ==========================================
  // 7. PARTNER TYPE TABS IN CONTACT FORM
  // ==========================================
  const partnerTabs = document.querySelectorAll("[data-partner]");
  let activePartnerType = "retail";

  partnerTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      activePartnerType = tab.getAttribute("data-partner");

      partnerTabs.forEach(t => {
        t.classList.remove("border-red-600", "bg-red-600/10", "text-white");
        t.classList.add("border-white/5", "bg-[#07070a]", "text-gray-400");
      });

      tab.classList.add("border-red-600", "bg-red-600/10", "text-white");
      tab.classList.remove("border-white/5", "bg-[#07070a]", "text-gray-400");
    });
  });

  // ==========================================
  // 8. MOBILE MENU TOGGLER
  // ==========================================
  const btnMobileMenu = document.getElementById("btn-mobile-menu");
  const mobileNavMenu = document.getElementById("mobile-nav-menu");

  if (btnMobileMenu && mobileNavMenu) {
    btnMobileMenu.addEventListener("click", () => {
      mobileNavMenu.classList.toggle("hidden");
    });

    // Close mobile menu on clicking any link
    mobileNavMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mobileNavMenu.classList.add("hidden");
      });
    });
  }
});
