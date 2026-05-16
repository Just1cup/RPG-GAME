export interface Choice {
  label: string;
  value: string;
}

export function showChoiceModal(title: string, choices: Choice[]): Promise<string> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 bg-black/70 flex items-center justify-center z-50";
    overlay.innerHTML = `
      <div class="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 border border-gray-600">
        <h3 class="text-lg font-semibold mb-4">${title}</h3>
        <div class="space-y-2">
          ${choices
            .map(
              (choice) => `
                <button data-value="${choice.value}" class="w-full py-2 px-4 rounded bg-gray-700 hover:bg-gray-600 transition-colors">
                  ${choice.label}
                </button>
              `,
            )
            .join("")}
        </div>
      </div>
    `;

    overlay.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-value]");

      if (!button?.dataset.value) {
        return;
      }

      overlay.remove();
      resolve(button.dataset.value);
    });

    document.body.appendChild(overlay);
  });
}

