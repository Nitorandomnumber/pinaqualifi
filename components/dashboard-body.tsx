import { BatchCounterBox } from '@/components/batch-counter-box'
import { ScanResultBox } from '@/components/scan-result-box'

export function DashboardBody({
  scanTitle,
  scanStatus,
  scanFooter,
}: {
  scanTitle: string
  scanStatus: string
  scanFooter?: React.ReactNode
}) {
  return (
    <div className="grid flex-1 grid-cols-1 md:grid-cols-2 bg-white text-black overflow-y-auto">
      <div className="flex flex-col justify-center border-b border-black px-8 py-4 md:border-b-0 md:border-r border-black">
        <div className="mx-auto w-full max-w-lg">
          <ScanResultBox
            title={scanTitle}
            status={scanStatus}
            footer={scanFooter}
          />
        </div>
      </div>
      <div className="flex flex-col justify-center px-8 py-4">
        <div className="mx-auto w-full max-w-md">
          <BatchCounterBox />
        </div>
      </div>
    </div>
  )
}
