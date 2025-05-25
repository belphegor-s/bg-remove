const upload = document.getElementById("upload");
const btn = document.getElementById("btn");
const outputImg = document.getElementById("outputImg");
const downloadBtn = document.getElementById("downloadBtn");

upload.addEventListener("change", () => {
    btn.disabled = !upload.files.length;
    outputImg.style.display = "none";
    downloadBtn.classList.add("hidden");
    btn.textContent = "Remove Background";
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

        downloadBtn.classList.remove("hidden");
        downloadBtn.onclick = () => {
            const a = document.createElement("a");
            a.href = url;
            a.download = "background_removed.png";
            a.click();
        };
    } catch (err) {
        alert("An error occurred");
    } finally {
        btn.disabled = false;
        btn.textContent = "Remove Background";
    }
};
