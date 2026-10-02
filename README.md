# 次世代工学研究室 — Next-Generation Engineering Laboratory

理念は「ありふれたものを、驚きに変える」。AIを活用してロボット・ドローン・レーザ彫刻機を高機能化し、次世代製品に向けた研究を紹介するウェブサイトです。

## 確認する

ZIPを展開し、`index.html` をChrome、Edge、Safariなどのブラウザで開いてください。HTMLとassetsフォルダを同じ場所に置いたまま確認します。

サイトは6ページです。

- index.html：研究室の理念、3つの研究分野、研究の進め方
- research.html：ロボット・ドローン・レーザ彫刻機の研究内容
- members.html：教員・学生紹介
- publications.html：論文・学会発表・研究助成
- students.html：卒業研究と身につける力
- contact.html：共同研究・技術相談・見学

日本語・英語を切り替えられます。言語の選択だけをブラウザ内に保存します。アクセス解析や外部送信はありません。

## デザイン

参考ガイドと完成例の、大きな画像、余白のある見出し、ゆっくり現れる文章、重なっていくカードという考え方を、研究室向けに再構成しました。配色は白をベースに、深い青緑の文字と緑のアクセントを使用しています。スマートフォンではカードを縦に並べ、文字を読みやすくしています。OSの「動きを減らす」設定では演出を抑えます。

参考にしたページ：
https://evolve-st.com/resources/website-kit/guide/
https://evolve-st.com/resources/website-kit/archer/

YouTube動画そのものの内容は取得できていません。上記のガイドと完成サイトを確認して制作しています。

## 今回の更新内容

- 教員「佐藤　敦」の写真、香川県出身、本人提供の学歴・職歴を反映。
- 四足歩行ロボットの実機動画は新たに提供された15.4秒の映像に差し替え。MuJoCoのシミュレーション動画も掲載。
- マスコット「もーたろう」をホーム・メンバー・学生向けページに掲載。
- 学会原稿4件の研究紹介とPDFを同梱。
- researchmapを出典として論文7件、講演等11件、受賞3件、研究助成6件を掲載。別に提供原稿の2026年発表4件を掲載。
- 公開プロフィールのメールアドレス、職位、大学所在地を反映。

動画は再生ボタンを押して再生します。MP4とWebMを収録し、対応形式をブラウザが選びます。PDF・動画・写真を含むため、公開時はフォルダ全体をアップロードしてください。

## 連絡先と所属を変更

`assets/config.js` をメモ帳などで開きます。

```js
window.LAB_CONFIG = {
  labNameJa: '次世代工学研究室',
  labNameEn: 'Next-Generation Engineering Laboratory',
  affiliationJa: '三条市立大学',
  affiliationEn: 'Sanjo City University',
  email: 'sato.atsushi@sanjo-u.ac.jp',
  addressJa: '',
  addressEn: ''
};
```

`email`に公開用メールアドレスを入れると、Contactページにメールリンクが表示されます。フォームを送信するサービスではなく、訪問者のメールアプリを開くリンクです。住所は空欄なら表示しません。

所属変更時は上記の共通設定を変更できます。検索エンジン向けの本文やJavaScript無効時の表示まで更新するときは、各HTML内の旧所属表記も置換してください。内容の更新では、日本語本文、`data-ja`、`data-en`をそろえます。

## GitHub Pagesで公開

1. GitHubで自分のアカウントを用意する。
2. `nextgen-lab` などの名前で公開リポジトリを作成する。
3. このフォルダの**中身**をアップロードする。リポジトリ直下にindex.html、assets、papersを置く。ZIPそのものを置いてもサイトになりません。
4. Settings → Pagesを開く。
5. Sourceを `Deploy from a branch`、Branchを `main`、フォルダを `/(root)` にしてSaveする。
6. Pagesに表示される公開URLで確認する。

通常は `https://ユーザー名.github.io/リポジトリ名/` で公開されます。相対パスなので、この形式に対応しています。

公式手順：
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

独自ドメインは取得後にGitHub PagesのCustom domainとDNSを設定してください。未取得のドメインを設定するCNAMEファイルは含めていません。
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

## 画像とフォント

`assets/lab-logo.png` はご提供のロゴをそのまま収録しています。白い背景上で元の配色を表示しています。

`assets/hero.webp` はAI生成の研究コンセプト画像です。実際の所有機器・設備・研究成果の写真ではありません。サイトにも注記を表示しています。生成情報はASSET_NOTES.mdをご覧ください。

日本語フォントはNoto Sans JPとNoto Serif JPを使用。必要な文字だけを含む軽量版を同梱しています。ライセンスは `assets/fonts/OFL-sans.txt` と `OFL-serif.txt` に含めました。本文を更新して未収録の文字が加わった場合は、端末の日本語フォントで補われます。

## 動作確認

6ページ、日英切替、複数の画面幅での横はみ出し、スマートフォンのメニュー開閉、JavaScriptエラー、内部リンクを確認しています。ブラウザでデスクトップ・モバイルの見た目も確認しています。

GitHubへのアップロード、一般公開、ドメイン取得はまだ行っていません。
