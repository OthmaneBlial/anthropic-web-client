import { Message, AnthropicApiRequest } from "./types";

describe("types", () => {
  test("Message type is correctly defined", () => {
    const userMessage: Message = {
      role: "user",
      content: "Hello",
    };
    expect(userMessage.role).toBe("user");
    expect(userMessage.content).toBe("Hello");

    const assistantMessage: Message = {
      role: "assistant",
      content: "Hi there",
    };
    expect(assistantMessage.role).toBe("assistant");
    expect(assistantMessage.content).toBe("Hi there");
  });

  test("AnthropicApiRequest type is correctly defined", () => {
    const request: AnthropicApiRequest = {
      apiKey: "test-api-key",
      model: "claude-3-haiku-20240307",
      max_tokens: 100,
      temperature: 0.7,
      messages: [{ role: "user", content: "Hello" }],
    };
    expect(request.apiKey).toBe("test-api-key");
    expect(request.model).toBe("claude-3-haiku-20240307");
    expect(request.max_tokens).toBe(100);
    expect(request.temperature).toBe(0.7);
    expect(request.messages).toHaveLength(1);
    expect(request.messages[0].role).toBe("user");
    expect(request.messages[0].content).toBe("Hello");
  });
});
