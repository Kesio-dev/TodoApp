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
  ModalFooter,
  Input
} from '@nextui-org/react'
import { EllipsisVertical } from 'lucide-react'

export function Sidebar() {
  const [modalType, setModalType] = useState('update')
  const [counter, setCounter] = useState(0)
  const [projectId, setProjectId] = useState('')
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState('')
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()
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
  }, [counter])

  const updateProject = () => {
    window.electron.ipcRenderer.send('update-project-details', {
      projectId,
      name: title,
      img: icon
    })

    window.electron.ipcRenderer.on('update-project-details-response', (event, res) => {
      if (res.success) {
        console.log('Детали проекта успешно обновлены')
        // Добавьте здесь код для обновления интерфейса, если это необходимо
      } else {
        console.error('Ошибка при обновлении деталей проекта:', res.error)
        // Обработка ошибки, если необходимо
      }
    })
    setCounter((prev) => prev + 1)
    onClose()
  }

  const deleteProject = () => {
    window.electron.ipcRenderer.send('delete-project', projectId)

    window.electron.ipcRenderer.on('delete-project-response', (event, res) => {
      if (res.success) {
        console.log('Проект успешно удален')
        // Добавьте здесь код для обновления интерфейса, если это необходимо
      } else {
        console.error('Ошибка при удалении проекта:', res.error)
        // Обработка ошибки, если необходимо
      }
    })
    setCounter((prev) => prev + 1)
    onClose()
  }

  return (
    <aside className={"flex flex-col h-screen justify-between bg-white"}>
      <div className="flex flex-col min-w-72 w-72 px-4 py-8 overflow-y-auto border-r">
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
                        <div
                          onClick={() => {
                            setModalType('update')
                            onOpen()
                            setTitle(i.name)
                            setIcon(i.img)
                            setProjectId(i._id)
                          }}
                          className={'cursor-pointer hover:bg-gray-100 px-2 py-1 transition-all'}
                        >
                          Edit
                        </div>
                        <div
                          className={'cursor-pointer hover:bg-gray-100 px-2 py-1'}
                          onClick={() => {
                            setModalType('delete')
                            onOpen()
                            setProjectId(i._id)
                          }}
                        >
                          Delete
                        </div>
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

        <Modal isOpen={isOpen} placement={modalPlacement} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => {
              if (modalType === 'modalType') {
                return (
                  <>
                    <ModalHeader className="flex flex-col gap-1">Редактирование проекта</ModalHeader>
                    <ModalBody>
                      <p>Тут вы можете изменить название и иконку</p>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </ModalBody>
                    <ModalFooter>
                      <Button color="danger" variant="light" onPress={onClose}>
                        Закрыть
                      </Button>
                      <Button color="primary" onPress={updateProject}>
                        Обновить
                      </Button>
                    </ModalFooter>
                  </>
                )
              }
              if (modalType === 'delete') {
                return (
                  <>
                    <ModalHeader className="flex flex-col gap-1">Удаление проекта</ModalHeader>
                    <ModalBody>
                      <p>Вы уверены, что хотите удалить проект? Это удалит так же все его задания</p>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="danger" variant="light" onPress={onClose}>
                        Отмена
                      </Button>
                      <Button color="primary" onPress={deleteProject}>
                        Да, согласен
                      </Button>
                    </ModalFooter>
                  </>
                )
              }
            }}
          </ModalContent>
        </Modal>
      </div>
      <PomodoroTimer />
    </aside>
  )
}
