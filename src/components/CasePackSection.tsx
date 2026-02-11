import { ChangeEvent, useMemo, useState } from 'react'
import { Archive, FileText, Upload, X } from 'lucide-react'
import JSZip from 'jszip'
import { Document, Packer, Paragraph, TextRun } from 'docx'

const ACCEPT_TYPES = '.pdf,.doc,.docx,.xlsx,.png,.jpg,.jpeg'

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim()
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function CasePackSection() {
  const [workOrderNo, setWorkOrderNo] = useState('')
  const [agencyEmail, setAgencyEmail] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [agencyPhone, setAgencyPhone] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isPacking, setIsPacking] = useState(false)

  const workOrderDate = useMemo(() => {
    const digitsOnly = workOrderNo.replace(/\D/g, '')
    return digitsOnly.slice(0, 8)
  }, [workOrderNo])

  const baseName = useMemo(() => {
    const raw = `${agencyName}${workOrderDate}调证`.trim()
    return sanitizeFileName(raw)
  }, [agencyName, workOrderDate])

  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const incoming = Array.from(files)
    setUploadedFiles(prev => {
      const next = [...prev]
      incoming.forEach(file => {
        const exists = next.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)
        if (!exists) next.push(file)
      })
      return next
    })
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setWorkOrderNo('')
    setAgencyEmail('')
    setAgencyName('')
    setAgencyPhone('')
    setDocumentNumber('')
    setUploadedFiles([])
  }

  const handlePack = async () => {
    if (!workOrderNo || !agencyEmail || !agencyName || !agencyPhone || !documentNumber) {
      alert('請先完整填寫所有資訊')
      return
    }

    if (workOrderDate.length !== 8) {
      alert('执法请求-工单号格式不正確，無法提取 8 位工单日期')
      return
    }

    if (!baseName) {
      alert('司法机构-名称 與 工单日期不可為空')
      return
    }

    setIsPacking(true)
    try {
      const createLine = (text: string) =>
        new Paragraph({
          children: [
            new TextRun({
              text,
              size: 28
            })
          ]
        })

      const doc = new Document({
        sections: [
          {
            children: [
              createLine(`执法请求-工单号（司法案件编号）：${workOrderNo}`),
              createLine(`司法机构-邮箱：${agencyEmail}`),
              createLine(`司法机构-名称：${agencyName}`),
              createLine(`司法机构-电话：${agencyPhone}`),
              createLine(`司法/执法文书-编号：${documentNumber}`),
              new Paragraph(''),
              new Paragraph('')
            ]
          }
        ]
      })
      const docBlob = await Packer.toBlob(doc)

      const zip = new JSZip()
      const folder = zip.folder(baseName)
      if (!folder) {
        throw new Error('建立資料夾失敗')
      }

      const usedNames = new Set<string>()
      uploadedFiles.forEach(file => {
        const originalName = sanitizeFileName(file.name)
        let safeName = originalName || 'uploaded_file'
        let index = 1

        while (usedNames.has(safeName)) {
          const dot = originalName.lastIndexOf('.')
          if (dot > 0) {
            const n = originalName.slice(0, dot)
            const ext = originalName.slice(dot)
            safeName = `${n}_${index}${ext}`
          } else {
            safeName = `${originalName}_${index}`
          }
          index += 1
        }

        usedNames.add(safeName)
        folder.file(safeName, file)
      })

      folder.file(`${baseName}.docx`, docBlob)

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(zipBlob, `${baseName}.zip`)
      alert('案件整理打包完成')
    } catch (error) {
      console.error('打包失敗:', error)
      alert('打包失敗，請稍後再試')
    } finally {
      setIsPacking(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <h1 className="section-title">案件整理打包</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        <div className="lg:col-span-2">
          <div className="card space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  执法请求-工单号（司法案件编号）
                </label>
                <input
                  type="text"
                  value={workOrderNo}
                  onChange={(e) => setWorkOrderNo(e.target.value)}
                  placeholder="請輸入工單號 / 案件編號"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  工单日期（從工单号自動提取）
                </label>
                <input
                  type="text"
                  value={workOrderDate}
                  readOnly
                  placeholder="例如：20260119"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  司法机构-邮箱
                </label>
                <input
                  type="email"
                  value={agencyEmail}
                  onChange={(e) => setAgencyEmail(e.target.value)}
                  placeholder="example@agency.gov"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  司法机构-名称
                </label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="請輸入司法机构名稱"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  司法机构-电话
                </label>
                <input
                  type="text"
                  value={agencyPhone}
                  onChange={(e) => setAgencyPhone(e.target.value)}
                  placeholder="請輸入聯絡電話"
                  className="input"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  司法/执法文书-编号
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="請輸入文書編號"
                  className="input"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold">上傳檔案</h2>
              </div>
              <input
                type="file"
                accept={ACCEPT_TYPES}
                multiple
                onChange={handleFilesChange}
                className="input"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                支援多選：pdf、doc/docx、xlsx、png、jpg
              </p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  已上傳 {uploadedFiles.length} 個檔案
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${file.lastModified}-${index}`}
                      className="flex items-center justify-between glass rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePack}
                disabled={isPacking}
                className="btn btn-primary flex items-center justify-center gap-2"
              >
                <Archive className="w-4 h-4" />
                {isPacking ? '打包中...' : '建立並下載 ZIP'}
              </button>
              <button
                onClick={resetForm}
                disabled={isPacking}
                className="btn btn-ghost"
              >
                清空
              </button>
            </div>
          </div>
        </div>

        <div className="card-compact">
          <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">輸出規則</h3>
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <p>工单日期會從工单号自動提取前 8 碼（YYYYMMDD）。</p>
            <p>資料夾名稱：`司法机构-名称 + 工单日期 + 调证`</p>
            <p>ZIP 名稱：`司法机构-名称 + 工单日期 + 调证.zip`</p>
            <p>DOCX 名稱：`司法机构-名称 + 工单日期 + 调证.docx`</p>
            <p>DOCX 內容為固定 5 行資料，字體大小 14pt。</p>
          </div>
        </div>
      </div>
    </div>
  )
}
