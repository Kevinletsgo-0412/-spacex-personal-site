# SpaceX 电影级加载页 → 3D 地球过渡

基于 React + Vite + Three.js + GSAP 的加载页与首屏 3D 运镜效果。

## 技术栈

- React 18、Vite、TypeScript
- @react-three/fiber、@react-three/drei（3D 地球）
- GSAP（全局时间轴动画）
- Tailwind CSS
- Space Grotesk 字体

## 资源

- **Logo**：`public/spacex-svgrepo-com.svg`（已包含）
- **地球模型**：将 `3D建模&Logo/earth.glb` 复制到 `public/earth.glb` 后，会自动使用 GLB 模型；未放置时使用蓝色球体占位

## 动画时间轴

| 阶段 | 时间 | 内容 |
|------|------|------|
| Phase 1 | 0–5s | 深灰遮罩 + 白色 X 描边顺时针绕轮廓 6 圈（power3.inOut） |
| Phase 2 | 5–6s | X 放大并淡出，遮罩淡出，露出 3D 场景 |
| Phase 3 | 6–7.5s | 地球从远景拉近、下移，占屏下约 70%，持续慢速自转 |
| Phase 4 | 7.5–9s | 名言淡入 |

## 运行

```bash
npm install
npm run dev
```

浏览器打开本地地址即可查看效果。

## 构建

```bash
npm run build
npm run preview
```
