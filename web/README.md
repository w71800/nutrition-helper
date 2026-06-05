# PES 診斷選擇（MVP）

依序選擇 P → E → S，完成後可一鍵複製到剪貼簿。

## 開發

```bash
npm install
npm run dev
```

瀏覽器開啟終端機顯示的網址（通常是 http://localhost:5173）。

## 部署到 GitHub Pages

此目錄已設定 GitHub Actions（`.github/workflows/deploy-web-pages.yml`）。推送到 `main` 且變更 `web/` 時會自動建置並部署。

### 首次啟用（在 GitHub 網站操作一次）

1. 開啟 repo → **Settings** → **Pages**
2. **Build and deployment** → Source 選 **GitHub Actions**
3. 推送含 `web/` 的 commit 到 `main`，等待 workflow 完成

網址為：`https://<你的帳號>.github.io/<repo名稱>/`  
目前 remote 為 `nutrition-helper` 時，即 https://w71800.github.io/nutrition-helper/

### 本機模擬 Pages 路徑

```bash
VITE_BASE_PATH=/nutrition-helper/ npm run build
npm run preview
```

## PES 資料來源

靜態主檔依 **eNCPT / NCPT 2023 英文版** 整理，包含：

- [Freely Available NCP Terms](https://www.ncpro.org/freely-available-ncp-terms) 公開之營養診斷術語
- [2023 變更摘要表](https://www.ncpro.org/vault/2570/web/files/NCPT%202023%20Change%20Summary%20Table%20-%20ND.pdf) 之診斷名稱更新（如肌少症、食物不安全、不均衡飲食型態等）

完整 E／S 清單以訂閱 [eNCPT](https://www.ncpro.org/) 為準；本專案收錄常見教學用組合供選單輔助。

## 擴充或重建詞彙

1. 編輯 `scripts/build-pes-catalog.py` 中的診斷與 PES 連結
2. 執行 `python3 scripts/build-pes-catalog.py` 重新產生 `public/data/pes-catalog.json`
3. 重新整理頁面

## 複製格式

預設為三行：

```
P：…
E：…
S：…
```

若要調整格式，修改 `src/utils/formatPes.ts`。
