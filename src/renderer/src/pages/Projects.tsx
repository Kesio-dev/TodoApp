import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { CirclePlus } from 'lucide-react'
import clipboard from '../../public/clipboard.svg'

export function Projects() {
  // const [projects, setProjects] = useState([])
  //
  // useEffect(() => {
  //   window.electron.ipcRenderer.send("projects")
  //   window.electron.ipcRenderer.on("projects-response", (event, res) => {
  //     if (res.success) {
  //       setProjects(res.projects)
  //     } else {
  //       alert(res.error)
  //     }
  //   })
  // }, []);
  //
  // return <div className={"mt-5"}>
  //   <Button icon={<CirclePlus />}>New Project</Button>
  //   <div className={"mt-5"}>
  //     {
  //       projects.map((i, index) => {
  //         return <div className={"p-3 bg-white border w-36 flex gap-3 items-center rounded"}>
  //           <img className={"w-auto h-6"} src={clipboard} alt={""}/>
  //           {i.name}
  //         </div>
  //       })
  //     }
  //   </div>
  // </div>

  return
}
