export type ToolStatus = "ready" | "soon";

type ToolBase = {
  id: string;
  title: string;
  description: string;
  status: ToolStatus;
};

export type InternalTool = ToolBase & {
  kind: "internal";
  route: string;
};

export type ExternalTool = ToolBase & {
  kind: "external";
  href: string;
};

export type ToolDefinition = InternalTool | ExternalTool;

export const CASE_VIEWER_URL =
  "https://nutrition-case-viewer.ika-studio.workers.dev";

export const tools: ToolDefinition[] = [
  {
    id: "pes",
    kind: "internal",
    title: "PES 診斷文本",
    description: "依序選擇問題、病因與徵象，產生可複製的 PES 診斷文本。",
    route: "/tools/pes",
    status: "ready",
  },
  {
    id: "case-viewer",
    kind: "external",
    title: "營養個案檢視",
    description: "另開分頁檢視營養個案資料。",
    href: CASE_VIEWER_URL,
    status: "ready",
  },
];

export function isExternalTool(tool: ToolDefinition): tool is ExternalTool {
  return tool.kind === "external";
}
