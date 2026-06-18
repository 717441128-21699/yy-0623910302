import type { ResponseTemplate } from '@/types'

export function exportToDoc(template: ResponseTemplate, eventName: string) {
  const paragraphs = [
    template.factStatement,
    template.soothingExpression,
    template.followUpMeasures,
  ]

  const sections = paragraphs.map(p => {
    const selectedSentences = p.sentences.filter(s => s.selected)
    return `<h2 style="margin-top:24px;margin-bottom:12px;font-size:18px;font-weight:600;color:#1B2838;">${p.title}</h2>
<p style="line-height:2;font-size:15px;color:#333;">${selectedSentences.map(s => s.content).join('')}</p>`
  })

  const now = new Date()
  const timeStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>回应口径草稿</title></head>
<body style="font-family:'Noto Sans SC',sans-serif;padding:40px 60px;max-width:800px;margin:0 auto;">
<div style="text-align:center;margin-bottom:32px;">
  <h1 style="font-size:24px;font-weight:700;color:#1B2838;margin-bottom:8px;">突发事件回应口径（草稿）</h1>
  <p style="font-size:14px;color:#666;">事件：${eventName || '未命名事件'}</p>
  <p style="font-size:14px;color:#666;">生成时间：${timeStr}</p>
  <hr style="border:none;border-top:2px solid #F59E0B;margin-top:16px;">
</div>
${sections.join('\n')}
<div style="margin-top:40px;padding-top:16px;border-top:1px solid #ddd;">
  <p style="font-size:13px;color:#999;">本文件由应急回应辅助台自动生成，请值班人员确认后提交领导审签。</p>
</div>
</body></html>`

  const blob = new Blob([html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `回应口径_${eventName || '草稿'}_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.doc`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function printDraft(template: ResponseTemplate, eventName: string) {
  const paragraphs = [
    template.factStatement,
    template.soothingExpression,
    template.followUpMeasures,
  ]

  const now = new Date()
  const timeStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const sections = paragraphs.map(p => {
    const selectedSentences = p.sentences.filter(s => s.selected)
    return `<h2 style="margin-top:24px;margin-bottom:12px;font-size:18px;font-weight:600;color:#1B2838;">${p.title}</h2><p style="line-height:2;font-size:15px;color:#333;">${selectedSentences.map(s => s.content).join('')}</p>`
  })

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>回应口径草稿</title>
    <style>body{font-family:'Noto Sans SC',sans-serif;padding:40px 60px;max-width:800px;margin:0 auto;}</style>
    </head><body>
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:24px;font-weight:700;color:#1B2838;margin-bottom:8px;">突发事件回应口径（草稿）</h1>
      <p style="font-size:14px;color:#666;">事件：${eventName || '未命名事件'}</p>
      <p style="font-size:14px;color:#666;">生成时间：${timeStr}</p>
      <hr style="border:none;border-top:2px solid #F59E0B;margin-top:16px;">
    </div>
    ${sections.join('\n')}
    <div style="margin-top:40px;padding-top:16px;border-top:1px solid #ddd;">
      <p style="font-size:13px;color:#999;">本文件由应急回应辅助台自动生成，请值班人员确认后提交领导审签。</p>
    </div>
    </body></html>`)
    printWindow.document.close()
    printWindow.print()
  }
}
