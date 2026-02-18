import { useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search, Filter, ChevronLeft, ChevronRight, Inbox, SearchX,
  Eye, EyeOff, Trash2, ArrowUpDown, ArrowUp, ArrowDown, X,
} from 'lucide-react'
import clsx from 'clsx'
import ErrorBoundary from '@/components/ErrorBoundary'
import UrgencyBadge from '@/components/UrgencyBadge'
import ActionDropdown from '@/components/ActionDropdown'
import CallCardSkeleton from '@/components/Skeletons/CallCardSkeleton'
import CallRowSkeleton from '@/components/Skeletons/CallRowSkeleton'
import EmptyState from '@/components/EmptyState'
import ConfirmDialog from '@/components/ConfirmDialog'
import CallDetailModal from '@/components/CallDetailModal'
import { useCalls } from '@/hooks/useCalls'
import { useDebounce } from '@/hooks/useDebounce'
import { useModal } from '@/hooks/useModal'
import { t } from '@/constants/translations'
import { PAGE_SIZE, DEBOUNCE_DELAY } from '@/constants/config'
import { formatDate } from '@/utils/date'
import { formatDuration, formatPhone } from '@/utils/format'
import type { Call } from '@/types'

type SortField = 'time' | 'urgency' | 'name'
type SortOrder = 'asc' | 'desc'

