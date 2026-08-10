var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var syncDatabase = {};
app.post("/api/sync/save", (req, res) => {
  const { syncCode, settings, progress } = req.body;
  if (!syncCode) {
    return res.status(400).json({ error: "Sync code is required" });
  }
  syncDatabase[syncCode] = {
    settings,
    progress,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  res.json({
    success: true,
    message: `\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A\u0629 \u0628\u0646\u062C\u0627\u062D \u0628\u0627\u0644\u0631\u0645\u0632 ${syncCode}`,
    updatedAt: syncDatabase[syncCode].updatedAt
  });
});
app.get("/api/sync/load/:syncCode", (req, res) => {
  const { syncCode } = req.params;
  const found = syncDatabase[syncCode];
  if (!found) {
    return res.status(404).json({ error: "\u0631\u0645\u0632 \u0627\u0644\u0645\u0632\u0627\u0645\u0646\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0628\u064A\u0627\u0646\u0627\u062A" });
  }
  res.json({
    success: true,
    settings: found.settings,
    progress: found.progress,
    updatedAt: found.updatedAt
  });
});
app.post("/api/gemini/reflect", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "\u0645\u0641\u062A\u0627\u062D Gemini API \u063A\u064A\u0631 \u0645\u0647\u064A\u0623. \u064A\u0631\u062C\u0649 \u0625\u0636\u0627\u0641\u062A\u0647 \u0641\u064A \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A."
      });
    }
    const { prompt, contextType } = req.body;
    const ai = new import_genai.GoogleGenAI({ apiKey });
    const systemInstruction = `\u0623\u0646\u062A \u0645\u0633\u0627\u0639\u062F \u0625\u0633\u0644\u0627\u0645\u064A \u0648\u0645\u0648\u062C\u0647 \u0631\u0648\u062D\u064A \u062D\u0643\u064A\u0645 \u0648\u0644\u0637\u064A\u0641 \u0648\u0646\u0627\u0635\u062D \u0628\u0627\u0644\u0623\u062E\u0644\u0627\u0642 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629 \u0627\u0644\u0639\u0627\u0644\u064A\u0629 \u0641\u064A \u062A\u0637\u0628\u064A\u0642 "\u0646\u0648\u0631 \u0627\u0644\u0647\u062F\u0649".
    \u0623\u062C\u0628 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649 \u0627\u0644\u0633\u0644\u0633\u0629 \u0648\u0627\u0644\u0645\u0631\u064A\u062D\u0629 \u0645\u0639 \u0627\u0644\u0627\u0633\u062A\u0634\u0647\u0627\u062F \u0628\u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645 \u0648\u0627\u0644\u0633\u0646\u0629 \u0627\u0644\u0646\u0628\u0648\u064A\u0629 \u0628\u0623\u0633\u0644\u0648\u0628 \u0645\u0642\u062A\u0636\u0628 \u0648\u0645\u0644\u0647\u0645 \u0648\u0645\u0637\u0645\u0626\u0646 \u0644\u0644\u0642\u0644\u0628.
    \u0625\u0630\u0627 \u0637\u0644\u0628\u062A \u0646\u0635\u064A\u062D\u0629 \u0623\u0648 \u062F\u0639\u0627\u0621 \u0623\u0648 \u0634\u0631\u062D \u0622\u064A\u0629\u060C \u0642\u062F\u0651\u0645 \u0625\u062C\u0627\u0628\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0628\u062C\u0645\u0627\u0644 \u0627\u0644\u0623\u0633\u0644\u0648\u0628 \u0648\u0646\u0642\u0627\u0621 \u0627\u0644\u0642\u0648\u0644 \u062F\u0648\u0646 \u0625\u0637\u0627\u0644\u0629 \u0645\u0641\u0631\u0637\u0629.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });
    res.json({
      success: true,
      text: response.text
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({
      error: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A: " + (error.message || "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641")
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
