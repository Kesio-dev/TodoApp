import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { useAtom } from 'jotai'
import { projectsAtom } from '../store/store'
import { useNavigate } from 'react-router-dom'

export function CreateNew() {
  const navigate = useNavigate()
  const [projects, setProjects] = useAtom(projectsAtom)
  const [title, setTitle] = useState('')

  const create = () => {
    window.electron.ipcRenderer.send('new-project', { name: title })
    window.electron.ipcRenderer.send('projects')

    window.electron.ipcRenderer.on('projects-response', (event, res) => {
      if (res.success) {
        setProjects(res.projects)
        navigate('/projects/' + res.projects.filter((x) => x.name === title)[0]._id)
      }
    })
  }
  return (
    <div>
      <div className={'max-w-2xl px-8 py-4 bg-white rounded-lg mt-3 border'}>
        <div className={'w-[400px] mb-3'}>
          <label htmlFor="username" className="block text-gray-500 dark:text-gray-300">
            Title
          </label>

          <input
            type="text"
            placeholder="some name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block  mt-2 w-full placeholder-gray-400/70 dark:placeholder-gray-500 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-blue-300"
          />
        </div>

        <Button onClick={create}>create</Button>
      </div>
    </div>
  )
}
