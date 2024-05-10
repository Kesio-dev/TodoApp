import './assets/main.css'

import ReactDOM from 'react-dom/client'
import Project from './pages/Project'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './layouts/Layout'
import { CreateNew } from './pages/CreateNew'
import { NextUIProvider } from '@nextui-org/react'
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <div>zxc</div>
      },
      {
        path: 'projects',
        children: [
          {
            path: 'new',
            element: <CreateNew />
          },
          {
            path: ':id',
            element: <Project />
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            element: <div>settings</div>
          }
        ]
      }
    ]
  }
])
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <div>
    <NextUIProvider>
      <RouterProvider router={router} />
    </NextUIProvider>
  </div>
)
