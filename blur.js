async function loadModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri(
    chrome.runtime.getURL('models/tiny_face_detector')
  );
}

function blurImage(img) {
  img.style.filter = "blur(20px)";
  img.style.opacity = "0.6";
  img.style.transition = "0.3s";
}

async function checkImage(img) {
  try {
    // تحقق من أن الصورة مكتملة ولها أبعاد صالحة
    if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) return;

    img.crossOrigin = "anonymous";

    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 128,      // أسرع وأخف على المعالج
      scoreThreshold: 0.4   // يلتقط المزيد من الوجوه
    });

    const det = await faceapi.detectSingleFace(img, options);

    if (det) blurImage(img);
  } catch (err) {
    console.warn("Failed:", err);
  }
}

async function start() {
  await loadModels();

  // فحص الصور الحالية
  document.querySelectorAll("img").forEach(checkImage);

  // مراقبة الصور الجديدة فقط
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.tagName === "IMG") checkImage(node);
        else if (node.querySelectorAll) {
          node.querySelectorAll("img").forEach(checkImage);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

start();
