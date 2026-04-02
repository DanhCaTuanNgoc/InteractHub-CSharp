import { useEffect, useState } from 'react'
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
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách report.')
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
      setError(err instanceof Error ? err.message : 'Không thể xử lý report.')
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
    <section className="cards-section cards-section--single mt-2 grid grid-cols-1 gap-4 sm:mt-4">
      <article className="status-card p-4 sm:p-5 lg:p-6">
        <h1>Admin Reports</h1>
        <p>Xử lý report và xóa bài viết vi phạm từ backend Admin API.</p>

        <div className="mt-3">
          <Button type="button" variant="ghost" onClick={() => void loadReports()} busy={loading}>
            Tải lại
          </Button>
        </div>

        {error ? <p className="form-error mt-3">{error}</p> : null}

        {loading ? <p className="mt-3">Đang tải reports...</p> : null}

        {!loading && reports.length === 0 ? <p className="mt-3">Chưa có report cần xử lý.</p> : null}

        <div className="explore-result mt-4">
          {reports.map((report) => (
            <article key={report.id} className="status-card">
              <h2>Report #{report.id.slice(0, 8)}</h2>
              <p>
                <strong>Status:</strong> {report.status}
              </p>
              <p>
                <strong>Reason:</strong> {report.reason}
              </p>
              <p>
                <strong>Reporter:</strong> {report.reporter.fullName} (@{report.reporter.userName})
              </p>
              <p>
                <strong>PostId:</strong> {report.postId}
              </p>
              <p>
                <strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}
              </p>

              <div className="post-card__inline-actions mt-3">
                <Button
                  type="button"
                  variant="primary"
                  busy={busyReportId === report.id}
                  onClick={() => void resolve(report.id, 'Resolved')}
                >
                  Resolve
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  busy={busyReportId === report.id}
                  onClick={() => void resolve(report.id, 'Rejected')}
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  busy={busyReportId === report.id}
                  onClick={() => void deletePost(report.id, report.postId)}
                >
                  Delete Post
                </Button>
              </div>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}
