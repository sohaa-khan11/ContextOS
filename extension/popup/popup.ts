document.addEventListener('DOMContentLoaded', () => {
  const captureBtn = document.getElementById('capture-btn');
  const copyBtn = document.getElementById('copy-btn');
  const toast = document.getElementById('lifecycle-toast');

  const showToast = (message: string) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  };

  if (captureBtn) {
    captureBtn.addEventListener('click', () => {
      // TODO: implement capture logic
      showToast('remember(): 2 decisions added');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      // TODO: implement copy logic
      showToast('Copied to clipboard!');
    });
  }
});
