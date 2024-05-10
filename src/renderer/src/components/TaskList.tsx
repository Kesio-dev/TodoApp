export function TaskList({ projectId }) {
  // Здесь будет логика для отображения задач выбранного проекта
  return (
    <div className="flex-1 p-5">
      <h2 className="font-bold text-xl">Задачи</h2>
      {/* Здесь будет список задач */}
      {projectId ? <p>Задачи для проекта ID: {projectId}</p> : <p>Выберите проект</p>}
    </div>
  )
}
