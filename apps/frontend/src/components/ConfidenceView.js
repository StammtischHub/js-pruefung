export function createConfidenceView(confidence) {
  const percent = Math.round(confidence * 100);

  return `
    <div class="confidence">
      <div class="confidence-bar">
        <div
          class="confidence-bar-fill"
          style="width: ${percent}%"
        ></div>
      </div>

      <span>${percent} %</span>
    </div>
  `;
}
