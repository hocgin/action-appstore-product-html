# App Store Product HTML Action

Marketplace: https://github.com/marketplace/actions/app-store-product-html

<!-- APPSTORE_HTML_START -->
<div markdown="1">
  <sup>Using <a href="https://logspot.hocgin.top" target="_blank">my apps</a> is also a way to <a href="https://logspot.hocgin.top/donate/" target="_blank">support</a> me:</sup>
  <br>
  <a target="_blank" href="https://maslink.hocgin.top/?id=6800762440" title="DoTask: Plan &amp; Focus &amp; Review"><img alt="DoTask: Plan &amp; Focus &amp; Review" height="52" width="52" src="https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/2f/04/f2/2f04f28b-0e23-f012-bc7c-7da50975d5c3/Placeholder.mill/100x100bb-75.webp"></a>
  <a target="_blank" href="https://maslink.hocgin.top/?id=6762222185" title="FoxFeed: RSS Reader"><img alt="FoxFeed: RSS Reader" height="52" width="52" src="https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/ed/15/5b/ed155b39-44c5-6dbf-ac5e-4cd4a2cf6243/Placeholder.mill/100x100bb-75.webp"></a>
  <a target="_blank" href="https://maslink.hocgin.top/?id=6777452983" title="Time Flow:Lyubishchev TM"><img alt="Time Flow:Lyubishchev TM" height="52" width="52" src="https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/5e/dd/0b/5edd0bc8-ace1-a94c-5e8a-fd9ad4a41704/Placeholder.mill/100x100bb-75.webp"></a>
  <a target="_blank" href="https://maslink.hocgin.top/?id=6768043307" title="Cirra Weather"><img alt="Cirra Weather" height="52" width="52" src="https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/9e/d9/2f/9ed92f23-986c-f8fa-8c64-ad02aaaa2b56/Placeholder.mill/100x100bb-75.webp"></a>
  <a target="_blank" href="https://maslink.hocgin.top/?id=6757922079" title="Earth Time - Clock and Weather"><img alt="Earth Time - Clock and Weather" height="52" width="52" src="https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/bf/e4/86/bfe486ab-8bb8-c345-730b-fa18881bf9a8/Placeholder.mill/100x100bb-75.webp"></a>
  <a target="_blank" href="https://maslink.hocgin.top/?id=6757073999" title="Floating Clocks"><img alt="Floating Clocks" height="52" width="52" src="https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/11/3c/16/113c1691-a318-7fcb-5311-b066df1cebd1/Placeholder.mill/100x100bb-75.webp"></a>
  <a target="_blank" href="https://maslink.hocgin.top/?id=6749814753" title="Echo Isle - White Noise"><img alt="Echo Isle - White Noise" height="52" width="52" src="https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/41/2a/6c/412a6ccc-4aa2-6a25-d306-2b493d529fb9/Placeholder.mill/100x100bb-75.webp"></a>
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
