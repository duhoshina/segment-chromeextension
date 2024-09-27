const closeWidgetButton = document.getElementById("close-widget");

if (closeWidgetButton) {
  closeWidgetButton.addEventListener("click", () => {
    const existingWidget = document.getElementById("segment-tracker-widget");

    if (existingWidget) {
      existingWidget.remove();
    }
  });
}
