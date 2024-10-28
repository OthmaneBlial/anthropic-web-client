import {
  getStoredValue,
  setStoredValue,
  createMessageElement,
  prepareMessages,
} from "./utils";
import { Message } from "./types";

describe("utils", () => {
  describe("getStoredValue", () => {
    it("should return the stored value if it exists", () => {
      localStorage.setItem("testKey", "testValue");
      expect(getStoredValue("testKey", "defaultValue")).toBe("testValue");
    });

    it("should return the default value if the stored value does not exist", () => {
      expect(getStoredValue("nonExistentKey", "defaultValue")).toBe(
        "defaultValue"
      );
    });
  });

  describe("setStoredValue", () => {
    it("should set the value in localStorage", () => {
      setStoredValue("testKey", "testValue");
      expect(localStorage.getItem("testKey")).toBe("testValue");
    });
  });

  describe("createMessageElement", () => {
    it("should create a message element with the correct classes and content", () => {
      const element = createMessageElement("user", "Test message");
      expect(element.className).toContain("bg-indigo-100");
      expect(element.textContent).toContain("You:");
      expect(element.textContent).toContain("Test message");
    });
  });

  describe("prepareMessages", () => {
    it("should prepare messages correctly", () => {
      const input: Message[] = [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there" },
        { role: "user", content: "How are you?" },
      ];
      const output = prepareMessages(input);
      expect(output).toEqual(input);
    });

    it("should add a placeholder assistant message between consecutive user messages", () => {
      const input: Message[] = [
        { role: "user", content: "Hello" },
        { role: "user", content: "How are you?" },
      ];
      const output = prepareMessages(input);
      expect(output).toEqual([
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Understood." },
        { role: "user", content: "How are you?" },
      ]);
    });
  });
});
