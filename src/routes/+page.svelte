<script lang="ts">
  import "@fontsource/inter/400.css";
  import "@fontsource/inter/500.css";
  import "@fontsource/inter/600.css";
  import "@fontsource/inter/700.css";
  import "@fontsource/anton";

  import { onMount } from "svelte";
  import GIF from "gif.js";

  let text = $state("");
  let canvas: HTMLCanvasElement;
  let image: HTMLImageElement | undefined;
  let ready = $state(false);

  onMount(() => {
    image = new Image();

    image.onload = async () => {
      await document.fonts.load("400 48px Anton");

      if (!canvas || !image) return;

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(image, 0, 0);
      ready = true;
    };

    image.onerror = () => {
      console.error("Failed to load /megumi.png");
    };

    image.src = "/megumi.png";
  });

  function renderPotential() {
    if (!canvas || !image || !ready) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Reset the image before drawing
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0);

    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length === 0) return;

    const lastLine = lines.length - 1;

    const smallSize = height * 0.075;
    const largeSize = height * 0.14;

    const leftPadding = width * 0.055;
    const maxWidth = width * 0.88;
    const lineSpacing = height * 0.015;

    // The text in the memes i saw had wider text so account for that
    const textScaleX = 1.4;

    const renderedLines = lines.map((line, index) => {
      const isLast = index === lastLine;
      const baseSize = isLast ? largeSize : smallSize;

      ctx.font = `400 ${baseSize}px Anton`;

      const measuredWidth = ctx.measureText(line).width;
      const availableWidth = maxWidth / textScaleX;

      const fontSize =
        measuredWidth > availableWidth
          ? baseSize * (availableWidth / measuredWidth)
          : baseSize;

      return {
        text: line.trim(),
        fontSize,
      };
    });

    const totalHeight =
      renderedLines.reduce(
        (sum, line) => sum + line.fontSize + lineSpacing,
        0,
      ) - lineSpacing;

    // Text on the left, vertically centered
    let y = height - totalHeight - height * 0.06;

    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.lineJoin = "round";

    for (const line of renderedLines) {
      ctx.font = `400 ${line.fontSize}px Anton`;

      ctx.save();

      // Scale around the left edge so text stays on the left
      ctx.translate(leftPadding, 0);
      ctx.scale(textScaleX, 1);

      // Dark outline
      ctx.shadowBlur = 0;
      ctx.lineWidth = line.fontSize * 0.09;
      ctx.strokeStyle = "#07152f";
      ctx.strokeText(line.text, 0, y);

      // Outer glow
      ctx.shadowColor = "#174999";
      ctx.shadowBlur = line.fontSize * 0.9;
      ctx.fillStyle = "#174999";
      ctx.fillText(line.text, 0, y);

      // Inner glow
      ctx.shadowColor = "#174999";
      ctx.shadowBlur = line.fontSize * 0.45;
      ctx.fillText(line.text, 0, y);

      // White -> Blue gradient
      ctx.shadowColor = "#258bff";
      ctx.shadowBlur = line.fontSize * 0.22;

      const gradient = ctx.createLinearGradient(0, y, 0, y + line.fontSize);

      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(0.25, "#e8f5ff");
      gradient.addColorStop(0.6, "#8acbff");
      gradient.addColorStop(1, "#2585ff");

      ctx.fillStyle = gradient;
      ctx.fillText(line.text, 0, y);

      ctx.restore();

      y += line.fontSize + lineSpacing;
    }
  }

  function downloadPotential() {
    if (!canvas || !ready) return;

    const link = document.createElement("a");
    link.download = "megumi-potential.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function copyPotential() {
    if (!canvas || !ready) return;

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas!.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error("Failed to create image"));
        }, "image/png");
      });

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
    } catch (error) {
      console.error("crap", error);
      alert("couldnt copy :(\ntry downloading it");
    }
  }

  function downloadGif() {
    if (!canvas || !ready) return;

    // DONT REMOVE gif.worker.js FROM STATIC OR THIS BREAKS
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: canvas.width,
      height: canvas.height,
      workerScript: "/gif.worker.js",
    });

    // Repeat the frames so it doesnt glitch
    for (let i = 0; i < 10; i++) {
      gif.addFrame(canvas, { copy: true, delay: 100 });
    }

    gif.on("finished", (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.download = "megumi-potential.gif";
      link.href = url;
      link.click();

      URL.revokeObjectURL(url);
    });

    gif.render();
  }
</script>

<svelte:head>
  <title>POTENTIALLIFIER 9000</title>
</svelte:head>

<header>
  <h1>POTENTIALLIFIER 9000</h1>
</header>

<main>
  <div class="image-panel">
    <canvas bind:this={canvas} aria-label="Megumi meme preview"></canvas>
  </div>

  <div class="editor-panel">
    <textarea
      bind:value={text}
      placeholder="DID YOU SAY
POTENTIAL"
      aria-label="Potential text"></textarea>

    <div class="buttons">
      <button
        class="update"
        type="button"
        onclick={renderPotential}
        disabled={!ready}
      >
        Update
      </button>

      <button
        class="download"
        type="button"
        onclick={copyPotential}
        disabled={!ready}
      >
        Copy
      </button>

      <button
        class="download"
        type="button"
        onclick={downloadPotential}
        disabled={!ready}
      >
        Download
      </button>

      <button
        class="download"
        type="button"
        onclick={downloadGif}
        disabled={!ready}
      >
        Download GIF
      </button>
    </div>
  </div>
</main>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    min-height: 100vh;
    background: #10131d;
    color: #f1f3fa;
    font-family: "Inter", sans-serif;
    font-weight: 400;
  }

  header {
    padding: 32px 20px 8px;
    text-align: center;
  }

  h1 {
    margin: 0;
    font-family: "Inter", sans-serif;
    font-size: clamp(36px, 4.5vw, 44px);
    font-weight: 700;
    letter-spacing: -1px;
  }

  main {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
    gap: 24px;
    width: min(1500px, 94%);
    margin: 32px auto 60px;
    align-items: start;
  }

  .image-panel,
  .editor-panel {
    min-width: 0;
    padding: 20px;
    border: 2px solid #424b63;
    border-radius: 0;
    background: #171b29;
  }

  canvas {
    display: block;
    width: 100%;
    height: auto;
  }

  .editor-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  textarea {
    width: 100%;
    min-height: 240px;
    padding: 16px;
    resize: vertical;
    border: 2px solid #424b63;
    border-radius: 0;
    outline: none;
    background: #10131d;
    color: white;
    font: inherit;
    font-size: 18px;
    line-height: 1.6;
  }

  textarea:focus {
    border-color: #7187b8;
  }

  textarea::placeholder {
    color: #858ba0;
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  button {
    flex: 1;
    padding: 14px 12px;
    border: 2px solid #424b63;
    border-radius: 0;
    cursor: pointer;
    font: inherit;
    font-size: 16px;
    font-weight: 600;
    transition:
      background 150ms ease,
      border-color 150ms ease;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .update {
    background: #293c68;
    color: white;
    border-color: #566b99;
  }

  .update:hover:not(:disabled) {
    background: #344a7a;
    border-color: #7187b8;
  }

  .download {
    background: #1c2233;
    color: white;
  }

  .download:hover:not(:disabled) {
    background: #252d42;
    border-color: #7187b8;
  }

  @media (max-width: 650px) {
    header {
      padding-top: 24px;
    }

    main {
      grid-template-columns: 1fr;
      width: 92%;
      margin-top: 24px;
    }
  }
</style>
