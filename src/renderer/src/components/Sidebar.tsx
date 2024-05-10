import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAtom } from 'jotai'
import { projectsAtom } from '../store/store'
import PomodoroTimer from './Pomodoro'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '@nextui-org/react'
import { EllipsisVertical } from 'lucide-react'

export function Sidebar() {
  const [title, setTitle] = useState('')
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [modalPlacement, setModalPlacement] = useState('auto')
  const navigate = useNavigate()
  const [projects, setProjects] = useAtom(projectsAtom)
  useEffect(() => {
    window.electron.ipcRenderer.send('projects')

    window.electron.ipcRenderer.on('projects-response', (event, res) => {
      if (res.success) {
        setProjects(res.projects)
      }
    })
  }, [])
  return (
    <aside className="flex flex-col min-w-72 w-72 h-screen px-4 py-8 overflow-y-auto bg-white border-r ">
      <div className={'flex gap-3 font-bold text-xl text-gray-900'}>
        <img className="w-auto h-6 sm:h-7" src={'/pc.svg'} alt="" />
        Task Manager
      </div>

      <div className="flex flex-col justify-between flex-1 mt-6">
        <nav>
          {projects.map((i, index) => {
            return (
              <div
                className={`flex items-center px-4 py-2 text-gray-700 rounded-md ${`/projects/${i._id}` === location.pathname && 'bg-gray-100 font-semibold'}`}
              >
                <Link to={`/projects/${i._id}`} className={'flex'}>
                  <img className={'w-auto h-6'} src={`/${i.img}.svg`} alt={'clipboard'} />

                  <span className="mx-4 w-[180px] truncate">{i.name}</span>
                </Link>

                <Popover placement="bottom" showArrow={true}>
                  <PopoverTrigger>
                    <EllipsisVertical
                      className={'cursor-pointer min-w-[20px] min-h-[20px] w-[20px] h-[20px]'}
                    />
                  </PopoverTrigger>
                  <PopoverContent className={'rounded'}>
                    <div className="flex flex-col gap-1.5 py-1">
                      <div onClick={onOpen} className={'cursor-pointer hover:bg-gray-100 px-2 py-1 transition-all'}>
                        Edit
                      </div>
                      <div className={'cursor-pointer hover:bg-gray-100 px-2 py-1'}>Delete</div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )
          })}

          <Link
            className={`mt-5 flex items-center px-4 py-2 text-gray-700 rounded-md ${`/projects/new` === location.pathname && 'bg-gray-100 font-semibold'}`}
            to={`/projects/new`}
          >
            <img className={'w-auto h-6'} src={'/pencil.svg'} alt={'clipboard'} />

            <span className="mx-4">Create New</span>
          </Link>

          <hr className="my-6 border-gray-200 dark:border-gray-600" />

          <Link
            className={`flex items-center px-4 py-2 text-gray-700 rounded-md ${`/settings` === location.pathname && 'bg-gray-100 font-semibold'}`}
            to="/settings"
          >
            <img className={'w-auto h-6'} src={'/gear.svg'} alt={'clipboard'} />

            <span className="mx-4">Settings</span>
          </Link>
        </nav>
      </div>

      <PomodoroTimer />

      <Modal isOpen={isOpen} placement={modalPlacement} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Редактирование задания</ModalHeader>
              <ModalBody>
                <p>
                  Тут вы можете изменить название и иконку
                </p>
                <input value={title} onChange={(e) => setTitle(e.target.value)}/>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </aside>
  )
}
