document.addEventListener("DOMContentLoaded", () => {
  const soundSections = document.querySelectorAll(".sound-section");

  let currentAudio = null;
  let currentButton = null;

  soundSections.forEach((section) => {
    const audioPath = section.dataset.audio;
    const playButton = section.querySelector(".play-button");

    // CORRECCIÓN 1: Clases ajustadas al HTML real (.progress y .volume)
    const progressBar = section.querySelector(".progress");
    const volumeSlider = section.querySelector(".volume");

    // CORRECCIÓN 2: Tu HTML usa una sola etiqueta con clase ".time" para ambos textos (0:00 / 0:00)
    const timeText = section.querySelector(".time");

    const audio = new Audio(audioPath);
    audio.preload = "metadata";

    function formatTime(seconds) {
      if (!Number.isFinite(seconds)) return "0:00";
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    // Función auxiliar para actualizar el único texto de tiempo que tienes
    function updateTimeDisplay() {
      if (timeText) {
        const current = formatTime(audio.currentTime);
        const duration = formatTime(audio.duration);
        timeText.textContent = `${current} / ${duration}`;
      }
    }

    playButton.addEventListener("click", async () => {
      if (currentAudio && currentAudio !== audio) {
        currentAudio.pause();
        if (currentButton) {
          currentButton.textContent = "▶"; // Ajustado al diseño minimalista de tu HTML
        }
      }

      if (audio.paused) {
        try {
          await audio.play();
          currentAudio = audio;
          currentButton = playButton;
          playButton.textContent = "⏸";
        } catch (error) {
          console.error("No se pudo reproducir el sonido:", error);
          playButton.textContent = "⚠";
        }
      } else {
        audio.pause();
        playButton.textContent = "▶";
      }
    });

    audio.addEventListener("loadedmetadata", () => {
      updateTimeDisplay();
    });

    audio.addEventListener("timeupdate", () => {
      updateTimeDisplay();
      if (
        progressBar &&
        Number.isFinite(audio.duration) &&
        audio.duration > 0
      ) {
        progressBar.value = (audio.currentTime / audio.duration) * 100;
      }
    });

    if (progressBar) {
      progressBar.addEventListener("input", () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          audio.currentTime = (progressBar.value / 100) * audio.duration;
        }
      });
    }

    if (volumeSlider) {
      // Sincronizar volumen inicial del audio con el valor por defecto del HTML (0.07 para el lobo, etc.)
      audio.volume = Number(volumeSlider.value);

      volumeSlider.addEventListener("input", () => {
        audio.volume = Number(volumeSlider.value);
      });
    }

    audio.addEventListener("ended", () => {
      playButton.textContent = "▶";
      if (progressBar) progressBar.value = 0;
      updateTimeDisplay();

      if (currentAudio === audio) {
        currentAudio = null;
        currentButton = null;
      }
    });

    audio.addEventListener("error", () => {
      console.error(`No se pudo cargar el archivo de sonido: ${audioPath}`);
      playButton.textContent = "⚠";
    });
  });
});
