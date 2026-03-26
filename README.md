# App Store Product HTML Action

根据 App Store 开发者 ID 和地区码，抓取作者作品目录并输出 HTML。

## Inputs

| Name | Required | Default | Description |
| --- | --- | --- | --- |
| `developer-id` | Yes | - | App Store 开发者数字 ID，例如 `1137057742`。 |
| `country` | No | `us` | App Store 地区码，例如 `us`、`cn`、`in`。 |
| `max-items` | No | `100` | 输出的作品数量上限。 |
| `homepage-url` | No | 空 | 个人主页地址，和赞助地址一起传入时才显示顶部 `<sup>`。 |
| `sponsor-url` | No | 空 | 赞助地址，和个人主页一起传入时才显示顶部 `<sup>`。 |
| `intro-html` | No | 空 | 自定义 HTML 介绍文案，优先级高于默认顶部文案。 |

## Outputs

| Name | Description |
| --- | --- |
| `html` | 生成的 HTML 片段。 |
| `count` | 实际输出的作品数量。 |

## 输出规则

1. 只要不传 `homepage-url` 和 `sponsor-url`，生成结果就只有图标网格。
2. 同时传入 `homepage-url` 和 `sponsor-url` 时，会按示例插入顶部 `<sup>` 文案。
3. 如果传了 `intro-html`，则优先使用 `intro-html`。

## Example

```yaml
name: Generate App Store HTML

on:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - id: catalog
        uses: ./
        with:
          developer-id: '1137057742'
          country: 'in'
          max-items: '30'
      - run: echo "${{ steps.catalog.outputs.html }}"
```
