import { ReactElement } from 'react'
export function Button({ children, icon, onClick }): ReactElement {
  return (
    <button
      onClick={onClick}
      className="flex items-center px-4 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
    >
      {icon}

      <span className="mx-1">{children}</span>
    </button>
  )
}
