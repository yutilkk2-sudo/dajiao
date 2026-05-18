// 添加页面交互效果
document.addEventListener("DOMContentLoaded", function () {
  const downloadButtons = document.querySelectorAll(
    ".download-btn, .main-download-btn"
  );

  downloadButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      // 添加点击反馈动画
      this.style.transform = "scale(0.95)";
      setTimeout(() => {
        this.style.transform = "";
        // lds_download();
      }, 150);
    });
  });
});
