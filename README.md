# 🧵 Textilia - Gestión de Obras

<div align="center">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75C2?style=for-the-badge&logo=google-gemini&logoColor=white" />
</div>

---

**Textilia** es una plataforma profesional diseñada para la **gestión integral de obras textiles** (cortinajes, confección y mediciones). Optimiza el flujo de trabajo desde la toma de medidas en obra hasta la generación de cuadrantes de corte y presupuestos finales.

## ✨ Características Principales

- 📐 **Mediciones Técnicas**: Registro detallado de huecos, alturas y fruncidos.
- 📋 **Relación de Habitaciones**: Vista tabular interactiva para la gestión de múltiples estancias.
- ✂️ **Cuadrante de Corte**: Algoritmo inteligente para optimizar el uso de tela y metros necesarios.
- 📊 **Resumen de Obra**: Panel KPI con márgenes de beneficio, costes de tela y confección.
- 📄 **Exportación PDF**: Generación de informes profesionales para clientes y talleres.
- 🤖 **Asistente AI**: Integración con Google Gemini para asistencia en cálculos y optimización.

## 🚀 Tecnologías Utilizadas

*   **Frontend**: React + TypeScript + Vite.
*   **Estilos**: Tailwind CSS 4 + Modern CSS (Variables & Glassmorphism).
*   **Base de Datos**: Supabase (PostgreSQL) para sincronización en tiempo real.
*   **Almacenamiento Local**: SQLite para persistencia rápida.
*   **Iconografía**: Lucide React.
*   **Animaciones**: Framer Motion.

## 🛠️ Instalación y Configuración

### Requisitos Previos

*   [Node.js](https://nodejs.org/) (versión 18 o superior)
*   [npm](https://www.npmjs.com/)

### Pasos para el Desarrollo Local

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/NeuralStories/Textilia-.git
    cd Textilia-
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Variables de Entorno:**
    Renombra `.env.example` a `.env` y configura tus credenciales de Supabase y Gemini:
    ```env
    VITE_SUPABASE_URL=tu_url
    VITE_SUPABASE_ANON_KEY=tu_anon_key
    GEMINI_API_KEY=tu_api_key
    ```

4.  **Iniciar servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5080`.

## 📁 Estructura del Proyecto

```
Textilia-/
├── src/
│   ├── views/          # Componentes de vista (Obra, Dashboard, etc.)
│   ├── components/     # UI Reutilizable
│   ├── calculos.js     # Lógica central de confección y costes
│   ├── ui.js           # Orquestador de renderizado y estados
│   └── styles.css      # Sistema de diseño centralizado
├── public/             # Recursos estáticos
└── vite.config.ts      # Configuración del empaquetador
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">
  Hecho con ❤️ por el equipo de Textilia.
</div>
