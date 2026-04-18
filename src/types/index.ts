export type Profile = {
  id: string
  name: string | null
  email: string | null
  created_at: string
}

export type Group = {
  id: string
  name: string
  created_by: string
  created_at: string
  creator?: Profile
  members?: GroupMember[]
  member_count?: number
}

export type GroupMember = {
  id: string
  group_id: string
  user_id: string
  profile?: Profile
}

export type Transaction = {
  id: string
  group_id: string
  from_user: string
  to_user: string
  amount: number
  remaining_amount: number
  note: string | null
  status: 'pending' | 'partial' | 'completed'
  created_at: string
  from_profile?: Profile
  to_profile?: Profile
  group?: Group
  repayments?: Repayment[]
}

export type Repayment = {
  id: string
  transaction_id: string
  amount_paid: number
  created_at: string
}

export type DashboardStats = {
  totalOwed: number
  totalLent: number
  netBalance: number
  friendBalances: FriendBalance[]
}

export type FriendBalance = {
  profile: Profile
  balance: number // positive = they owe you, negative = you owe them
}

export type ChartDataPoint = {
  date: string
  borrowed: number
  lent: number
}
