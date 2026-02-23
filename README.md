# LuminaGen

LuminaGen is a modern, premium AI Image Generator web application built with React and Vite. It uniquely combines local Large Language Models (LLMs) via Ollama with standard image generation APIs (like AUTOMATIC1111's Stable Diffusion WebUI) to provide an end-to-end local generative AI experience.

The app features a stunning glassmorphism design system, dark mode aesthetics, and micro-interactions that make generating AI art both powerful and beautifully seamless.

![LuminaGen UI Preview]

## Core Features

- 🧠 **Ollama Prompt Engineering:** Connects to your local Ollama instance to enhance simple concepts. It uses prompt engineering instructions hidden in the background to instruct models to add lighting, style, composition, and artistic flair to your otherwise simple ideas.
- 🎨 **Local Image Generation:** Sends the enriched prompts directly to a local Stable Diffusion server (or any compatible `txt2img` API) to generate and preview artwork.
- ⚡ **Real-Time Status:** Live connection indicators for Ollama and dynamic loading skeleton animations while your image renders.
- ✨ **Premium Design:** Built with Vanilla CSS utilizing CSS variables, glassmorphism, background gradients, and modern font stacks for a truly premium feel.

## Prerequisites

To get the full local experience, you will need two pieces of software running on your machine:

1. **[Ollama](https://ollama.ai/)**
   - Download and install Ollama.
   - Pull at least one model (e.g., `ollama run llama3` or `ollama run mistral`).
   - Leave it running in the background.

2. **Image Generation API (e.g., [AUTOMATIC1111 Stable Diffusion WebUI](https://github.com/AUTOMATIC1111/stable-diffusion-webui))**
   - Install Stable Diffusion WebUI.
   - **Crucial Step:** You must enable the API and allow CORS so the React app can communicate with it.
   - Edit your `webui-user.bat` (Windows) or `webui-user.sh` (Mac/Linux) to include:
     ```bash
     set COMMANDLINE_ARGS=--api --cors-allow-origins=http://localhost:5173
     ```
   - Run the WebUI. It will be available at `http://127.0.0.1:7860`.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/amitworx/image-generation-local-llms.git
   cd image-generation-local-llms
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Vanilla CSS (Custom Design System, Glassmorphism)
- **Icons:** Lucide React
- **APIs:** Ollama REST API, Stable Diffusion API

## Usage Guide

1. **Configure Endpoints:** Open the Settings sidebar and ensure the URLs match your local servers.
   - *Ollama default:* `http://localhost:11434`
   - *Stable Diffusion default:* `http://127.0.0.1:7860`
2. **Select LLM:** Choose the model you downloaded via Ollama from the dropdown.
3. **Enhance:** Type a basic idea like "a cat on a spaceship" and click **Enhance Prompt (Ollama)**. The LLM will expand it into a detailed prompt.
4. **Generate:** Click **Generate Artwork**. The app will wait for the image generator backend to return the final image and render it in the canvas.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
