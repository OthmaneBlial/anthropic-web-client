import "@testing-library/jest-dom";

jest.mock("./utils", () => ({
  getStoredValue: jest.fn((key) => {
    if (key === "selectedModel") return "claude-3-haiku-20240307";
    return "20";
  }),
  setStoredValue: jest.fn(),
  createMessageElement: jest.fn(),
  sendMessageToApi: jest.fn(),
  prepareMessages: jest.fn(),
}));

// Mock CSS imports
jest.mock("./styles.css", () => ({}));
jest.mock("highlight.js/styles/github.css", () => ({}));

describe("index.ts", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="maxHistoryLength" value="20" />
      <select id="modelSelect">
        <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
        <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
      </select>
      <button id="clearConversation">Clear Conversation</button>
      <form id="promptForm">
        <textarea id="prompt"></textarea>
        <button id="prompt-button" type="submit">Send</button>
      </form>
      <div id="chatContainer"></div>
      <div id="sidebar"></div>
      <div id="mainContent"></div>
      <input id="apiKey" />
      <input id="temperature" value="0.7" />
      <input id="maxTokens" value="1000" />
      <div id="loadingIndicator" class="hidden"></div>
    `;

    jest.resetModules();

    require("./index");
  });

  test("DOM elements are correctly initialized", () => {
    const maxHistoryLength = document.getElementById(
      "maxHistoryLength"
    ) as HTMLInputElement;
    const modelSelect = document.getElementById(
      "modelSelect"
    ) as HTMLSelectElement;

    expect(maxHistoryLength).toHaveValue("20");
    expect(modelSelect.value).toBe("claude-3-haiku-20240307");
    expect(document.getElementById("clearConversation")).toBeInTheDocument();
    expect(document.getElementById("promptForm")).toBeInTheDocument();
    expect(document.getElementById("chatContainer")).toBeInTheDocument();
    expect(document.getElementById("apiKey")).toBeInTheDocument();
  });

  test("Clear conversation button clears chat container", () => {
    const chatContainer = document.getElementById("chatContainer");
    if (chatContainer) {
      chatContainer.innerHTML = "<div>Test message</div>";
    }
    const clearButton = document.getElementById("clearConversation");
    clearButton?.click();
    expect(document.getElementById("chatContainer")?.innerHTML).toBe("");
  });
});
