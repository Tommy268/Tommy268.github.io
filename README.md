# Tommy268.github.io

个人网站源码。纯手写 HTML + CSS，托管在 GitHub Pages，无框架、无构建步骤。

线上地址：https://tommy268.github.io

---

## 目录结构

```
.
├── index.html                    首页
├── about.html                    关于
├── 404.html                      找不到页面时自动显示
├── favicon.svg                   站点图标
├── style.css                     全站样式（含深色模式）
├── .nojekyll                     别删，关掉 Jekyll 处理
└── posts/
    ├── index.html                文章归档
    ├── build-this-site.html      这个网站是怎么搭起来的
    ├── git-commands.html         我每天在用的 10 个 Git 命令
    └── start-writing.html        为什么开始写东西
```

## 发布前必须改掉的占位内容

站点内容目前是占位示例，发出去之前请把这些换成真的：

| 位置 | 现在写的 | 改成 |
|---|---|---|
| `index.html` 的 `<h1>` | 你好，我是 Tommy | 你的名字 |
| `index.html` 底部「关于这页」 | 项目链接指向 github.com/Tommy268 | 真实仓库地址 |
| `about.html` | 「后端开发」「Python/Go」等自我描述 | 你的真实背景 |

| 三个 `posts/*.html` | 示例文章 | 你自己写的，或直接删掉 |

联系邮箱已填为 `3628034540@qq.com`，位置在 `about.html` 的「联系」一节和首页页脚。

## 上线步骤

### 1. 建仓库
https://github.com/new ，仓库名必须是 `Tommy268.github.io`，
可见性选 **Public**（免费账号的 Pages 只能用公开仓库），不要勾 "Add a README file"。

### 2. 推上去

本目录已经初始化好 git 并提交过，只需接上远端：

```bash
cd Tommy268.github.io
git remote add origin https://github.com/Tommy268/Tommy268.github.io.git
git branch -M main
git push -u origin main
```

不改命令行的话，也可以在仓库页用 `uploading an existing file` 拖拽上传，
注意 `index.html` 必须落在仓库根目录。

### 3. 打开 Pages
仓库 → Settings → Pages → Source 选 `Deploy from a branch`，
Branch 选 `main` + `/ (root)` → Save。

### 4. 等 1–2 分钟
访问 https://tommy268.github.io 。之后每次 `git push`，半分钟左右自动更新。
页面没变先按 `Ctrl+F5`，再去看仓库的 **Actions** 标签确认部署状态。

## 加一篇新文章

1. 复制 `posts/git-commands.html`，改名成 `posts/我的标题.html`
2. 改 `<title>`、`<h1>`、`<p class="meta">` 里的日期和正文
3. 在 `posts/index.html` 的列表里加一行 `<li>`
4. 在 `index.html` 的「最近写的」里替换掉最旧的一条
5. `git add -A && git commit -m "新文章" && git push`

## 本地预览

CSS 用的是 `/style.css` 这种根路径，直接双击 `index.html` 会丢样式。
在本目录起个静态服务器：

```bash
python -m http.server 8000
```

然后访问 http://localhost:8000 。

## 以后可以加的

- **自己的域名**：加 `CNAME` 文件写域名，DNS 里加 CNAME 指向 `tommy268.github.io`
- **评论**：giscus（基于 GitHub Discussions，免费无广告）
- **访问统计**：Cloudflare Web Analytics，一行 script，不写 cookie
- **换模板**：文章多了以后可以迁到 Hugo / Astro，静态文件结构不用变
