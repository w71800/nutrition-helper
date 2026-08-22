export type ToolStatus = "ready" | "soon";

export type ToolDefinition = {
  id: string;
  title: string;
  description: string;
  route: string;
  status: ToolStatus;
};

export const tools: ToolDefinition[] = [
  {
    id: "pes",
    title: "PES 診斷文本",
    description: "依序選擇問題、病因與徵象，產生可複製的 PES 診斷文本。",
    route: "/tools/pes",
    status: "ready",
  },
];
