import { Coffee, Sun, Moon } from 'lucide-react'

interface MealCheckboxGroupProps {
  breakfast: boolean
  lunch: boolean
  dinner: boolean
  onChange: (field: 'has_breakfast' | 'has_lunch' | 'has_dinner', value: boolean) => void
  disabled?: boolean
  breakfastPrice?: string
  lunchPrice?: string
  dinnerPrice?: string
}

const meals = [
  { key: 'has_breakfast' as const, label: 'Desayuno', Icon: Coffee, priceKey: 'breakfastPrice' as const },
  { key: 'has_lunch'    as const, label: 'Almuerzo', Icon: Sun,    priceKey: 'lunchPrice'     as const },
  { key: 'has_dinner'  as const, label: 'Cena',     Icon: Moon,   priceKey: 'dinnerPrice'    as const },
]

type PriceKeys = { breakfastPrice?: string; lunchPrice?: string; dinnerPrice?: string }

export function MealCheckboxGroup({
  breakfast,
  lunch,
  dinner,
  onChange,
  disabled,
  breakfastPrice,
  lunchPrice,
  dinnerPrice,
}: MealCheckboxGroupProps) {
  const values = { has_breakfast: breakfast, has_lunch: lunch, has_dinner: dinner }
  const prices: PriceKeys = { breakfastPrice, lunchPrice, dinnerPrice }

  return (
    <div className="grid grid-cols-3" style={{ gap: '12px' }}>
      {meals.map(({ key, label, Icon, priceKey }) => {
        const active = values[key]
        const price = prices[priceKey]

        return (
          <label
            key={key}
            className="flex flex-col items-center justify-center select-none"
            style={{
              borderRadius: '16px',
              border: active ? '2px solid #6366F1' : '2px solid #E2E8F0',
              backgroundColor: active ? '#EEF2FF' : '#FAFAFA',
              boxShadow: active ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
              padding: '20px 12px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              transition: 'all 200ms',
              gap: '10px',
            }}
          >
            <input
              type="checkbox"
              checked={active}
              disabled={disabled}
              onChange={e => onChange(key, e.target.checked)}
              className="sr-only"
            />
            <div
              className="flex items-center justify-center"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: active ? '#C7D2FE' : '#F1F5F9',
                transition: 'background-color 200ms',
              }}
            >
              <Icon
                style={{
                  width: '24px',
                  height: '24px',
                  color: active ? '#4338CA' : '#94A3B8',
                  transition: 'color 200ms',
                }}
              />
            </div>
            <span
              className="text-sm font-bold text-center"
              style={{ color: active ? '#4338CA' : '#64748B', transition: 'color 200ms' }}
            >
              {label}
            </span>
            {price && (
              <span
                className="text-xs font-semibold"
                style={{ color: active ? '#6366F1' : '#94A3B8', transition: 'color 200ms' }}
              >
                {price}
              </span>
            )}
          </label>
        )
      })}
    </div>
  )
}
