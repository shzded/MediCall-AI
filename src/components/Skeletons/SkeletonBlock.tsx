import clsx from 'clsx'

interface Props {
  className?: string
}

export default function SkeletonBlock({ className }: Props) {
  return <div className={clsx('skeleton-shimmer rounded', className)} />
}
