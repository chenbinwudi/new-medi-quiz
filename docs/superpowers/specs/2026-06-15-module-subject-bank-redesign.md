# 医考通首页模块与题库学科重构设计

## 背景

当前小程序首页和题库页主要按现有分类直接展示练习入口。新的验收目标是先让用户在首页选择一级模块，再让题库页按所选一级模块展示二级学科。二级学科需要展示做题进度和正确率，点击后进入对应练习。

## 目标

- 首页展示 6 个一级模块：
  - 医学人文综合
  - 基础医学综合
  - 预防医学综合
  - 临床医学综合
  - 中医学基础
  - 实践综合
- 首页点击一级模块后只切换高亮和摘要，不立即跳转。
- 首页提供明确入口进入题库，跳转时携带当前一级模块。
- 题库页根据当前一级模块展示二级学科列表。
- 每个二级学科展示：
  - 学科名称
  - 题目总数
  - 已做题数
  - 做题进度百分比
  - 正确率
  - 最近状态文案，例如“开始练习”或“继续练习”
- 点击二级学科进入刷题页，并保留现有上一题回显、收藏、答题记录逻辑。

## 非目标

- 不在本轮接入后台管理学科配置。
- 不重写云数据库结构。
- 不改变现有 tabBar 路由。
- 不重做刷题核心判题逻辑。
- 不引入大型依赖。

## 推荐方案

采用“前端配置 + 云端兼容字段”的方案。

新增前端模块树配置文件，例如 `miniprogram/data/module-tree.js`，作为当前阶段的单一页面配置来源。该文件维护一级模块、二级学科、默认练习分类、展示图标和排序。

同时在页面跳转参数和数据映射中保留 `primaryId`、`subjectId`、`categoryId`。当前阶段可以继续使用已有 `categoryId` 取题；后续云数据库可平滑增加 `primaryId` 和 `subjectId` 字段。

## 数据模型

`module-tree.js` 建议结构：

```js
const primaryModules = [
  {
    primaryId: 'humanity',
    title: '医学人文综合',
    subtitle: '法规、伦理、心理与沟通',
    icon: '/assets/icons/book.svg',
    color: 'purple',
    categoryId: 'humanity',
    subjects: [
      {
        subjectId: 'medical-ethics',
        title: '医学伦理学',
        categoryId: 'humanity',
        total: 40
      }
    ]
  }
];
```

一级模块初始示例：

| primaryId | 一级模块 | 默认 categoryId |
|---|---|---|
| humanity | 医学人文综合 | humanity |
| basic | 基础医学综合 | basic |
| preventive | 预防医学综合 | preventive |
| clinical | 临床医学综合 | clinical |
| tcm-basic | 中医学基础 | tcm-basic |
| practice | 实践综合 | clinical |

二级学科先使用示例数据占位。后续用户提供真实清单后，只替换 `module-tree.js` 或迁移到云数据库。

## 进度与正确率

二级学科进度来自本地/云端学习记录聚合，字段设计如下：

- `total`: 学科题目总数。
- `done`: 已完成题数，按该学科下已答题目去重统计。
- `progress`: `done / total` 的百分比，四舍五入。
- `correct`: 答对题数。
- `accuracy`: `correct / done` 的百分比；没有做题时显示 `0%`。

当前阶段如果云端返回记录不足，使用本地 guest 学习记录和示例数据兜底：

- 有答题记录时按 `subjectId` 或 `categoryId` 聚合。
- 没有记录时显示 `0 / total` 和 `0%`。
- 旧题目没有 `subjectId` 时，按其 `categoryId` 归入对应一级模块默认学科。

## 首页设计

首页新增“选择备考模块”区域，替代或上移现有考试选择区域下方的主要功能展示。

交互：

1. 默认选择上次保存的 `selectedPrimaryId`。
2. 没有保存值时默认选择 `clinical`。
3. 点击模块卡片：
   - 更新当前高亮。
   - 更新摘要卡片。
   - 保存到本地缓存。
4. 点击“进入题库”：
   - 跳转 `/pages/bank/bank?primaryId=<selectedPrimaryId>&tab=chapter`。

首页模块卡片展示：

- 模块名称
- 简短说明
- 进度摘要
- 图标和色彩区分

## 题库页设计

题库页顶部显示当前一级模块，并提供一级模块切换入口。

`章节练习` tab 语义改为“二级学科列表”，但 tab 文案可以继续叫“章节练习”，以减少用户认知变化。

每个二级学科卡片展示：

- 左侧图标或加号
- 学科名称
- 已做题数 / 总题数
- 正确率
- 进度条
- 状态文案

点击二级学科跳转：

```text
/pages/practice/practice?source=chapter&primaryId=<primaryId>&subjectId=<subjectId>&categoryId=<categoryId>
```

真题、模拟、速记 tab 暂时按当前一级模块过滤；如果暂无精确数据，则展示该一级模块相关的示例数据。

## 刷题页兼容

刷题页读取参数优先级：

1. `subjectId`
2. `categoryId`
3. 默认 `clinical`

当前题库数据没有真实 `subjectId` 时，使用 `categoryId` 拉取题目。后续题目数据补充 `subjectId` 后，刷题页无需改路由。

保留：

- 答题选项 selected/correct/wrong 状态。
- 上一题回显。
- 收藏。
- 笔记。
- 答题记录同步。

## 状态与兜底

页面必须保留现有 UI 状态能力：

- skeleton
- empty
- error + retry
- loadingMore / noMore
- 卡片 active 反馈
- 按钮 loading / disabled

模块树为空时：

- 首页显示错误卡片或空态。
- 题库页显示“暂无学科配置”空态。

请求学习进度失败时：

- 页面仍展示模块和学科。
- 进度和正确率显示 0。
- 顶部或卡片区域显示轻量错误提示，可重新加载。

## 验收标准

- 首页能看到 6 个一级模块。
- 点击一级模块后高亮切换，不自动跳转。
- 点击“进入题库”后，题库页展示对应一级模块标题。
- 题库页展示该模块下的二级学科。
- 每个二级学科都有做题进度和正确率。
- 点击二级学科可以进入刷题页。
- 刷题页答题后返回上一题能回显已选和解析状态。
- 切换一级模块后，题库二级学科列表随之变化。
- 所有相关页面无白屏、无 WXML 编译错误、无缺失组件错误。

## 验证计划

实现完成后运行：

```text
node scripts/check-miniapp-ui.cjs
node scripts/check-page-routes.cjs
node scripts/check-mvp-flow.cjs
node scripts/check-production-flow.cjs
node scripts/check-practice-history.cjs
```

如新增模块树检查脚本，则增加：

```text
node scripts/check-module-tree.cjs
```
