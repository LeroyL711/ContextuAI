import { Loader2 } from 'lucide-react'
import React from 'react'

type Props = {
  pdf_url: string
  isLoading?: boolean
}

const PDFViewer = ({pdf_url, isLoading}: Props) => {
  if (isLoading){
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }
  return (
    <iframe src={`https://docs.google.com/gview?url=${pdf_url}&embedded=true`} className="w-full h-full">
        </iframe>
  )
}

export default PDFViewer