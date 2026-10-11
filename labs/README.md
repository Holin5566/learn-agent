# 前三章累積實驗

需要 Node.js 18 以上。不安裝套件、不連網、不使用 API key。

在本資料夾執行：

```sh
node run.mjs
```

預期輸出：

```text
01 completed / actions=1；零額度：budget_exhausted
02 completed / observations=1；非法驗收事件：拒絕
03 attempts=3 / actions=1；invalid 首次停止；同 key=1 則，新 key=2 則
所有累積範例驗收通過。
```

1. `01-agent-loop.mjs` 建立固定模型、假讀檔、驗收與有界循環。
2. `02-agent-state.mjs` 匯入第一章模型與工具，把資料轉移集中到 reducer。為降低初次執行負擔，只保留成功及額度路徑；HTML 的等待與失敗轉移是延伸。
3. `03-tool-retry.mjs` 匯入第二章 runState，替換 execute，觀察三次讀取嘗試只產生一次邏輯行動。留言去重是另一個假服務，不假裝已接入讀取圖。

檔案使用 JavaScript ES modules，方便無依賴直接執行；HTML 用 TypeScript 展示型別。這三個實驗的介面有意精簡，並非完整複製每段教材程式。

先改零額度，再改 temporary 為 invalid，最後讓每次重送使用不同 opId。先預測結果，再執行核對。

第四章起改用 SDK。請依 HTML 安裝說明及官方 starter 建立獨立 Node 專案；此資料夾尚未提供完整 LangGraph／Temporal adapter，也未宣稱驗證跨程序恢復。
