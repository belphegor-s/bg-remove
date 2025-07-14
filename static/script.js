const upload = document.getElementById("upload");
const btn = document.getElementById("btn");
const originalImg = document.getElementById("originalImg");
const outputImg = document.getElementById("outputImg");
const fileInfo = document.getElementById("fileInfo");
const preview = document.getElementById("preview");
const result = document.getElementById("result");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");

upload.addEventListener("change", () => {
    const file = upload.files[0];
    if (!file) return;

    btn.disabled = false;
    result.classList.add("hidden");
    outputImg.style.display = "none";
    downloadBtn.classList.add("hidden");

    // Show name and size
    fileInfo.classList.remove("hidden");
    fileInfo.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImg.src = e.target.result;
        preview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
});

btn.onclick = async () => {
    if (!upload.files.length) return;

    btn.disabled = true;
    btn.textContent = "Removing...";

    const formData = new FormData();
    formData.append("file", upload.files[0]);

    try {
        const response = await fetch("/remove-bg", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            alert("Background removal failed");
            return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        outputImg.src = url;
        outputImg.style.display = "block";
        result.classList.remove("hidden");

        downloadBtn.classList.remove("hidden");
        downloadBtn.onclick = () => {
            const a = document.createElement("a");
            a.href = url;
            a.download = "background_removed.png";
            a.click();
        };

        resetBtn.onclick = () => {
            upload.value = "";
            fileInfo.classList.add("hidden");
            preview.classList.add("hidden");
            result.classList.add("hidden");
            btn.disabled = true;
            btn.textContent = "Remove Background";
        };
    } catch (err) {
        alert("An error occurred");
    } finally {
        btn.disabled = false;
        btn.textContent = "Remove Background";
    }
};
