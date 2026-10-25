# Tommy268.github.io

个人网站源码。纯静态 HTML + CSS，托管在 GitHub Pages，无框架、无构建步骤。

---

## 上线步骤

### 0. 前提
- 有 GitHub 账号，用户名是 `Tommy268`。
- **如果你的用户名不是 `Tommy268`**：仓库名和下面的网址都要换成你的用户名，
  并且把 `index.html` 里的 GitHub 链接也改掉。

### 1. 建仓库
打开 https://github.com/new ，仓库名必须是：

```
Tommy268.github.io
```

- 可见性：**Public**（免费账号的 Pages 只能用公开仓库）
- 不要勾选 "Add a README file"（本地已经有文件了）

### 2. 上传文件（选一种）

**方式 A：网页拖拽（不用装任何东西）**

在新建好的仓库页点 `uploading an existing file`，把这个文件夹里的
`index.html`、`style.css`、`about.html`、`posts/` 全部拖进去，
Commit changes。注意要在仓库**根目录**，不要把文件夹本身拖进去。

**方式 B：命令行（推荐，以后更新方便）**

这个目录已经初始化好 git 并且提交过一次，你只需要接上远端：

```bash
cd Tommy268.github.io
git remote add origin https://github.com/Tommy268/Tommy268.github.io.git
git branch -M main
git push -u origin main
```

首次 push 会弹窗要 GitHub 登录，或者要 token。

### 3. 打开 Pages
仓库 → Settings → 左侧 Pages →

- Source 选 `Deploy from a branch`
- Branch 选 `main`，目录选 `/ (root)`
- Save

（`用户名.github.io` 这种仓库通常会自动开启，进去确认一下就行。）

### 4. 等 1–2 分钟
访问 **https://tommy268.github.io**

改完文件再 `git push`，半分钟左右自动更新。浏览器缓存狠的话按 Ctrl+F5。

---

## 目录结构

```
.
├── index.html              首页
├── about.html              关于页
├── style.css               全站样式（含深色模式）
├── posts/
│   └── hello-world.html    一篇文章
└── .nojekyll               别删，关掉 Jekyll 处理
```

## 加一篇新文章

1. 复制 `posts/hello-world.html`，改名成 `posts/我的标题.html`
2. 改里面的 `<title>`、`<h1>`、`<time>` 和正文
3. 在 `index.html` 的「文章」列表里加一行 `<li>...`
4. `git add -A && git commit -m "新文章" && git push`

## 本地预览

直接双击 `index.html` 用浏览器打开就能看，不用起服务器。
（因为 CSS 用的是 `/style.css` 绝对路径，本地 `file://` 打开时样式会丢；
想本地看效果，在这个目录运行 `python -m http.server 8000`，
然后访问 http://localhost:8000 。）
