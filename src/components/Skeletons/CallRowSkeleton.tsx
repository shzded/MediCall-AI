import SkeletonBlock from './SkeletonBlock'

export default function CallRowSkeleton() {
  return (
    <tr>
      <td className="px-4 py-3"><SkeletonBlock className="h-4 w-28" /></td>
      <td className="px-4 py-3"><SkeletonBlock className="h-4 w-24" /></td>
      <td className="px-4 py-3"><SkeletonBlock className="h-5 w-14 rounded-full" /></td>
      <td className="px-4 py-3"><SkeletonBlock className="h-4 w-32" /></td>
      <td className="px-4 py-3"><SkeletonBlock className="h-4 w-16" /></td>
      <td className="px-4 py-3"><SkeletonBlock className="h-5 w-16 rounded-full" /></td>
      <td className="px-4 py-3"><SkeletonBlock className="h-4 w-8" /></td>
    </tr>
  )
}
