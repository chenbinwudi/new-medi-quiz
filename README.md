# 医考通小程序 MVP

微信原生小程序 MVP，包含首页、题库、章节练习、错题本、收藏、学习报告、资料、资料详情和我的页面。

## 配置

- AppID: `wxe7fec94bbc002874`
- CloudBase envId: `cloudbase-d0g4yo1qac1bbd1db`

## 运行

1. 使用微信开发者工具打开本仓库。
2. 确认小程序目录为 `miniprogram/`。
3. 确认云函数目录为 `cloudfunctions/`。
4. 在云开发控制台创建集合：`users`、`answer_records`、`wrong_questions`、`favorites`、`notes`、`study_summary`。
5. 上传并部署 `cloudfunctions/` 下的云函数。

## 首版限制

- 题库和资料使用本地数据模块。
- 会员中心仅展示，不接支付。
- 资料阅读功能显示建设中提示。
