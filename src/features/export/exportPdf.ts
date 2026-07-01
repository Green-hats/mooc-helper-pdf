const isTauri = Boolean(process.env.NEXT_PUBLIC_TAURI);

export async function exportQuestionsToPdf(
  mocPaperDto: MocPaperDto,
  title: string
) {
  const bodyHTML = buildQuestionsHTML(mocPaperDto, title);

  if (isTauri) {
    await downloadPdf(bodyHTML, title);
  } else {
    printPdf(bodyHTML, title);
  }
}

function buildQuestionsHTML(mocPaperDto: MocPaperDto, title: string): string {
  const rows: string[] = [];

  for (const q of mocPaperDto.objectiveQList) {
    rows.push(renderObjectiveQuestion(q));
  }
  for (const q of mocPaperDto.subjectiveQList) {
    rows.push(renderSubjectiveQuestion(q));
  }

  return rows.join("");
}

function buildHtmlDocument(bodyHTML: string, title: string): string {
  const fontFamily =
    '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  @media print {
    @page { size: A4; margin: 12mm; }
  }
  body {
    font-family: ${fontFamily};
    font-size: 14px;
    color: #000;
    background: #fff;
    line-height: 1.7;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .q-title { font-size: 16px; font-weight: bold; margin: 16px 0 8px; }
  .q-option { display: flex; align-items: flex-start; margin: 4px 0; padding-left: 8px; }
  .q-indicator { font-size: 18px; line-height: 1; margin-right: 8px; flex-shrink: 0; width: 22px; text-align: center; }
  .indicator-correct { color: #1976d2; }
  .indicator-wrong { color: #bbb; }
  .q-answer { margin: 8px 0 8px 8px; padding: 8px 12px; border-left: 3px solid #1976d2; }
  .q-answer-label { color: #1976d2; font-weight: bold; }
  .q-separator { border: none; border-top: 1px solid #eee; margin: 16px 0; }
  .pdf-title { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
  img { max-width: 100%; height: auto; }
</style>
</head>
<body>
<div class="pdf-title">${escapeHtml(title)}</div>
${bodyHTML}
<script>
  window.onload = function() { window.print(); };
</script>
</body>
</html>`;
}

function printPdf(bodyHTML: string, title: string) {
  const overlay = document.createElement("div");
  overlay.id = "pdf-export-overlay";
  overlay.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:99999;overflow:auto;padding:24px 32px;box-sizing:border-box;";

  const printCss = document.createElement("style");
  printCss.id = "pdf-export-print-css";
  printCss.textContent = `
    @media print {
      @page { size: A4; margin: 12mm; }
      body > :not(#pdf-export-overlay) { display: none !important; }
      #pdf-export-overlay {
        position: static !important;
        padding: 0 !important;
        overflow: visible !important;
      }
    }
    .pdf-export-content {
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
      font-size: 14px; color: #000; line-height: 1.7;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .q-title { font-size: 16px; font-weight: bold; margin: 16px 0 8px; }
    .q-option { display: flex; align-items: flex-start; margin: 4px 0; padding-left: 8px; }
    .q-indicator { font-size: 18px; line-height: 1; margin-right: 8px; flex-shrink: 0; width: 22px; text-align: center; }
    .indicator-correct { color: #1976d2; }
    .indicator-wrong { color: #bbb; }
    .q-answer { margin: 8px 0 8px 8px; padding: 8px 12px; border-left: 3px solid #1976d2; }
    .q-answer-label { color: #1976d2; font-weight: bold; }
    .q-separator { border: none; border-top: 1px solid #eee; margin: 16px 0; }
    .pdf-title { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
    img { max-width: 100%; height: auto; }
  `;
  overlay.appendChild(printCss);

  const content = document.createElement("div");
  content.className = "pdf-export-content";
  content.innerHTML = `<div class="pdf-title">${escapeHtml(title)}</div>${bodyHTML}`;
  overlay.appendChild(content);

  document.body.appendChild(overlay);

  const cleanup = () => {
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
    }
  };

  window.addEventListener("afterprint", cleanup, { once: true });
  setTimeout(() => {
    window.removeEventListener("afterprint", cleanup);
    cleanup();
  }, 120000);

  window.print();
}

async function downloadPdf(bodyHTML: string, title: string) {
  const html = buildHtmlDocument(bodyHTML, title);
  const { writeTextFile } = await import("@tauri-apps/api/fs");
  const { appDir } = await import("@tauri-apps/api/path");
  const { Command } = await import("@tauri-apps/api/shell");

  const safeName = title.replace(/[\/\\:*?"<>|]/g, "_");
  const dir = await appDir();
  const filePath = `${dir}${safeName}.html`;
  await writeTextFile(filePath, html);

  const command = new Command("open", [filePath]);
  await command.execute();
}

function renderObjectiveQuestion(q: ObjectiveQ): string {
  const title = `<div class="q-title">${q.title}</div>`;

  if (q.type === 3) {
    return (
      title +
      `<div class="q-answer">` +
      `<span class="q-answer-label">答案：</span>` +
      `${q.stdAnswer.replace(/##%_YZPRLFH_%##/g, "或者")}` +
      `</div>` +
      `<hr class="q-separator">`
    );
  }

  const isSingle = q.type === 1 || q.type === 4;
  const indicator = isSingle ? ["●", "○"] : ["☑", "☐"];

  const options = q.optionDtos
    .map((opt) => {
      const correct = opt.answer;
      return (
        `<div class="q-option">` +
        `<span class="q-indicator ${correct ? "indicator-correct" : "indicator-wrong"}">${indicator[correct ? 0 : 1]}</span>` +
        `<span>${opt.content}</span>` +
        `</div>`
      );
    })
    .join("");

  return title + options + `<hr class="q-separator">`;
}

function renderSubjectiveQuestion(q: SubjectiveQ): string {
  const title = `<div class="q-title">${q.title}</div>`;
  const judgeHTML = q.judgeDtos.map((j) => j.msg).join("<br>");

  return (
    title +
    `<div class="q-answer">` +
    `<span class="q-answer-label">答案：</span>` +
    judgeHTML +
    `</div>` +
    `<hr class="q-separator">`
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
