import { Sidebar } from '../components/Sidebar'
import { Outlet, useLocation } from 'react-router-dom'

export function Layout() {
  const location = useLocation()
  return (
    <div className={'flex bg-[#f3f4f6]'}>
      <Sidebar />
      <div className={'w-full p-3'}>
        <div className={'bg-white px-4 py-2 rounded w-full border text-stone-700'}>
          {location.pathname}
        </div>
        <Outlet />
      </div>
    </div>
  )
}
