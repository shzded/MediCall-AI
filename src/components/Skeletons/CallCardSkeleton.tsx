import SkeletonBlock from './SkeletonBlock'

export default function CallCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="h-3 w-48" />
      </div>
      <SkeletonBlock className="h-5 w-14 rounded-full" />
      <SkeletonBlock className="h-4 w-20" />
    </div>
  )
}
