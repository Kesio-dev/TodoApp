import { useLocation, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

function Project() {
  const { id } = useParams()
  const [project, setProject] = useState({
    name: '',
    img: '',
    tasks: [],
    _id: ''
  })
  const [counter, setCounter] = useState(0)
  const [open, setOpen] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const getData = () => {
    window.electron.ipcRenderer.send('one-project', { _id: id })

    window.electron.ipcRenderer.on('one-project-response', (event, res) => {
      if (res.success) {
        setProject(res.projects)
      }
    })
  }

  useEffect(() => {
    getData()
  }, [id, counter])

  const createTask = () => {
    console.log({
      title: 'zxc',
      description: 'asd',
      done: false
    })
    window.electron.ipcRenderer.send('add-task-to-project', {
      _id: id,
      task: {
        title,
        description,
        done: false
      }
    })
    setTitle('')
    setDescription('')
    setCounter((prev) => prev + 1)
  }

  const completeTask = (taskId) => {
    window.electron.ipcRenderer.send('task:complete', { taskId: taskId, projectId: project._id })
    setCounter((prev) => prev + 1)
  }

  const uncompleteTask = (taskId) => {
    window.electron.ipcRenderer.send('task:uncomplete', { taskId: taskId, projectId: project._id })
    setCounter((prev) => prev + 1)
  }

  const deleteTask = (taskId) => {
    window.electron.ipcRenderer.send('delete-task-from-project', {
      taskId: taskId,
      projectId: project._id
    })
    setCounter((prev) => prev + 1)
  }

  return (
    <div className={'px-8 py-4 bg-white rounded-lg mt-3 border'}>
      <div className={'font-bold text-3xl'}>{project.name}</div>

      <div className={'mt-4'}>
        <div className={'text-xl font-semibold'}>Tasks:</div>

        <div onClick={() => setOpen(true)} className={'border rounded p-3 mt-2 cursor-pointer'}>
          <div className={'flex items-center gap-4'}>
            <div className={'cursor-pointer'}>
              <img className={'w-auto h-6'} src={'/plus.svg'} alt={''} />
            </div>

            <div className={'font-semibold'}>НОВОЕ ЗАДАНИЕ</div>
          </div>
        </div>

        {project.tasks.map((i, index) => {
          if (!i.done) {
            return (
              <div className={'border rounded p-3 mt-2'}>
                <div className={'flex items-center gap-4'}>
                  <div onClick={() => completeTask(i._id)} className={'cursor-pointer'}>
                    <img
                      src={'/cross.svg'}
                      alt={''}
                      className={'min-w-[25px] min-h-[25px] w-auto h-6'}
                    />
                  </div>

                  <div>
                    <div className={'font-semibold'}>{i.title}</div>
                    <div className={'max-h-20 overflow-y-scroll'}>{i.description}</div>
                  </div>
                </div>
              </div>
            )
          }
        })}
      </div>

      <div>
        <div className={'text-xl font-semibold mt-6'}>Competed Tasks:</div>
        {project.tasks.map((i, index) => {
          if (i.done) {
            return (
              <div className={'border rounded p-3 mt-2 opacity-40'}>
                <div className={'flex items-center gap-4'}>
                  <div onClick={() => uncompleteTask(i._id)} className={'cursor-pointer'}>
                    <img src={'/success.svg'} alt={''} className="min-w-[25px] min-h-[25px]" />
                  </div>

                  <div className={'w-auto'}>
                    <div className={'font-semibold'}>{i.title}</div>
                    <div className={'max-h-20 overflow-y-scroll'}>{i.description}</div>
                  </div>
                  <div className={'flex gap-2 cursor-pointer'}>
                    <div
                      onClick={() => {
                        setOpen(true)
                        setTitle(i.title)
                        setDescription(i.description)
                      }}
                      className={'cursor-pointer'}
                    >
                      <Pencil />
                    </div>
                    <div onClick={() => deleteTask(i._id)}>
                      <Trash2 />
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        })}
        {project.tasks.filter((x) => x.done).length === 0 && <div>тут пока пусто :(</div>}
      </div>

      <div
        className={`fixed inset-0 z-10 overflow-y-auto ${!open && 'hidden'}`}
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>

          <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg border rtl:text-right dark:bg-gray-900 sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
            <div>
              <div className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-gray-700 dark:text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>

              <div className="mt-2 text-center">
                <h3
                  className="text-lg font-medium leading-6 text-gray-800 capitalize dark:text-white"
                  id="modal-title"
                >
                  Создание нового задания
                </h3>
                <div className={'mb-3 text-left'}>
                  <label htmlFor="username" className="block text-gray-500 dark:text-gray-300">
                    Название
                  </label>

                  <input
                    type="text"
                    placeholder="Название задания"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block  mt-2 w-full placeholder-gray-400/70 dark:placeholder-gray-500 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-blue-300"
                  />
                </div>

                <div className={'mb-3 text-left'}>
                  <label htmlFor="username" className="block text-gray-500 dark:text-gray-300">
                    Описание
                  </label>

                  <textarea
                    placeholder="Описание задания"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block  mt-2 w-full  placeholder-gray-400/70 dark:placeholder-gray-500 rounded-lg border border-gray-200 bg-white px-4 h-32 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-blue-300"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <div className="sm:flex sm:items-center ">
                <button
                  onClick={() => setOpen(false)}
                  className="w-full px-4 py-2 mt-2 text-sm font-medium tracking-wide text-gray-700
            capitalize transition-colors duration-300 transform border border-gray-200 rounded-md sm:mt-0 sm:w-auto
            sm:mx-2 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 hover:bg-gray-100 focus:outline-none
            focus:ring focus:ring-gray-300 focus:ring-opacity-40"
                >
                  Отмена
                </button>

                <button
                  onClick={() => {
                    createTask()
                    setOpen(false)
                  }}
                  className="w-full px-4 py-2 mt-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-md sm:w-auto sm:mt-0 hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40"
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Project
