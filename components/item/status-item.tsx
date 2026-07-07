import { BsFillEyeSlashFill, BsFillEyeFill } from 'react-icons/bs'

interface ThisFCProps {
  status: string;
}

const StatusItem: React.FC<ThisFCProps> = ({ status }) => {
  return (
    <>
      {status === '非公開' ? (
        <BsFillEyeSlashFill className="mx-1 text-2xl text-[#737373]" />
      ) : status === '匿名' ? (
        <BsFillEyeFill className="mx-1 text-2xl text-[#737373]" />
      ) : (
        <BsFillEyeFill className="mx-1 text-2xl text-[#2aac6d]" />
      )}
      <span className="text-sm font-bold">{status}</span>
    </>
  )
}

export default StatusItem