function CallsContent() {
  const [searchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const [statusFilter, setStatusFilter] = useState<'' | 'unread' | 'read'>('')
  const [urgencyFilter, setUrgencyFilter] = useState<'' | 'high' | 'medium' | 'low'>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(0)
  const [sortField, setSortField] = useState<SortField>('time')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const modal = useModal()

  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAY)

  const filters = useMemo(() => ({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    urgency: urgencyFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    skip: page * PAGE_SIZE,
    limit: PAGE_SIZE,
    sort: sortField,
    order: sortOrder,
  }), [debouncedSearch, statusFilter, urgencyFilter, dateFrom, dateTo, page, sortField, sortOrder])

  const { calls, total, loading, error, refetch, toggleStatus, removeCall } = useCalls(filters)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
    setPage(0)
  }, [sortField])

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteId !== null) {
      await removeCall(deleteId)
      setDeleteId(null)
    }
  }, [deleteId, removeCall])

  const getRowActions = (call: Call) => [
    {
      label: call.status === 'unread' ? t.calls.markRead : t.calls.markUnread,
      icon: call.status === 'unread' ? <Eye size={14} /> : <EyeOff size={14} />,
      onClick: () => toggleStatus(call),
    },
    {
      label: t.calls.delete,
      icon: <Trash2 size={14} />,
      onClick: () => setDeleteId(call.id),
      variant: 'danger' as const,
    },
  ]

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-medium-gray" />
    return sortOrder === 'asc'
      ? <ArrowUp size={14} className="text-primary-blue" />
      : <ArrowDown size={14} className="text-primary-blue" />
  }

  const hasFilters = debouncedSearch || statusFilter || urgencyFilter || dateFrom || dateTo
  const isEmpty = !loading && calls.length === 0

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm flex-1">
          <Search size={16} className="text-medium-gray flex-shrink-0" />
          <input
            type="text"
            value={searchInput}
            onChange={e => { setSearchInput(e.target.value); setPage(0) }}
            placeholder={t.calls.searchPlaceholder}
            className="bg-transparent text-sm text-dark-gray placeholder-medium-gray outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-medium-gray flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as typeof statusFilter); setPage(0) }}
            className="rounded-lg bg-white px-3 py-2 text-sm text-dark-gray shadow-sm border-0 outline-none cursor-pointer"
          >
            <option value="">{t.calls.filterStatus}: {t.calls.all}</option>
            <option value="unread">{t.calls.unread}</option>
            <option value="read">{t.calls.read}</option>
          </select>

          <select
            value={urgencyFilter}
            onChange={e => { setUrgencyFilter(e.target.value as typeof urgencyFilter); setPage(0) }}
            className="rounded-lg bg-white px-3 py-2 text-sm text-dark-gray shadow-sm border-0 outline-none cursor-pointer"
          >
            <option value="">{t.calls.filterUrgency}: {t.calls.all}</option>
            <option value="high">{t.calls.high}</option>
            <option value="medium">{t.calls.medium}</option>
            <option value="low">{t.calls.low}</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-medium-gray">{t.filters.dateFrom}</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(0) }}
            className="rounded-lg bg-white px-3 py-2 text-sm text-dark-gray shadow-sm border-0 outline-none cursor-pointer"
          />
          <label className="text-sm text-medium-gray">{t.filters.dateTo}</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(0) }}
            className="rounded-lg bg-white px-3 py-2 text-sm text-dark-gray shadow-sm border-0 outline-none cursor-pointer"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); setPage(0) }}
              className="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm text-medium-gray shadow-sm hover:bg-light-gray transition-colors"
            >
              <X size={14} />
              {t.filters.resetDates}
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-white p-6 text-center" role="alert">
          <p className="text-error-red text-sm mb-3">{t.common.error}</p>
          <button
            onClick={() => refetch().catch(() => {})}
            className="rounded-lg bg-primary-mint px-4 py-2 text-sm font-medium text-dark-gray hover:bg-primary-mint-light transition-colors"
          >
            {t.common.retry}
          </button>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-light-gray bg-primary-beige/50">
                <th scope="col" className="px-4 py-3 text-left font-medium text-medium-gray">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-dark-gray transition-colors">
                    {t.calls.name} <SortIcon field="name" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-medium-gray">{t.calls.phone}</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-medium-gray">
                  <button onClick={() => handleSort('urgency')} className="flex items-center gap-1 hover:text-dark-gray transition-colors">
                    {t.calls.urgency} <SortIcon field="urgency" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-medium-gray">
                  <button onClick={() => handleSort('time')} className="flex items-center gap-1 hover:text-dark-gray transition-colors">
                    {t.calls.time} <SortIcon field="time" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-medium-gray">{t.calls.duration}</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-medium-gray">{t.calls.status}</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-medium-gray">{t.calls.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <CallRowSkeleton key={i} />)
              ) : (
                calls.map(call => (
                  <tr
                    key={call.id}
                    onClick={() => modal.open(call.id)}
                    className={clsx(
                      'border-b border-light-gray/50 cursor-pointer hover:bg-primary-beige/30 transition-colors',
                      call.status === 'unread' && 'bg-primary-blue/5',
                    )}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter') modal.open(call.id) }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {call.status === 'unread' && <span className="h-2 w-2 rounded-full bg-primary-blue flex-shrink-0" />}
                        <span className="font-medium text-dark-gray">{call.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-medium-gray">{formatPhone(call.phone)}</td>
                    <td className="px-4 py-3"><UrgencyBadge urgency={call.urgency} /></td>
                    <td className="px-4 py-3 text-medium-gray whitespace-nowrap">{formatDate(call.time)}</td>
                    <td className="px-4 py-3 text-medium-gray">{formatDuration(call.duration)}</td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                        call.status === 'unread'
                          ? 'bg-primary-blue-light text-primary-blue'
                          : 'bg-light-gray text-medium-gray',
                      )}>
                        {call.status === 'unread' ? t.calls.unread : t.calls.read}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <ActionDropdown actions={getRowActions(call)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <CallCardSkeleton key={i} />)
        ) : (
          calls.map(call => (
            <div
              key={call.id}
              onClick={() => modal.open(call.id)}
              className={clsx(
                'rounded-xl bg-white p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow',
                call.status === 'unread' && 'border-l-4 border-l-primary-blue',
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-dark-gray">{call.name}</span>
                  {call.status === 'unread' && <span className="h-2 w-2 rounded-full bg-primary-blue" />}
                </div>
                <div onClick={e => e.stopPropagation()}>
                  <ActionDropdown actions={getRowActions(call)} />
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-medium-gray mb-2">
                <span>{formatPhone(call.phone)}</span>
                <span>{formatDate(call.time)}</span>
                <span>{formatDuration(call.duration)}</span>
              </div>
              <UrgencyBadge urgency={call.urgency} />
            </div>
          ))
        )}
      </div>

      {/* Empty states */}
      {isEmpty && (
        <div className="rounded-xl bg-white">
          {hasFilters ? (
            <EmptyState
              icon={<SearchX size={48} />}
              title={t.calls.noResults}
              description={t.calls.noResultsDesc}
            />
          ) : (
            <EmptyState
              icon={<Inbox size={48} />}
              title={t.calls.noCalls}
              description={t.calls.noCallsDesc}
            />
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && total > PAGE_SIZE && (
        <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
          <span className="text-sm text-medium-gray">
            {t.calls.page} {page + 1} {t.calls.of} {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-dark-gray hover:bg-light-gray disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              {t.calls.previous}
            </button>

            {/* Page numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i
                } else if (page < 3) {
                  pageNum = i
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + i
                } else {
                  pageNum = page - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={clsx(
                      'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                      pageNum === page
                        ? 'bg-primary-mint text-dark-gray'
                        : 'text-medium-gray hover:bg-light-gray',
                    )}
                  >
                    {pageNum + 1}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-dark-gray hover:bg-light-gray disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t.calls.next}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Confirm delete dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      {/* Call Detail Modal */}
      {modal.isOpen && modal.selectedId && (
        <CallDetailModal
          callId={modal.selectedId}
          onClose={modal.close}
          onStatusChange={() => refetch().catch(() => {})}
          onDelete={() => {
            modal.close()
            refetch().catch(() => {})
          }}
        />
      )}
    </div>
  )
}

export default function Calls() {
  return (
    <ErrorBoundary>
      <CallsContent />
    </ErrorBoundary>
  )
}
