import SkeletonBlock from './SkeletonBlock'

export default function StatCardSkeleton() {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-10 w-10 rounded-lg" />
      </div>
      <SkeletonBlock className="h-8 w-16 mb-2" />
      <SkeletonBlock className="h-3 w-20" />
    </div>
  )
}
