import { useState } from 'react'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { PensionerConsumptionForm } from './PensionerConsumptionForm'
import { PoliceConsumptionForm } from './PoliceConsumptionForm'

type Tab = 'pensioner' | 'police'

export function ConsumptionPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pensioner')

  return (
    <div>
      <PageHeader
        title="Consumo Diario"
        description="Registro de comidas del dia por pensionista"
      />

      {/* Tab switcher pill */}
      <div
        className="inline-flex"
        style={{
          padding: '4px',
          borderRadius: '14px',
          backgroundColor: 'rgba(99,102,241,0.08)',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={() => setActiveTab('pensioner')}
          className="cursor-pointer"
          style={{
            padding: '8px 24px',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontWeight: 600,
            border: 'none',
            transition: 'all 200ms',
            backgroundColor: activeTab === 'pensioner' ? '#ffffff' : 'transparent',
            color: activeTab === 'pensioner' ? '#4F46E5' : '#64748B',
            boxShadow: activeTab === 'pensioner' ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
          }}
        >
          Pensionistas
        </button>
        <button
          onClick={() => setActiveTab('police')}
          className="cursor-pointer"
          style={{
            padding: '8px 24px',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontWeight: 600,
            border: 'none',
            transition: 'all 200ms',
            backgroundColor: activeTab === 'police' ? '#ffffff' : 'transparent',
            color: activeTab === 'police' ? '#4F46E5' : '#64748B',
            boxShadow: activeTab === 'police' ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
          }}
        >
          Policias
        </button>
      </div>

      {activeTab === 'pensioner' ? <PensionerConsumptionForm /> : <PoliceConsumptionForm />}
    </div>
  )
}
