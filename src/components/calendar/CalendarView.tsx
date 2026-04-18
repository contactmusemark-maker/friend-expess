'use client'

import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatCurrency, getInitials } from '@/lib/utils'
import type { Transaction } from '@/types'

interface Props {
  transactions: Transaction[]
  currentUserId: string
}

export default function CalendarView({ transactions, currentUserId }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  // Build map: dateStr -> transactions
  const txnsByDate = new Map<string, Transaction[]>()
  for (const t of transactions) {
    const key = t.created_at.slice(0, 10)
    if (!txnsByDate.has(key)) txnsByDate.set(key, [])
    txnsByDate.get(key)!.push(t)
  }

  const selectedKey = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null
  const selectedTxns = selectedKey ? (txnsByDate.get(selectedKey) ?? []) : []

  const statusClass: Record<string, string> = {
    pending: 'badge-pending',
    partial: 'badge-partial',
    completed: 'badge-completed',
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Calendar grid */}
      <div className="lg:col-span-2 glass-card rounded-2xl border border-border/60 p-5">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-9 h-9 rounded-lg bg-secondary/60 hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h3 className="font-semibold text-foreground">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-9 h-9 rounded-lg bg-secondary/60 hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const dayTxns = txnsByDate.get(key) ?? []
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const todayFlag = isToday(day)

            const lentTotal = dayTxns
              .filter(t => t.from_user === currentUserId)
              .reduce((s, t) => s + Number(t.amount), 0)
            const borrowedTotal = dayTxns
              .filter(t => t.to_user === currentUserId)
              .reduce((s, t) => s + Number(t.amount), 0)

            return (
              <button
                key={key}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  'aspect-square rounded-xl p-1 flex flex-col items-center justify-start transition-all text-center relative',
                  !isCurrentMonth && 'opacity-25',
                  isSelected
                    ? 'bg-emerald-500/15 border border-emerald-500/30'
                    : 'hover:bg-secondary/60 border border-transparent',
                  todayFlag && !isSelected && 'border border-emerald-500/30'
                )}
              >
                <span className={cn(
                  'text-xs font-medium leading-none mb-1',
                  todayFlag ? 'text-emerald-400' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {format(day, 'd')}
                </span>
                {dayTxns.length > 0 && (
                  <div className="flex flex-col gap-0.5 w-full px-0.5">
                    {lentTotal > 0 && (
                      <div className="h-1 rounded-full bg-emerald-400/60 w-full" />
                    )}
                    {borrowedTotal > 0 && (
                      <div className="h-1 rounded-full bg-rose-400/60 w-full" />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/40">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" /> Lent
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400/60" /> Borrowed
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full border border-emerald-500/50" /> Today
          </span>
        </div>
      </div>

      {/* Day detail panel */}
      <div className="glass-card rounded-2xl border border-border/60 p-5 flex flex-col">
        <div className="mb-4">
          <h3 className="font-semibold text-foreground">
            {selectedDay ? format(selectedDay, 'EEEE, d MMMM') : 'Select a day'}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {selectedTxns.length} transaction{selectedTxns.length !== 1 ? 's' : ''}
          </p>
        </div>

        {selectedTxns.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <span className="text-3xl mb-2">📭</span>
            <p className="text-sm text-muted-foreground">No transactions on this day</p>
          </div>
        ) : (
          <div className="space-y-3 flex-1 overflow-y-auto">
            {selectedTxns.map((t) => {
              const isLender = t.from_user === currentUserId
              const other = isLender ? t.to_profile : t.from_profile
              return (
                <div key={t.id} className="bg-secondary/40 rounded-xl p-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                      {getInitials(other?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {isLender ? `Lent to ${other?.name}` : `Borrowed from ${other?.name}`}
                      </p>
                      {t.note && <p className="text-xs text-muted-foreground truncate">{t.note}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={statusClass[t.status] ?? 'badge'}>{t.status}</span>
                    <span className={`text-sm font-semibold ${isLender ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isLender ? '+' : '-'}{formatCurrency(Number(t.amount))}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Monthly summary */}
        {selectedDay && (
          <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-2 gap-3">
            {(() => {
              const monthKey = format(currentMonth, 'yyyy-MM')
              const monthTxns = transactions.filter(t => t.created_at.startsWith(monthKey))
              const monthLent = monthTxns.filter(t => t.from_user === currentUserId).reduce((s, t) => s + Number(t.amount), 0)
              const monthBorrowed = monthTxns.filter(t => t.to_user === currentUserId).reduce((s, t) => s + Number(t.amount), 0)
              return (
                <>
                  <div className="bg-emerald-500/8 border border-emerald-500/15 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Month Lent</p>
                    <p className="text-sm font-bold text-emerald-400">{formatCurrency(monthLent)}</p>
                  </div>
                  <div className="bg-rose-400/8 border border-rose-400/15 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Month Borrowed</p>
                    <p className="text-sm font-bold text-rose-400">{formatCurrency(monthBorrowed)}</p>
                  </div>
                </>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
