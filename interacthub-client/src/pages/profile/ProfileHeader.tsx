import { motion } from 'framer-motion'
import { AtSign, BadgeCheck, Mail, UserRoundCheck, UserRoundPlus, UserRoundPen } from 'lucide-react'
import { Avatar } from '../../shared/components/common/Avatar'
import { Button } from '../../shared/components/common/Button'
import type { FriendshipRelationship } from '../../shared/types/friendshipRelationship'
import type { UserSummary } from '../../shared/types/user'

type ProfileHeaderProps = {
  profile: UserSummary | null
  isOwnProfile: boolean
  onEditProfile: () => void
  postCount: number
  storyCount: number
  relationship: FriendshipRelationship | null
  relationshipLoading: boolean
  relationshipBusy: boolean
  relationshipLabel: string
  relationshipError: string | null
  onSendRequest: () => void
  onAcceptRequest: () => void
  onDeclineRequest: () => void
  onRemoveFriend: () => void
}

export function ProfileHeader({
  profile,
  isOwnProfile,
  onEditProfile,
  postCount,
  storyCount,
  relationship,
  relationshipLoading,
  relationshipBusy,
  relationshipLabel,
  relationshipError,
  onSendRequest,
  onAcceptRequest,
  onDeclineRequest,
  onRemoveFriend,
}: ProfileHeaderProps) {
  return (
    <motion.section
      className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-xl md:p-8"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: 'easeOut' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.2),_transparent_42%),radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_36%)]" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          className="mb-4 rounded-full bg-white/80 p-1.5 shadow-sm ring-4 ring-cyan-100"
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Avatar src={profile?.avatarUrl ?? null} alt={profile?.fullName ?? 'Ảnh đại diện'} size="lg" />
        </motion.div>

        <div className="max-w-2xl space-y-2">
          <h1 className="inline-flex items-center justify-center gap-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            <span>{profile?.fullName ?? 'Trang cá nhân'}</span>
            <BadgeCheck size={18} className="text-cyan-600" />
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <AtSign size={14} />
              {profile?.userName ?? 'tên người dùng'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail size={14} />
              {profile?.email ?? 'email'}
            </span>
          </div>

          <p className="mx-auto max-w-xl text-sm text-slate-700 sm:text-base">
            {profile?.bio?.trim() ? profile.bio : ''}
          </p>
        </div>

        <div className={`mt-6 grid w-full max-w-md gap-3 ${isOwnProfile ? 'grid-cols-2' : 'grid-cols-3'}`}>
          <div className="rounded-2xl bg-white/80 px-3 py-4 shadow-sm">
            <p className="text-xl font-bold text-slate-900 sm:text-2xl">{postCount}</p>
            <p className="text-xs uppercase tracking-wide text-slate-500">Bài đăng</p>
          </div>
          <div className="rounded-2xl bg-white/80 px-3 py-4 shadow-sm">
            <p className="text-xl font-bold text-slate-900 sm:text-2xl">{storyCount}</p>
            <p className="text-xs uppercase tracking-wide text-slate-500">Tin</p>
          </div>
          {!isOwnProfile ? (
            <div className="rounded-2xl bg-white/80 px-3 py-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900 sm:text-lg">
                {relationshipLabel}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Trạng thái
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 w-full max-w-md space-y-3">
          {isOwnProfile ? (
            <Button
              type="button"
              onClick={onEditProfile}
              className="w-full justify-center rounded-2xl bg-cyan-600 text-white transition hover:bg-cyan-500"
            >
              <UserRoundPen size={16} />
              Chỉnh sửa hồ sơ
            </Button>
          ) : null}

          {!isOwnProfile && relationshipLoading ? <p className="text-sm text-slate-500">Đang tải trạng thái kết bạn...</p> : null}
          {!isOwnProfile && relationshipError ? <p className="form-error">{relationshipError}</p> : null}
          {!isOwnProfile && !relationshipLoading ? <p className="text-xs text-slate-500">Trạng thái: {relationshipLabel}</p> : null}

          {!isOwnProfile && !relationshipLoading && relationship?.status === 'NotFriends' ? (
            <Button
              type="button"
              busy={relationshipBusy}
              onClick={onSendRequest}
              className="w-full justify-center rounded-2xl bg-cyan-600 text-white transition hover:bg-cyan-500"
            >
              <UserRoundPlus size={16} />
              Theo dõi / Kết bạn
            </Button>
          ) : null}

          {!isOwnProfile && !relationshipLoading && relationship?.status === 'RequestReceived' ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                busy={relationshipBusy}
                onClick={onAcceptRequest}
                className="justify-center rounded-2xl bg-emerald-600 text-white transition hover:bg-emerald-500"
              >
                <UserRoundCheck size={16} />
                Chấp nhận
              </Button>
              <Button
                type="button"
                variant="danger"
                busy={relationshipBusy}
                onClick={onDeclineRequest}
                className="justify-center rounded-2xl"
              >
                Từ chối
              </Button>
            </div>
          ) : null}

          {!isOwnProfile && !relationshipLoading && relationship?.status === 'Friends' ? (
            <Button
              type="button"
              variant="ghost"
              busy={relationshipBusy}
              onClick={onRemoveFriend}
              className="w-full justify-center rounded-2xl border border-slate-300 bg-white/80 text-slate-700 hover:bg-slate-100"
            >
              Bạn bè • Hủy kết bạn
            </Button>
          ) : null}

          {!isOwnProfile && !relationshipLoading && relationship?.status === 'RequestSent' ? (
            <Button type="button" variant="ghost" disabled className="w-full justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-500">
              Đã gửi lời mời
            </Button>
          ) : null}
        </div>
      </div>
    </motion.section>
  )
} 