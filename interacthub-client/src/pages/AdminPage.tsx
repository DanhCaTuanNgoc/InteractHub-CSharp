import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Button } from '../shared/components/common/Button'
import { adminService } from '../shared/services/adminService'
import type { PostReport } from '../shared/types/postReport'

export function AdminPage() {
  const [reports, setReports] = useState<PostReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyReportId, setBusyReportId] = useState<string | null>(null)

  const loadReports = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await adminService.getReports()
      setReports(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách báo cáo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadReports()
  }, [])

  const resolve = async (reportId: string, status: string) => {
    setBusyReportId(reportId)
    setError(null)
    try {
      const updated = await adminService.resolveReport(reportId, status)
      setReports((current) => current.map((item) => (item.id === reportId ? updated : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xử lý báo cáo.')
    } finally {
      setBusyReportId(null)
    }
  }

  const deletePost = async (reportId: string, postId: string) => {
    setBusyReportId(reportId)
    setError(null)
    try {
      await adminService.deletePost(postId)
      setReports((current) => current.filter((item) => item.id !== reportId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa bài viết vi phạm.')
    } finally {
      setBusyReportId(null)
    }
  }

  return (
    <section className="mt-2 grid grid-cols-1 gap-4 sm:mt-4">
      <article className="rounded-3xl border border-slate-200/70 bg-white/75 p-4 shadow-xl backdrop-blur-xl sm:p-5 lg:p-6">
        <header className="space-y-2">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
              <ShieldCheck size={14} aria-hidden="true" />
              Quản trị
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Báo cáo vi phạm</h1>
            <p className="mt-1 text-sm text-slate-600">Quản lý báo cáo và xử lý bài viết vi phạm từ hệ thống quản trị.</p>
          </div>
        </header>

        <div className="mt-3">
          <Button type="button" variant="ghost" onClick={() => void loadReports()} busy={loading}>
            Tải lại
          </Button>
        </div>

        {error ? <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}

        {loading ? <p className="mt-3 text-sm text-slate-500">Đang tải danh sách báo cáo...</p> : null}

        {!loading && reports.length === 0 ? <p className="mt-3 text-sm text-slate-500">Chưa có báo cáo cần xử lý.</p> : null}

        <div className="mt-4 grid gap-3">
          {reports.map((report) => (
            <article key={report.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Báo cáo #{report.id.slice(0, 8)}</h2>

              <dl className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-slate-500">Trạng thái</dt>
                  <dd className="text-slate-900">{report.status}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Lý do</dt>
                  <dd className="text-slate-900">{report.reason}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Người báo cáo</dt>
                  <dd className="text-slate-900">
                    {report.reporter.fullName} (@{report.reporter.userName})
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Mã bài viết</dt>
                  <dd className="text-slate-900">{report.postId}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Thời gian tạo</dt>
                  <dd className="text-slate-900">{new Date(report.createdAt).toLocaleString()}</dd>
                </div>
              </dl>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="primary"
                  busy={busyReportId === report.id}
                  onClick={() => void resolve(report.id, 'Resolved')}
                >
                  Đã xử lý
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  busy={busyReportId === report.id}
                  onClick={() => void resolve(report.id, 'Rejected')}
                >
                  Từ chối
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  busy={busyReportId === report.id}
                  onClick={() => void deletePost(report.id, report.postId)}
                >
                  Xóa bài viết
                </Button>
              </div>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}
