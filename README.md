# App Store Product HTML Action

Marketplace: https://github.com/marketplace/actions/app-store-product-html

<!-- APPSTORE_HTML_START -->
<div markdown="1">
  <sup>Using <a href="https://logspot.hocgin.top" target="_blank">my apps</a> is also a way to <a href="https://logspot.hocgin.top/donate/" target="_blank">support</a> me:</sup>
  <br>
  <a target="_blank" href="https://apps.apple.com/us/app/cirra-weather/id6768043307" title="Cirra Weather - Cirra Weather Weather, like a magazine"><img alt="Cirra Weather" height="52" width="52" src="https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/a9/5b/d1/a95bd155-702c-e676-2b9e-7d2a6c2b35f5/Placeholder.mill/100x100bb-75.webp"></a>
  <a target="_blank" href="https://apps.apple.com/us/app/earth-time-clock-and-weather/id6757922079" title="Earth Time - Clock and Weather - Earth Time - Clock and Weather Global moments, within reach"><img alt="Earth Time - Clock and Weather" height="52" width="52" src="https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/90/33/4f/90334f81-bd42-de2f-9cac-ed873aab7f81/Placeholder.mill/100x100bb-75.webp"></a>
  <a target="_blank" href="https://apps.apple.com/us/app/floating-clocks/id6757073999" title="Floating Clocks - Floating Clocks Pixel-Style Flash Sale Booster"><img alt="Floating Clocks" height="52" width="52" src="https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/11/3c/16/113c1691-a318-7fcb-5311-b066df1cebd1/Placeholder.mill/100x100bb-75.webp"></a>
  <a target="_blank" href="https://apps.apple.com/us/app/echo-isle-white-noise/id6749814753" title="Echo Isle - White Noise - Echo Isle - White Noise Heart rests in sound,soul isle"><img alt="Echo Isle - White Noise" height="52" width="52" src="https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/29/a4/93/29a49308-6693-6e48-a2d2-9ff52ed956c7/Placeholder.mill/100x100bb-75.webp"></a>
</div>
<!-- APPSTORE_HTML_END -->

根据 App Store 开发者 ID 和地区码，抓取作者作品目录并输出 HTML。

## Inputs

| Name | Required | Default | Description |
| --- | --- | --- | --- |
| `developer-id` | Yes | - | App Store 开发者数字 ID，例如 `1137057742`。 |
| `country` | No | `us` | App Store 地区码，例如 `us`、`cn`、`in`。 |
| `max-items` | No | `100` | 输出的作品数量上限。 |
| `homepage-url` | No | `https://logspot.hocgin.top` | 个人主页地址，和赞助地址一起传入时才显示顶部 `<sup>`。 |
| `sponsor-url` | No | `https://logspot.hocgin.top/donate/` | 赞助地址，和个人主页一起传入时才显示顶部 `<sup>`。 |
| `update-readme` | No | `false` | 生成 HTML 后顺手更新 README 顶部的标记区域。 |
| `readme-path` | No | `README.md` | 需要更新的 README 文件路径。 |
| `intro-html` | No | 空 | 自定义 HTML 介绍文案，优先级高于默认顶部文案。 |

## Outputs

| Name | Description |
| --- | --- |
| `html` | 生成的 HTML 片段。 |
| `count` | 实际输出的作品数量。 |
| `readme-updated` | 是否更新了 README。 |

## 输出规则

1. 只要不传 `homepage-url` 和 `sponsor-url`，生成结果就只有图标网格。
2. 同时传入 `homepage-url` 和 `sponsor-url` 时，会按示例插入顶部 `<sup>` 文案。
3. 如果传了 `intro-html`，则优先使用 `intro-html`。
4. `update-readme=true` 时，会把输出的 HTML 写回 `readme-path` 指定的文件。

## 标记说明

如果你要让 action 自动更新 README，请在目标文件里放这两个标记：

```md
<!-- APPSTORE_HTML_START -->
<!-- APPSTORE_HTML_END -->
```

action 会把两个标记之间的内容替换成最新的 HTML，标记外的内容不会被改动。

## 使用方法

在 workflow 里把 `update-readme` 打开即可：

```yaml
- uses: ./
  with:
    developer-id: '1745991813'
    country: 'us'
    update-readme: 'true'
    readme-path: README.md
```

如果你要更新别的文件，把 `readme-path` 改成目标路径即可。

## Example

### Marketplace 用法

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
        uses: hocgin/action-appstore-product-html@main
        with:
          developer-id: '1137057742'
          country: 'in'
          max-items: '30'
      - run: echo "${{ steps.catalog.outputs.html }}"
```

### 仓库内调试

如果是在这个仓库里本地调试，仍然可以继续使用 `uses: ./`。
