# MuscleXA - Premium Nutrition Supplement Website

A highly responsive, clean, and interactive single-product brand e-commerce storefront for **MuscleXA Supplements**, showcasing Whey Protein Isolate (WPI-90) and Whey Concentrate (WPC-80).

This project is built using standard, lightweight static web technologies, making it extremely fast, portable, and natively compatible with **GitHub Pages** without any build compilation step required.

---

## ⚡️ Key Features

- **Dynamic Shop Configurator**: Interactive selections for protein formulas, bag/jar packaging, sizes (2 LBS / 5 LBS), and flavors. Price calculations and details update in real-time.
- **Dynamic FDA Supplement facts label**: Displays complete nutritional breakdown panels that update depending on the selected formula choice.
- **Dietary Protein & BMI Calculator**: Helps fitness users enter their weight, height, activity, and targets to calculate daily target protein requirements and custom scoop recommendations.
- **Sliding Shopping Cart Drawer**: Memory-persisted cart allowing users to edit counts, track free shipping targets, and checkout.
- **Three.js WebGL space background**: Moving crimson space fog particles and slow-spinning lunar rendering with mouse parallax movement.
- **SEO & Social tags**: Configured metadata, meta description tags, sitemaps, robots rules, and keywords file.

---

## 📁 File Structure

```txt
├── assets/
│   └── images/
│       └── musclexa_products.png  # original supplement image stack
├── .gitignore
├── README.md
├── about.html                     # brand values and science guide
├── index.html                     # main home page storefront
├── keywords.md                    # search engine optimization keywords
├── robots.txt                     # crawler guidelines
├── script.js                      # Three.js background, configurator & calculator logic
├── sitemap.xml                    # website crawl mapping
└── styles.css                     # scroll styling, marquees & custom animations
```

---

## 🚀 How to Host on GitHub Pages

1. **Create Repository**: Create a new repository on GitHub (e.g. `musclexa-store`).
2. **Push files**: Push all files in this directory to your repository's `main` branch.
3. **Turn on Pages**:
   - Go to your repository settings on GitHub.
   - Click **Pages** in the left menu.
   - Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
   - Select the `main` branch and `/ (root)` folder, then click **Save**.
4. **Live URL**: Within 1-2 minutes, GitHub will publish your page and generate your live link!
