import type { ResponseTemplate } from '@/types'

const paragraphKeys = ['factStatement', 'soothingExpression', 'followUpMeasures'] as const

function buildSections(template: ResponseTemplate, includeTrackedChanges: boolean) {
  return paragraphKeys.map(key => {
    const p = template[key]
    const selected = p.sentences.filter(s => s.selected)
    if (selected.length === 0) return ''

    const content = selected.map(s => {
      if (includeTrackedChanges && s.edited) {
        return `<span style="background-color:#FFF3CD;padding:1px 3px;border-bottom:2px solid #F59E0B;" title="原文：${escapeHtml(s.originalContent)}">${escapeHtml(s.content)}</span>`
      }
      return escapeHtml(s.content)
    }).join('')

    let html = `<h2 style="margin-top:24px;margin-bottom:12px;font-size:18px;font-weight:600;color:#1B2838;">${p.title}</h2>`
    html += `<p style="line-height:2;font-size:15px;color:#333;">${content}</p>`

    if (includeTrackedChanges) {
      const edited = selected.filter(s => s.edited)
      if (edited.length > 0) {
        html += `<div style="margin-top:8px;padding-left:16px;border-left:2px solid #F59E0B;">`
        html += `<p style="font-size:12px;color:#999;margin-bottom:4px;">修改对照：</p>`
        edited.forEach(s => {
          html += `<p style="font-size:13px;color:#DC2626;text-decoration:line-through;margin:2px 0;">${escapeHtml(s.originalContent)}</p>`
          html += `<p style="font-size:13px;color:#16A34A;margin:2px 0;">${escapeHtml(s.content)}</p>`
        })
        html += `</div>`
      }
    }

    return html
  }).filter(Boolean).join('\n')
}

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildSignatureBlock() {
  return `
  <div style="margin-top:48px;border-top:2px dashed #ddd;padding-top:24px;">
    <table style="width:100%;border:none;">
      <tr>
        <td style="width:50%;vertical-align:top;padding-right:32px;">
          <p style="font-size:14px;color:#666;margin-bottom:48px;">值班员签字：_______________</p>
          <p style="font-size:14px;color:#666;">日期：_______________</p>
        </td>
        <td style="width:50%;vertical-align:top;padding-left:32px;">
          <p style="font-size:14px;color:#666;margin-bottom:48px;">领导审签：_______________</p>
          <p style="font-size:14px;color:#666;">日期：_______________</p>
        </td>
      </tr>
    </table>
  </div>`
}

function getTimestamp() {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

function downloadDoc(html: string, filename: string) {
  const blob = new Blob([html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportToDoc(template: ResponseTemplate, eventName: string) {
  const sections = buildSections(template, false)
  const timeStr = getTimestamp()

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>回应口径草稿</title></head>
<body style="font-family:'Noto Sans SC',sans-serif;padding:40px 60px;max-width:800px;margin:0 auto;">
<div style="text-align:center;margin-bottom:32px;">
  <h1 style="font-size:24px;font-weight:700;color:#1B2838;margin-bottom:8px;">突发事件回应口径（草稿）</h1>
  <p style="font-size:14px;color:#666;">事件：${escapeHtml(eventName || '未命名事件')}</p>
  <p style="font-size:14px;color:#666;">生成时间：${timeStr}</p>
  <hr style="border:none;border-top:2px solid #F59E0B;margin-top:16px;">
</div>
${sections}
<div style="margin-top:40px;padding-top:16px;border-top:1px solid #ddd;">
  <p style="font-size:13px;color:#999;">本文件由应急回应辅助台自动生成，请值班人员确认后提交领导审签。</p>
</div>
</body></html>`

  const now = new Date()
  downloadDoc(html, `回应口径_${eventName || '草稿'}_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.doc`)
}

export function exportReviewDoc(template: ResponseTemplate, eventName: string) {
  const sections = buildSections(template, true)
  const timeStr = getTimestamp()
  const editedCount = paragraphKeys.reduce((acc, key) => acc + template[key].sentences.filter(s => s.selected && s.edited).length, 0)
  const totalCount = paragraphKeys.reduce((acc, key) => acc + template[key].sentences.filter(s => s.selected).length, 0)

  let traceNote = ''
  if (editedCount > 0) {
    traceNote = `<div style="margin-bottom:20px;padding:12px;background-color:#FFFBEB;border:1px solid #FDE68A;border-radius:6px;">
  <p style="font-size:12px;color:#D97706;font-weight:600;margin-bottom:4px;">⚠ 值班员修改痕迹</p>
  <p style="font-size:12px;color:#666;">共 ${totalCount} 句中 ${editedCount} 句经过值班员修改，修改处以<span style="color:#D97706;font-weight:600;">琥珀色高亮</span>标注，修改对照列于各段下方。</p>
</div>`
  }

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>回应口径审签稿</title></head>
<body style="font-family:'Noto Sans SC',sans-serif;padding:40px 60px;max-width:800px;margin:0 auto;">
<div style="text-align:center;margin-bottom:32px;">
  <h1 style="font-size:24px;font-weight:700;color:#1B2838;margin-bottom:8px;">突发事件回应口径（审签稿）</h1>
  <p style="font-size:14px;color:#666;">事件：${escapeHtml(eventName || '未命名事件')}</p>
  <p style="font-size:14px;color:#666;">生成时间：${timeStr}</p>
  <hr style="border:none;border-top:2px solid #F59E0B;margin-top:16px;">
</div>
${traceNote}
${sections}
${buildSignatureBlock()}
</body></html>`

  const now = new Date()
  downloadDoc(html, `回应口径_审签稿_${eventName || '草稿'}_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.doc`)
}

export function printDraft(template: ResponseTemplate, eventName: string) {
  const sections = buildSections(template, false)
  const timeStr = getTimestamp()

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>回应口径草稿</title>
    <style>body{font-family:'Noto Sans SC',sans-serif;padding:40px 60px;max-width:800px;margin:0 auto;}</style>
    </head><body>
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:24px;font-weight:700;color:#1B2838;margin-bottom:8px;">突发事件回应口径（草稿）</h1>
      <p style="font-size:14px;color:#666;">事件：${escapeHtml(eventName || '未命名事件')}</p>
      <p style="font-size:14px;color:#666;">生成时间：${timeStr}</p>
      <hr style="border:none;border-top:2px solid #F59E0B;margin-top:16px;">
    </div>
    ${sections}
    <div style="margin-top:40px;padding-top:16px;border-top:1px solid #ddd;">
      <p style="font-size:13px;color:#999;">本文件由应急回应辅助台自动生成，请值班人员确认后提交领导审签。</p>
    </div>
    </body></html>`)
    printWindow.document.close()
    printWindow.print()
  }
}
