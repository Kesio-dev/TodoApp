import { atom } from 'jotai'
export interface IProject {
  name: string
  img: string
  tasks: ITask[]
  _id: string
}

export interface ITask {
  title: string
  description: string
  done: boolean
  _id: string
}

export const projectsAtom = atom([])
