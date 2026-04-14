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
    <section className="cards-section cards-section--single admin-page mt-2 grid grid-cols-1 gap-4 sm:mt-4">
      <article className="status-card admin-page__panel p-4 sm:p-5 lg:p-6">
        <header className="admin-page__hero">
          <div>
            <p className="admin-page__eyebrow">
              <ShieldCheck size={14} aria-hidden="true" />
              Quản trị
            </p>
            <h1>Báo cáo vi phạm</h1>
            <p>Quản lý báo cáo và xử lý bài viết vi phạm từ hệ thống quản trị.</p>
          </div>
        </header>

        <div className="mt-3">
          <Button type="button" variant="ghost" onClick={() => void loadReports()} busy={loading}>
            Tải lại
          </Button>
        </div>

        {error ? <p className="form-error mt-3">{error}</p> : null}

        {loading ? <p className="mt-3">Đang tải danh sách báo cáo...</p> : null}

        {!loading && reports.length === 0 ? <p className="mt-3">Chưa có báo cáo cần xử lý.</p> : null}

        <div className="explore-result admin-page__list mt-4">
          {reports.map((report) => (
            <article key={report.id} className="status-card admin-report-card">
              <h2>Báo cáo #{report.id.slice(0, 8)}</h2>

              <dl className="admin-report-card__meta">
                <div>
                  <dt>Trạng thái</dt>
                  <dd>{report.status}</dd>
                </div>
                <div>
                  <dt>Lý do</dt>
                  <dd>{report.reason}</dd>
                </div>
                <div>
                  <dt>Người báo cáo</dt>
                  <dd>
                    {report.reporter.fullName} (@{report.reporter.userName})
                  </dd>
                </div>
                <div>
                  <dt>Mã bài viết</dt>
                  <dd>{report.postId}</dd>
                </div>
                <div>
                  <dt>Thời gian tạo</dt>
                  <dd>{new Date(report.createdAt).toLocaleString()}</dd>
                </div>
              </dl>

              <div className="post-card__inline-actions mt-3">
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
